package main

import (
	"fmt"
	"log"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

// GetGameData fetches shared game data by provider game ID.
func GetGameData(gameID string) (*GameData, error) {
	records, err := pocketbaseApp.FindRecordsByFilter("games", "game_id={:gameID}", "", 1, 0, dbx.Params{"gameID": gameID})
	if err != nil {
		return nil, err
	}
	if len(records) == 0 {
		return nil, nil
	}
	record := records[0]
	return &GameData{ID: record.Id, GameID: record.GetString("game_id"), Date: record.GetString("date"), Stadium: record.GetString("stadium"), Status: record.GetString("status"), HomeSpread: float32(record.GetFloat("home_spread")), AwaySpread: float32(record.GetFloat("away_spread")), HomeTeam: record.GetString("home_team"), HomeName: record.GetString("home_name"), AwayTeam: record.GetString("away_team"), AwayName: record.GetString("away_name"), HomeScore: record.GetInt("home_score"), AwayScore: record.GetInt("away_score"), League: record.GetString("league"), TvStation: record.GetString("tv_station"), Week: record.GetInt("week"), PickWinner: record.GetString("pick_winner")}, nil
}

func UpdateGameData(game CoversGame, league string, week int, gameID string, homeSpread, awaySpread float32) error {
	record, err := pocketbaseApp.FindRecordById("games", gameID)
	if err != nil {
		return err
	}
	applyGameRequest(record, gameRequestBody(game, league, week, homeSpread, awaySpread))
	return pocketbaseApp.Save(record)
}

func CreateGameData(game CoversGame, league string, week int, homeSpread, awaySpread float32) error {
	collection, err := pocketbaseApp.FindCollectionByNameOrId("games")
	if err != nil {
		return err
	}
	record := core.NewRecord(collection)
	applyGameRequest(record, gameRequestBody(game, league, week, homeSpread, awaySpread))
	return pocketbaseApp.Save(record)
}

func applyGameRequest(record *core.Record, body GameDataRequestBody) {
	record.Set("game_id", body.GameID)
	record.Set("date", body.Date)
	record.Set("stadium", body.Stadium)
	record.Set("status", body.Status)
	record.Set("home_spread", body.HomeSpread)
	record.Set("away_spread", body.AwaySpread)
	record.Set("home_team", body.HomeTeam)
	record.Set("home_name", body.HomeName)
	record.Set("away_team", body.AwayTeam)
	record.Set("away_name", body.AwayName)
	record.Set("home_score", body.HomeScore)
	record.Set("away_score", body.AwayScore)
	record.Set("league", body.League)
	record.Set("sport", body.Sport)
	record.Set("provider_week", body.ProviderWeek)
	record.Set("tv_station", body.TvStation)
	record.Set("week", body.Week)
	record.Set("pick_winner", body.PickWinner)
}

func gameRequestBody(game CoversGame, league string, week int, homeSpread, awaySpread float32) GameDataRequestBody {
	status := strings.ToUpper(game.Status)
	return GameDataRequestBody{GameID: fmt.Sprintf("%d", game.GameID), Date: game.StartDate, Stadium: game.VenueName, Status: status, HomeSpread: homeSpread, AwaySpread: awaySpread, HomeTeam: GetTeamID(game.HomeTeam.DisplayName, league), HomeName: game.HomeTeam.DisplayName, AwayTeam: GetTeamID(game.AwayTeam.DisplayName, league), AwayName: game.AwayTeam.DisplayName, HomeScore: game.HomeTeamScore, AwayScore: game.AwayTeamScore, League: strings.ToUpper(league), Sport: strings.ToUpper(league), ProviderWeek: week, Week: week, PickWinner: GetGameWinner(status, float32(game.HomeTeamScore), homeSpread, float32(game.AwayTeamScore), awaySpread)}
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
	record, err := pocketbaseApp.FindRecordById("teams", localTeam.ID)
	if err != nil {
		return false, true
	}
	record.Set("image_src", team.Logo)
	if err := pocketbaseApp.Save(record); err != nil {
		log.Println("Unable to update team logo:", err)
		return false, true
	}
	return true, true
}

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

func GetTeamData(teamName string, league string) (*TeamData, error) {
	records, err := pocketbaseApp.FindRecordsByFilter("teams", "display_name={:teamName} && league={:league}", "", 1, 0, dbx.Params{"teamName": teamName, "league": strings.ToUpper(league)})
	if err != nil {
		return nil, err
	}
	if len(records) == 0 {
		return nil, nil
	}
	record := records[0]
	return &TeamData{ID: record.Id, NameAbbreviation: record.GetString("name_abbreviation"), DisplayName: record.GetString("display_name"), Name: record.GetString("name"), NickName: record.GetString("nick_name"), ShortName: record.GetString("short_name"), ImageSrc: record.GetString("image_src"), League: record.GetString("league")}, nil
}
