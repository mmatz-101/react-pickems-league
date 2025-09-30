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

var DB_URL string

func main() {
	app := pocketbase.New()

	// get environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatalln("Error loading .env file")
	}
	DB_URL = os.Getenv("DB_URL")

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

	leagues := []string{"nfl", "ncaaf"}
	for _, league := range leagues {

		url := fmt.Sprintf("https://www.oddsshark.com/api/ticker/%s?_format=json", league)

		request, err := http.NewRequest("GET", url, nil)
		if err != nil {
			log.Println("Unable to create request: ", err)
			return
		}
		request.Header.Add("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0")

		client := &http.Client{}
		response, err := client.Do(request)
		if err != nil {
			log.Println("Unable to fetch oddsshark data: ", err)
			return
		}
		defer response.Body.Close()

		var gamesData OddsSharkResponse
		if err = json.NewDecoder(response.Body).Decode(&gamesData); err != nil {
			log.Println("Unable to parse response body: ", err)
		}

		for _, matches := range gamesData.Matches {
			for _, match := range matches.Matches {
				existingGame, err := GetGameData(fmt.Sprintf("%d", match.GameID))
				if err != nil {
					log.Println("Error loading game by id: ", err)
					return
				}

				// update the game if it already exists
				if existingGame != nil {
					err = UpdateGameData(match, league, currentData.Week, existingGame.ID)
					if err != nil {
						log.Println("Error updating game:", existingGame.GameID, err)
						return
					}
				}

				// create the game if it does not exist
				if existingGame == nil {
					err = CreateGameData(match, league, currentData.Week)
					if err != nil {
						log.Println("Error creating game:", match.GameID, err)
						return
					}
				}
			}
		}
	}
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
	url := fmt.Sprintf(DB_URL+"/api/collections/picks/records/?") + fmt.Sprintf("perPage=500&expand=game&filter=week=%d", currentData.Week)
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
		if pick.Expand.Game.Status == "FINAL" || pick.Expand.Game.Status == "FINAL OT" {
			pick = UpdatePickResult(pick, *currentData)
			// update the pick in the database
			err = UpdatePickData(pick)
			if err != nil {
				log.Println("Error updating pick:", pick.ID, err)
				return
			}
		}
	}
}
