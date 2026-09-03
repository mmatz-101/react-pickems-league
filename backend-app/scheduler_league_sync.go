package main

import (
	"log"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

// SyncLeagueGames assigns shared provider games to every active league whose
// week date window contains the game's scheduled date. Existing assignments
// are preserved so commissioner overrides are not overwritten.
func SyncLeagueGames() {
	if pocketbaseApp == nil {
		log.Println("League-game sync skipped: PocketBase app is unavailable")
		return
	}

	leagues, err := pocketbaseApp.FindRecordsByFilter("leagues", "status = 'ACTIVE'", "", 0, 0)
	if err != nil {
		log.Println("Unable to load active leagues:", err)
		return
	}
	games, err := pocketbaseApp.FindAllRecords("games")
	if err != nil {
		log.Println("Unable to load shared games:", err)
		return
	}
	leagueGames, err := pocketbaseApp.FindAllRecords("league_games")
	if err != nil {
		log.Println("Unable to load league games:", err)
		return
	}

	existing := map[string]bool{}
	for _, record := range leagueGames {
		existing[record.GetString("league")+":"+record.GetString("game")] = true
	}

	created := 0
	for _, league := range leagues {
		seasons, err := pocketbaseApp.FindRecordsByFilter("seasons", "league = {:league} && status = 'ACTIVE'", "", 0, 0, dbx.Params{"league": league.Id})
		if err != nil {
			log.Println("Unable to load seasons for league", league.Id, err)
			continue
		}
		for _, season := range seasons {
			weeks, err := pocketbaseApp.FindRecordsByFilter("weeks", "season = {:season}", "number", 0, 0, dbx.Params{"season": season.Id})
			if err != nil {
				log.Println("Unable to load weeks for season", season.Id, err)
				continue
			}
			for _, game := range games {
				date := game.GetString("date")
				for _, week := range weeks {
					if date < week.GetString("start_date") || date >= week.GetString("end_date") {
						continue
					}
					key := league.Id + ":" + game.Id
					if existing[key] || !gameIncluded(game, week) {
						continue
					}
					leagueGamesCollection, err := pocketbaseApp.FindCollectionByNameOrId("league_games")
					if err != nil {
						log.Println("Unable to load league_games collection:", err)
						continue
					}
					record := core.NewRecord(leagueGamesCollection)
					record.Set("league", league.Id)
					record.Set("game", game.Id)
					record.Set("week", week.Id)
					record.Set("included", true)
					record.Set("manual_override", false)
					if err := pocketbaseApp.Save(record); err != nil {
						log.Println("Unable to create league game:", err)
						continue
					}
					existing[key] = true
					created++
				}
			}
		}
	}
	log.Printf("League-game sync created %d assignments.", created)
}

func gameIncluded(game *core.Record, week *core.Record) bool {
	return strings.TrimSpace(game.GetString("date")) != "" && strings.TrimSpace(week.GetString("start_date")) != "" && strings.TrimSpace(week.GetString("end_date")) != ""
}
