// main.go
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/joho/godotenv"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/cron"
	"github.com/pocketbase/pocketbase/tools/hook"
)

var DB_URL string
var pocketbaseApp *pocketbase.PocketBase
var schedulerHTTPClient = &http.Client{Timeout: 20 * time.Second}
var coversSyncMu sync.Mutex
var resultsSyncMu sync.Mutex

func main() {
	app := pocketbase.New()
	pocketbaseApp = app

	// Load JavaScript migrations from the repository's PocketBase migration directory.
	jsvm.MustRegister(app, jsvm.Config{MigrationsDir: "pb_migrations"})
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangJS,
		Dir:          "pb_migrations",
		Automigrate:  true,
	})

	// get environment variables
	if err := godotenv.Load(); err != nil {
		// Production uses systemd environment files; a local .env is optional.
		log.Println("No local .env file loaded; using process environment")
	}
	DB_URL = os.Getenv("DB_URL")

	registerInviteRoutes(app)

	app.OnServe().Bind(&hook.Handler[*core.ServeEvent]{
		Func: func(e *core.ServeEvent) error {
			if os.Getenv("DISABLE_SCHEDULER") == "true" {
				log.Println("Scheduler disabled by DISABLE_SCHEDULER")
				return e.Next()
			}

			scheduler := cron.New()

			// FetchCoversData imports game data and bet365 spreads from Covers.
			scheduler.MustAdd("get-covers-data", "*/1 * * * *", func() {
				if !coversSyncMu.TryLock() {
					log.Println("Covers sync already running; skipping overlapping run")
					recordSkippedSchedulerRun("get-covers-data", "overlapping run")
					return
				}
				defer coversSyncMu.Unlock()
				runTrackedJob("get-covers-data", FetchCoversData)
			})
			scheduler.MustAdd("update-picks-results", "*/1 * * * *", func() {
				if !resultsSyncMu.TryLock() {
					log.Println("Results sync already running; skipping overlapping run")
					recordSkippedSchedulerRun("update-picks-results", "overlapping run")
					return
				}
				defer resultsSyncMu.Unlock()
				runTrackedJob("update-picks-results", UpdatePicksResults)
			})

			scheduler.Start()

			return e.Next()
		},
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

type CoversSyncStats struct {
	Received     int
	Fetched      int
	Created      int
	Updated      int
	NoSpread     int
	Errors       int
	TeamChecks   int
	TeamUpdated  int
	TeamNotFound int
}

// FetchCoversData discovers the current NFL and NCAAF matchup IDs from Covers,
// then imports game metadata and the latest bet365 spread for each matchup.
func FetchCoversData() {
	if !hasActiveLeagueSeason() {
		log.Println("No active league seasons; skipping game update.")
		return
	}

	var total CoversSyncStats
	updatedLogoTeams := map[string]bool{}
	for _, league := range []string{"nfl", "ncaaf"} {
		stats := CoversSyncStats{}
		ids, err := CoversGameIDs(league)
		if err != nil {
			stats.Errors++
			log.Println("Unable to discover Covers games:", league, err)
			continue
		}
		stats.Received = len(ids)
		for _, gameID := range ids {
			game, err := FetchCoversGame(gameID)
			if err != nil {
				stats.Errors++
				log.Println("Unable to fetch Covers game", gameID, err)
				continue
			}
			stats.Fetched++
			if !strings.EqualFold(game.Game.LeagueName, league) {
				stats.Errors++
				continue
			}

			for _, team := range []CoversTeam{game.Game.HomeTeam, game.Game.AwayTeam} {
				logoKey := league + ":" + strconv.Itoa(team.TeamID)
				if updatedLogoTeams[logoKey] {
					continue
				}
				updatedLogoTeams[logoKey] = true
				stats.TeamChecks++
				logoUpdated, teamFound := UpdateTeamLogo(team, league)
				if logoUpdated {
					stats.TeamUpdated++
				}
				if !teamFound {
					stats.TeamNotFound++
				}
			}

			homeSpread, awaySpread, hasSpread := LatestBet365Spread(game.Odds)
			existing, err := GetGameData(strconv.Itoa(game.Game.GameID))
			if err != nil {
				stats.Errors++
				log.Println("Error loading game by id:", err)
				continue
			}
			if !hasSpread && existing == nil {
				stats.NoSpread++
				continue
			}
			if !hasSpread && existing != nil {
				homeSpread, awaySpread = existing.HomeSpread, existing.AwaySpread
			}
			week := coversWeek(game.Game.SeasonPhase)
			if week == 0 {
				log.Println("Unable to determine provider week for game", game.Game.GameID)
				stats.Errors++
				continue
			}
			if existing != nil {
				err = UpdateGameData(game.Game, league, week, existing.ID, homeSpread, awaySpread)
			} else {
				err = CreateGameData(game.Game, league, week, homeSpread, awaySpread)
				// Handle a race or stale lookup by re-reading the record and updating it.
				if err != nil && strings.Contains(err.Error(), "validation_not_unique") {
					existing, lookupErr := GetGameData(strconv.Itoa(game.Game.GameID))
					if lookupErr == nil && existing != nil {
						err = UpdateGameData(game.Game, league, week, existing.ID, homeSpread, awaySpread)
					}
				}
			}
			if err != nil {
				stats.Errors++
				log.Println("Error saving Covers game:", game.Game.GameID, err)
			} else if existing != nil {
				stats.Updated++
			} else {
				stats.Created++
			}
		}
		logCoversStats(league, stats)
		total.Received += stats.Received
		total.Fetched += stats.Fetched
		total.Created += stats.Created
		total.Updated += stats.Updated
		total.NoSpread += stats.NoSpread
		total.Errors += stats.Errors
		total.TeamChecks += stats.TeamChecks
		total.TeamUpdated += stats.TeamUpdated
		total.TeamNotFound += stats.TeamNotFound
	}
	logCoversStats("total", total)
	setSchedulerCounts("get-covers-data", SchedulerCounts{Received: total.Received, Created: total.Created, Updated: total.Updated, Failed: total.Errors})
	log.Printf("Covers tables updated: games (created=%d, updated=%d), teams (logos_updated=%d)", total.Created, total.Updated, total.TeamUpdated)
	SyncLeagueGames()
}

func logCoversStats(league string, stats CoversSyncStats) {
	log.Printf("Covers %s: games_received=%d, games_fetched=%d, games_created=%d, games_updated=%d, games_without_spread=%d, errors=%d, team_checks=%d, teams_updated=%d, teams_not_found=%d", strings.ToUpper(league), stats.Received, stats.Fetched, stats.Created, stats.Updated, stats.NoSpread, stats.Errors, stats.TeamChecks, stats.TeamUpdated, stats.TeamNotFound)
}

func CoversGameIDs(league string) ([]string, error) {
	req, err := http.NewRequest(http.MethodGet, "https://www.covers.com/sports/"+league+"/matchups", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0")
	resp, err := schedulerHTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Covers returned HTTP %d", resp.StatusCode)
	}
	bytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	re := regexp.MustCompile(`(?i)<article[^>]+id=["']` + regexp.QuoteMeta(league) + `-(\d+)`)
	matches := re.FindAllStringSubmatch(string(bytes), -1)
	seen := map[string]bool{}
	ids := make([]string, 0, len(matches))
	for _, match := range matches {
		if !seen[match[1]] {
			seen[match[1]] = true
			ids = append(ids, match[1])
		}
	}
	sort.Strings(ids)
	return ids, nil
}

func FetchCoversGame(gameID string) (*CoversGameResponse, error) {
	endpoint := "https://www.covers.com/sport/matchupodds/linehistoryjson?gameId=" + gameID + "&location=odds&countryCode=us&oddsFormat=american&betType=spread"
	req, err := http.NewRequest(http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0")
	resp, err := schedulerHTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Covers returned HTTP %d", resp.StatusCode)
	}
	var game CoversGameResponse
	if err := json.NewDecoder(resp.Body).Decode(&game); err != nil {
		return nil, err
	}
	return &game, nil
}

func hasActiveLeagueSeason() bool {
	if pocketbaseApp == nil {
		return false
	}
	seasons, err := pocketbaseApp.FindRecordsByFilter("seasons", "status = 'ACTIVE'", "", 1, 0)
	return err == nil && len(seasons) > 0
}

func coversWeek(phase string) int {
	phase = strings.TrimSpace(strings.TrimPrefix(strings.ToLower(phase), "week"))
	week, _ := strconv.Atoi(phase)
	return week
}

// UpdatePicksResults retrieves the current application state and, if result
// updates are enabled, fetches all picks for the current week from the database.
// For each pick, it checks whether the associated game has a status of "FINAL".
// If so, the pick's result is recalculated and persisted back to the database.
//
// Notes:
//   - Picks are retrieved with game data expanded via the API.
//   - If the picks response spans multiple pages (TotalPages > 1), the function
//     aborts with a fatal log since pagination handling is not implemented.
//   - Errors encountered during data retrieval, decoding, or update operations
//     are logged and cause early returns.
//
// This function is intended to be run periodically (e.g., after games conclude)
// to ensure that user picks reflect the final game outcomes.
func UpdatePicksResults() {
	if pocketbaseApp == nil {
		log.Println("Results sync skipped: PocketBase app is unavailable")
		return
	}

	seasons, err := pocketbaseApp.FindRecordsByFilter("seasons", "status = 'ACTIVE'", "", 0, 0)
	if err != nil {
		log.Println("Unable to load active seasons:", err)
		return
	}

	checked, updated, errorsCount := 0, 0, 0
	for _, season := range seasons {
		picks, findErr := pocketbaseApp.FindRecordsByFilter("picks", "week_record.season = {:season}", "", 0, 0, dbx.Params{"season": season.Id})
		if findErr != nil {
			log.Println("Unable to load picks for season", season.Id, findErr)
			errorsCount++
			continue
		}
		currentData := ScoringConfig{RegularPointValue: float32(season.GetFloat("regular_win_points")), BinnyPointValue: float32(season.GetFloat("binny_win_points"))}
		for _, record := range picks {
			checked++
			game, gameErr := pocketbaseApp.FindRecordById("games", record.GetString("game"))
			if gameErr != nil || (game.GetString("status") != "FINAL" && game.GetString("status") != "FINAL OT") {
				continue
			}
			pick := PickDataExpand{ID: record.Id, PickSpread: float32(record.GetFloat("pick_spread")), PickType: record.GetString("pick_type"), TeamSelected: record.GetString("team_selected")}
			pick.Expand.Game = gameDataFromRecord(game)
			pick = UpdatePickResult(pick, currentData)
			record.Set("result_points", pick.ResultPoints)
			record.Set("result_text", pick.ResultText)
			if saveErr := pocketbaseApp.Save(record); saveErr != nil {
				errorsCount++
				continue
			}
			updated++
		}
	}
	setSchedulerCounts("update-picks-results", SchedulerCounts{Received: checked, Updated: updated, Failed: errorsCount})
	log.Printf("Results update: picks_checked=%d, picks_updated=%d, errors=%d", checked, updated, errorsCount)
}

func gameDataFromRecord(record *core.Record) GameData {
	return GameData{ID: record.Id, Status: record.GetString("status"), HomeScore: record.GetInt("home_score"), AwayScore: record.GetInt("away_score"), HomeSpread: float32(record.GetFloat("home_spread")), AwaySpread: float32(record.GetFloat("away_spread"))}
}
