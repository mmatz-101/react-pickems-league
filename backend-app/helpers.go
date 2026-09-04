package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"

	"github.com/pocketbase/dbx"
)

// MakeRequest helper function to make a request to the database server that uses application json as the content type
func MakeRequest(req *http.Request) error {
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, reqErr := client.Do(req)
	if reqErr != nil {
		log.Println("Unable to save database data.", reqErr)
		return reqErr
	}
	defer resp.Body.Close()
	responseBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		message := strings.TrimSpace(string(responseBody))
		err := fmt.Errorf("database returned HTTP %d: %s", resp.StatusCode, message)
		log.Println("Unable to save database data.", err)
		return err
	}
	return nil
}

// GetGameData fetches the game data from the ID of the game. Will return nil, nil if there were no errors
// and the game was not found.
func GetGameData(gameID string) (*GameData, error) {
	if pocketbaseApp != nil {
		records, err := pocketbaseApp.FindRecordsByFilter("games", "game_id={:gameID}", "", 1, 0, dbx.Params{"gameID": gameID})
		if err != nil {
			return nil, err
		}
		if len(records) == 0 {
			return nil, nil
		}
		record := records[0]
		return &GameData{
			ID:         record.Id,
			GameID:     record.GetString("game_id"),
			Date:       record.GetString("date"),
			Stadium:    record.GetString("stadium"),
			Status:     record.GetString("status"),
			HomeSpread: float32(record.GetFloat("home_spread")),
			AwaySpread: float32(record.GetFloat("away_spread")),
			HomeTeam:   record.GetString("home_team"),
			HomeName:   record.GetString("home_name"),
			AwayTeam:   record.GetString("away_team"),
			AwayName:   record.GetString("away_name"),
			HomeScore:  record.GetInt("home_score"),
			AwayScore:  record.GetInt("away_score"),
			League:     record.GetString("league"),
			TvStation:  record.GetString("tv_station"),
			Week:       record.GetInt("week"),
			PickWinner: record.GetString("pick_winner"),
		}, nil
	}

	resp, err := http.Get(fmt.Sprintf(DB_URL+`/api/collections/games/records/?filter=game_id="%s"`, gameID))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unable to find game: database returned HTTP %d", resp.StatusCode)
	}
	record := GamesDataResponse{}
	if err := json.NewDecoder(resp.Body).Decode(&record); err != nil {
		return nil, err
	}
	if len(record.Items) == 0 {
		return nil, nil
	}
	return &record.Items[0], nil
}

// UpdateGameData updates the game's data in the games database
func UpdateGameData(game CoversGame, league string, week int, gameID string, homeSpread, awaySpread float32) error {
	reqBody := gameRequestBody(game, league, week, homeSpread, awaySpread)

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		log.Fatalf("Error marshalling JSON: %v", err)
		return err
	}
	req, errReq := http.NewRequest(http.MethodPatch, fmt.Sprintf(DB_URL+"/api/collections/games/records/%s", gameID), strings.NewReader(string(jsonData)))
	if errReq != nil {
		log.Println("Unable to create request.", errReq)
		return errReq
	}
	dbErr := MakeRequest(req)
	if dbErr != nil {
		log.Println("Unable to make request.", dbErr)
		return dbErr
	}

	return nil
}

// CreateGameData creates a new game in the games database
func CreateGameData(game CoversGame, league string, week int, homeSpread, awaySpread float32) error {
	reqBody := gameRequestBody(game, league, week, homeSpread, awaySpread)

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		log.Fatalf("Error marshalling JSON: %v", err)
		return err
	}
	req, errReq := http.NewRequest(http.MethodPost, DB_URL+"/api/collections/games/records", strings.NewReader(string(jsonData)))
	if errReq != nil {
		log.Println("Unable to create request.", errReq)
		return errReq
	}
	dbErr := MakeRequest(req)
	if dbErr != nil {
		log.Println("Unable to make request.", dbErr)
		return dbErr
	}

	return nil
}

func gameRequestBody(game CoversGame, league string, week int, homeSpread, awaySpread float32) GameDataRequestBody {
	status := strings.ToUpper(game.Status)
	if status == "FINAL" {
		status = "FINAL"
	}
	return GameDataRequestBody{
		GameID:       fmt.Sprintf("%d", game.GameID),
		Date:         game.StartDate,
		Stadium:      game.VenueName,
		Status:       status,
		HomeSpread:   homeSpread,
		AwaySpread:   awaySpread,
		HomeTeam:     GetTeamID(game.HomeTeam.DisplayName, league),
		HomeName:     game.HomeTeam.DisplayName,
		AwayTeam:     GetTeamID(game.AwayTeam.DisplayName, league),
		AwayName:     game.AwayTeam.DisplayName,
		HomeScore:    game.HomeTeamScore,
		AwayScore:    game.AwayTeamScore,
		League:       strings.ToUpper(league),
		Sport:        strings.ToUpper(league),
		ProviderWeek: week,
		Week:         week,
		PickWinner:   GetGameWinner(status, float32(game.HomeTeamScore), homeSpread, float32(game.AwayTeamScore), awaySpread),
	}
}

func LatestBet365Spread(books []CoversBookOdds) (float32, float32, bool) {
	var latest CoversSpreadHistory
	found := false
	for _, book := range books {
		if !strings.EqualFold(book.SportsbookName, "bet365") {
			continue
		}
		for _, line := range book.SpreadHistory {
			if line.Spread == 0 || line.OddsDate == "" {
				continue
			}
			if !found || line.OddsDate > latest.OddsDate {
				latest, found = line, true
			}
		}
	}
	if !found {
		return 0, 0, false
	}
	return latest.Spread, -latest.Spread, true
}

func UpdateTeamLogo(team CoversTeam, league string) (bool, bool) {
	localTeam, err := GetTeamData(team.DisplayName, league)
	if err != nil || localTeam == nil || team.Logo == "" {
		return false, false
	}
	if localTeam.ImageSrc == team.Logo {
		return false, true
	}
	body, err := json.Marshal(map[string]string{"image_src": team.Logo})
	if err != nil {
		return false, true
	}
	req, err := http.NewRequest(http.MethodPatch, DB_URL+"/api/collections/teams/records/"+localTeam.ID, strings.NewReader(string(body)))
	if err != nil {
		return false, true
	}
	if err := MakeRequest(req); err != nil {
		log.Println("Unable to update team logo:", err)
		return false, true
	}
	return true, true
}

// GetTeamID fetches the team ID from the team server
func GetTeamID(teamName string, league string) string {
	team, err := GetTeamData(teamName, league)
	if err != nil {
		log.Println("Error loading team data.", err)
		return ""
	}
	if team == nil {
		return ""
	}
	return team.ID
}

// GetTeamData fetches the team data from the team server
func GetTeamData(teamName string, league string) (*TeamData, error) {
	league = strings.ToUpper(league) // verify that league is upper case
	if pocketbaseApp != nil {
		records, err := pocketbaseApp.FindRecordsByFilter("teams", "display_name={:teamName} && league={:league}", "", 1, 0, dbx.Params{"teamName": teamName, "league": league})
		if err != nil {
			return nil, err
		}
		if len(records) == 0 {
			return nil, nil
		}
		record := records[0]
		return &TeamData{
			ID:               record.Id,
			NameAbbreviation: record.GetString("name_abbreviation"),
			DisplayName:      record.GetString("display_name"),
			Name:             record.GetString("name"),
			NickName:         record.GetString("nick_name"),
			ShortName:        record.GetString("short_name"),
			ImageSrc:         record.GetString("image_src"),
			League:           record.GetString("league"),
		}, nil
	}
	filterURL := DB_URL + "/api/collections/teams/records/" + "?filter=(" + url.QueryEscape(fmt.Sprintf(`display_name="%s"`, teamName)) + url.QueryEscape(" && ") + url.QueryEscape(fmt.Sprintf(`league="%s"`, league)) + ")"
	resp, err := http.Get(filterURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unable to find team: database returned HTTP %d", resp.StatusCode)
	}
	record := TeamDataResponse{}
	if err := json.NewDecoder(resp.Body).Decode(&record); err != nil {
		return nil, err
	}
	if len(record.Items) == 0 {
		return nil, nil
	}
	return &record.Items[0], nil
}

// GetGameWinner returns the winner of the game or empty string if the game isn't final
func GetGameWinner(status string, homeScore, homeSpread, awayScore, awaySpread float32) string {
	if status != "FINAL" {
		return ""
	}
	if homeScore-homeSpread > awayScore {
		return "HOME"
	} else if awayScore-awaySpread > homeScore {
		return "AWAY"
	} else {
		return "PUSH"
	}
}

// UpdatePickData updates the pick data in the datebase
func UpdatePickData(pick PickDataExpand) error {
	jsonData, err := json.Marshal(pick)
	if err != nil {
		log.Fatalf("Error marshalling JSON: %v", err)
	}

	req, errReq := http.NewRequest(http.MethodPatch, fmt.Sprintf(DB_URL+"/api/collections/picks/records/%s", pick.ID), strings.NewReader(string(jsonData)))
	if errReq != nil {
		log.Println("Unable to create request.", errReq)
		return errReq
	}

	dbErr := MakeRequest(req)
	if dbErr != nil {
		log.Println("Unable to make request.", dbErr)
		return dbErr
	}
	return nil
}

// UpdatePickResult updates the pick struct based on the spread at the time of the pick
func UpdatePickResult(pick PickDataExpand, currentData ScoringConfig) PickDataExpand {
	// Determine the points based on which team was selected and the spread.
	switch pick.TeamSelected {
	case "HOME":
		adjusted := pick.PickSpread + float32(pick.Expand.Game.HomeScore)
		opponent := float32(pick.Expand.Game.AwayScore)

		switch {
		case adjusted > opponent:
			pick.ResultPoints = currentData.RegularPointValue
			pick.ResultText = "WIN"
			if pick.PickType == "BINNY" {
				pick.ResultPoints = currentData.BinnyPointValue
			}
		case adjusted == opponent:
			pick.ResultPoints = currentData.RegularPointValue / 2
			pick.ResultText = "PUSH"
			if pick.PickType == "BINNY" {
				pick.ResultPoints = 0
			}
		default:
			pick.ResultPoints = 0
			pick.ResultText = "LOST"
			if pick.PickType == "BINNY" {
				pick.ResultPoints = -currentData.BinnyPointValue
			}
		}

	case "AWAY":
		adjusted := pick.PickSpread + float32(pick.Expand.Game.AwayScore)
		opponent := float32(pick.Expand.Game.HomeScore)

		switch {
		case adjusted > opponent:
			pick.ResultPoints = currentData.RegularPointValue
			pick.ResultText = "WIN"
			if pick.PickType == "BINNY" {
				pick.ResultPoints = currentData.BinnyPointValue
			}
		case adjusted == opponent:
			pick.ResultPoints = currentData.RegularPointValue / 2
			pick.ResultText = "PUSH"
			if pick.PickType == "BINNY" {
				pick.ResultPoints = 0
			}
		default:
			pick.ResultPoints = 0
			pick.ResultText = "LOST"
			if pick.PickType == "BINNY" {
				pick.ResultPoints = -currentData.BinnyPointValue
			}
		}
	}

	return pick
}
