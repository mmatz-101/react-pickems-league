// main.go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/cron"
)

func main() {
	app := pocketbase.New()

	// Get env variables
	err := godotenv.Load("./.env")
	if err != nil {
		log.Fatal("Error loading .env file", err)
	}

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		scheduler := cron.New()

		// prints "Hello!" every 1 minutes
		scheduler.MustAdd("hello", "*/1 * * * *", func() {
			log.Println("Hello!")
		})

		// GetOddSharkData is a function that fetches data from OddShark and stores the data into the games table of the database.
		scheduler.MustAdd("get-oddshark-data", "*/1 * * * *", GetOddSharkData)
		scheduler.MustAdd("update-picks-results", "*/1 * * * *", UpdatePicksResults)

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
		var url string
		if league == "nfl" {
			url = fmt.Sprintf(`https://www.oddsshark.com/api/scores/football/%s/%d/%s/?_format=json`, league, currentData.Year, currentData.NFLWeekSearch)
		} else {
			url = fmt.Sprintf(`https://www.oddsshark.com/api/scores/football/%s/%d/%s/?_format=json`, league, currentData.Year, currentData.NCAAFWeekSearch)
		}
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
				err = UpdateGameData(game, league, currentData.Week, existingGame.ID)
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

// UpdatePicksResults
func UpdatePicksResults() {
	// get the current data from the current table in database
	currentData, err := GetCurrentData()
	if err != nil {
		log.Println("Unable to get current data.", err)
		return
	}
	// If the update results is disabled, return
	if !currentData.UpdateResults {
		log.Println("Update results is disabled.")
		return
	}

	// get all the picks from the picks table in the database
	url := fmt.Sprintf(os.Getenv("DB_URL")+"/api/collections/picks/records/?") + fmt.Sprintf("perPage=500&expand=game&filter=week=%d", currentData.Week)
	resp, err := http.Get(url)
	if err != nil {
		log.Println("Unable to get games data.", err)
		return
	}

	defer resp.Body.Close()

	picksData := PickDataExpandResponse{}
	if newErr := json.NewDecoder(resp.Body).Decode(&picksData); newErr != nil {
		log.Println("Unable to parse picks response body.", newErr)
		return
	}

	if picksData.TotalPages > 1 {
		log.Fatal("Total picks per page is too big for this function. Need addional steps.")
	}

	// loop through PickDataResponse.Items and update the picks table in the database
	for _, pick := range picksData.Items {
		// check if the game is FINAL
		if pick.Expand.Game.Status != "FINAL" {
			continue
		}

		pick = UpdatePickResult(pick, *currentData)
		// update the pick in the database
		err = UpdatePickData(pick)
		if err != nil {
			log.Println("Error updating pick:", pick.ID, err)
			return
		}
	}
}
