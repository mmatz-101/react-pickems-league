package main

import (
	"log"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

// AdvanceCompletedLeagueWeeks keeps a league's schedule moving without a
// commissioner having to interpret or change internal week statuses. A week is
// complete only after it has at least one included league game and every one of
// those games has a final, scoreable result. The next scheduled SETUP week then
// becomes the single current, pickable week.
func AdvanceCompletedLeagueWeeks() {
	if pocketbaseApp == nil {
		return
	}

	seasons, err := pocketbaseApp.FindRecordsByFilter("seasons", "status = 'ACTIVE'", "", 0, 0)
	if err != nil {
		log.Println("Unable to load active seasons for week advancement:", err)
		return
	}
	for _, season := range seasons {
		advanceSeasonWeek(season)
	}
}

func advanceSeasonWeek(season *core.Record) {
	weeks, err := pocketbaseApp.FindRecordsByFilter("weeks", "season = {:season}", "number", 0, 0, dbx.Params{"season": season.Id})
	if err != nil {
		log.Println("Unable to load weeks for lifecycle advancement:", err)
		return
	}

	var current *core.Record
	for _, week := range weeks {
		if week.GetBool("is_current") {
			current = week
			break
		}
	}
	if current == nil || (current.GetString("status") != "OPEN" && current.GetString("status") != "LOCKED") {
		return
	}
	complete, err := isLeagueWeekComplete(season.GetString("league"), current.Id)
	if err != nil || !complete {
		if err != nil {
			log.Println("Unable to determine week completion:", err)
		}
		return
	}

	current.Set("status", "COMPLETED")
	current.Set("allow_picks", false)
	var next *core.Record
	for _, candidate := range weeks {
		if candidate.GetInt("number") > current.GetInt("number") && candidate.GetString("status") == "SETUP" {
			next = candidate
			break
		}
	}
	if next == nil {
		// Keep the completed week current so league pages remain available while
		// the commissioner adds the next scheduled week.
		if err := pocketbaseApp.Save(current); err != nil {
			log.Println("Unable to complete week:", err)
		}
		return
	}

	for _, week := range weeks {
		week.Set("is_current", week.Id == next.Id)
		if week.Id == next.Id {
			week.Set("status", "OPEN")
			week.Set("allow_picks", true)
		}
		if err := pocketbaseApp.Save(week); err != nil {
			log.Println("Unable to advance league week:", err)
			return
		}
	}
	log.Printf("Advanced season %s from week %d to week %d", season.Id, current.GetInt("number"), next.GetInt("number"))
}

func isLeagueWeekComplete(leagueID, weekID string) (bool, error) {
	leagueGames, err := pocketbaseApp.FindRecordsByFilter("league_games", "league = {:league} && week = {:week} && included = true", "", 0, 0, dbx.Params{"league": leagueID, "week": weekID})
	if err != nil || len(leagueGames) == 0 {
		return false, err
	}
	for _, leagueGame := range leagueGames {
		game, findErr := pocketbaseApp.FindRecordById("games", leagueGame.GetString("game"))
		if findErr != nil || !IsGameComplete(game.GetString("status")) {
			return false, findErr
		}
	}
	return true, nil
}
