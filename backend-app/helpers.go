package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

// MakeRequest helper function to make a request to the database server that uses application json as the content type
func MakeRequest(req *http.Request) error {
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	_, reqErr := client.Do(req)
	if reqErr != nil {
		log.Println("Unable to save game data.", reqErr)
		return reqErr
	}
	return nil
}

// GetCurrentData fetches the current data from the database server
func GetCurrentData() (*CurrentData, error) {
	// collect the id of the currentData
	resp, err := http.Get(os.Getenv("DB_URL") + "/api/collections/current/records")
	if err != nil {
		log.Println("Unable to get current table from database server error.")
		return nil, err
	}
	if resp.Body != nil {
		defer resp.Body.Close()
	}

	body, readErr := io.ReadAll(io.Reader(resp.Body))
	if readErr != nil {
		log.Println("Unable to read response body.", readErr)
		return nil, readErr
	}

	data := CurrentDataResponse{}
	jsonErr := json.Unmarshal(body, &data)
	if jsonErr != nil {
		log.Println("Unable to parse response body.", jsonErr)
		return nil, jsonErr
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("Error getting current data: %d", resp.StatusCode)
	}

	if len(data.Items) == 0 {
		return nil, fmt.Errorf("No current data found in DB.")
	}

	return &data.Items[0], nil
}

// GetGame fetches the game data from the ID of the game. Will return nil, nil if there were no errors
// and the game was not found.
func GetGameData(gameID string) (*GameData, error) {
	resp, err := http.Get(fmt.Sprintf(os.Getenv("DB_URL")+`/api/collections/games/records/?filter=game_id="%s"`, gameID))
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	record := GamesDataResponse{}
	jsonErr := json.NewDecoder(resp.Body).Decode(&record)
	if jsonErr != nil {
		return nil, jsonErr
	}

	if len(record.Items) == 0 {
		return nil, nil
	}

	return &record.Items[0], nil
}

// UpdateGameData updates the game's data in the games database
func UpdateGameData(game OddsSharkGame, league string, week int, gameID string) error {
	date := time.Unix(game.Date, 0)
	formattedDate := date.Format("2006-01-02 15:04:05Z")
	reqBody := GameDataRequestBody{
		GameID:     string(game.GameID),
		Date:       formattedDate,
		Stadium:    game.StadiumInfo.Name,
		Status:     game.Status,
		HomeSpread: game.Teams.Home.Spread,
		AwaySpread: game.Teams.Away.Spread,
		HomeTeam:   GetTeamID(game.Teams.Home.Names.Name),
		HomeName:   game.Teams.Home.Names.Name,
		AwayTeam:   GetTeamID(game.Teams.Away.Names.Name),
		AwayName:   game.Teams.Away.Names.Name,
		HomeScore:  game.Teams.Home.Score,
		AwayScore:  game.Teams.Away.Score,
		League:     strings.ToUpper(league),
		TvStation:  game.TvStationName,
		Week:       week,
		PickWinner: GetGameWinner(game.Status, float32(game.Teams.Home.Score), game.Teams.Home.Spread, float32(game.Teams.Away.Score), game.Teams.Away.Spread),
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		log.Fatalf("Error marshalling JSON: %v", err)
		return err
	}
	req, errReq := http.NewRequest(http.MethodPatch, fmt.Sprintf(os.Getenv("DB_URL")+"/api/collections/games/records/%s", gameID), strings.NewReader(string(jsonData)))
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
func CreateGameData(game OddsSharkGame, league string, week int) error {
	date := time.Unix(game.Date, 0)
	formattedDate := date.Format("2006-01-02 15:04:05Z")
	reqBody := GameDataRequestBody{
		GameID:     fmt.Sprintf("%d", game.GameID),
		Date:       formattedDate,
		Stadium:    game.StadiumInfo.Name,
		Status:     game.Status,
		HomeSpread: game.Teams.Home.Spread,
		AwaySpread: game.Teams.Away.Spread,
		HomeTeam:   GetTeamID(game.Teams.Home.Names.Name),
		HomeName:   game.Teams.Home.Names.Name,
		AwayTeam:   GetTeamID(game.Teams.Away.Names.Name),
		AwayName:   game.Teams.Away.Names.Name,
		HomeScore:  game.Teams.Home.Score,
		AwayScore:  game.Teams.Away.Score,
		League:     strings.ToUpper(league),
		TvStation:  game.TvStationName,
		Week:       week,
		PickWinner: GetGameWinner(game.Status, float32(game.Teams.Home.Score), game.Teams.Home.Spread, float32(game.Teams.Away.Score), game.Teams.Away.Spread),
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		log.Fatalf("Error marshalling JSON: %v", err)
		return err
	}
	req, errReq := http.NewRequest(http.MethodPost, os.Getenv("DB_URL")+"/api/collections/games/records", strings.NewReader(string(jsonData)))
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

// GetTeamID fetches the team ID from the team server
func GetTeamID(teamName string) string {
	team, err := GetTeamData(teamName)
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
func GetTeamData(teamName string) (*TeamData, error) {
	url := os.Getenv("DB_URL") + "/api/collections/teams/records/" + "?filter=(" + url.QueryEscape(fmt.Sprintf(`name="%s"`, teamName)) + ")"
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()
	record := TeamDataResponse{}
	jsonErr := json.NewDecoder(resp.Body).Decode(&record)
	if jsonErr != nil {
		return nil, jsonErr
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

	req, errReq := http.NewRequest(http.MethodPatch, fmt.Sprintf(os.Getenv("DB_URL")+"/api/collections/picks/records/%s", pick.ID), strings.NewReader(string(jsonData)))
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
func UpdatePickResult(pick PickDataExpand, currentData CurrentData) PickDataExpand {
	// check the spread against the spread at the time of the pick not against the current pick line.
	if pick.TeamSelected == "HOME" {
		if pick.PickSpread-float32(pick.Expand.Game.HomeScore) > float32(pick.Expand.Game.AwayScore) {
			pick.ResultPoints = currentData.RegularPointValue
			pick.ResultText = "WIN"
			if pick.PickType == "BINNY" {
				pick.ResultPoints = currentData.BinnyPointValue
			}
		} else if pick.PickSpread-float32(pick.Expand.Game.HomeScore) == float32(pick.Expand.Game.AwayScore) {
			pick.ResultPoints = currentData.RegularPointValue / 2
			pick.ResultText = "PUSH"
			if pick.PickType == "BINNY" {
				pick.ResultPoints = 0
			}
		} else {
			pick.ResultPoints = 0
			pick.ResultText = "LOST"
			if pick.PickType == "BINNY" {
				pick.ResultPoints = -currentData.BinnyPointValue
			}
		}
	} else if pick.TeamSelected == "AWAY" {
		if pick.PickSpread-float32(pick.Expand.Game.AwayScore) > float32(pick.Expand.Game.HomeScore) {
			pick.ResultPoints = currentData.RegularPointValue
			pick.ResultText = "WIN"
			if pick.PickType == "BINNY" {
				pick.ResultPoints = currentData.BinnyPointValue
			}
		} else if pick.PickSpread-float32(pick.Expand.Game.AwayScore) == float32(pick.Expand.Game.HomeScore) {
			pick.ResultPoints = currentData.RegularPointValue / 2
			pick.ResultText = "PUSH"
			if pick.PickType == "BINNY" {
				pick.ResultPoints = 0
			}
		} else {
			pick.ResultPoints = 0
			pick.ResultText = "LOST"
			if pick.PickType == "BINNY" {
				pick.ResultPoints = -currentData.BinnyPointValue
			}
		}
	}

	return pick
}
