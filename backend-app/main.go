// main.go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/cron"
)

const PicksURL = "http://localhost:8090"

func main() {
	app := pocketbase.New()

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		scheduler := cron.New()

		// prints "Hello!" every 1 minutes
		scheduler.MustAdd("hello", "*/1 * * * *", func() {
			log.Println("Hello!")
		})

		// GetOddSharkData is a function that fetches data from OddShark and stores the data into the games table of the database.
		scheduler.MustAdd("get-oddshark-data", "*/1 * * * *", GetOddSharkData)

		scheduler.Start()

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

// GetOddSharkData is a function that fetches data from OddShark and stores the data into the games table of the database.
// This function is called every 5 minutes.
func GetOddSharkData() {
	// get the current data from the current table in database
	currentData, err := GetCurrentData()
	if err != nil {
		log.Println("Unable to get current data.", err)
		return
	}
	// If the update games is disabled, return
	if !currentData.UpdateGames {
		log.Println("Update games is disabled.")
		return
	}

	// leagueArr is an array of strings that contains the leagues that we want to fetch data
	leagueArr := []string{"nfl", "ncaaf"}
	for _, league := range leagueArr {
		// fetch the data from oddshark with the information from the current table
		url := fmt.Sprintf(`https://www.oddsshark.com/api/scores/football/%s/%d/%d/?_format=json`, league, currentData.Year, currentData.Week)
		resp, err := http.Get(url)
		if err != nil {
			log.Println("Unable to fetch oddshark data.", err)
			return
		}
		if resp.Body != nil {
			defer resp.Body.Close()
		}
		// parse the oddshark response
		gamesData := OddsSharkResponse{}
		if newErr := json.NewDecoder(resp.Body).Decode(&gamesData); newErr != nil {
			log.Println("Unable to parse response body.", newErr)
			return
		}

		// loop through OddsSharkResponse.Games and create/update the games table in the database
		for _, game := range gamesData.Games {
			// check if the game already exists in the database
			existingGame, err := GetGameData(fmt.Sprintf("%d", game.GameID))
			if err != nil {
				log.Println("Error loading game by id:", err)
				return
			}
			// update the game if it already exists
			if existingGame != nil {
				err = UpdateGameData(existingGame)
				if err != nil {
					log.Println("Error updating game:", existingGame.GameID, err)
					return
				}
			}
			// create the game if it does not exist
			if existingGame == nil {
				err = CreateGameData(game, league, currentData.Week)
				if err != nil {
					log.Println("Error creating game:", game.GameID, err)
					return
				}
			}
		}
	}
}
