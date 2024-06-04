"use server";

import { DataCollectionSchema } from "@/schema/data-collection-schema";
import { createSafeActionClient } from "next-safe-action";
import { gameData, gameType } from "@/server/actions/admin/helpers/game-types";
import { pb } from "@/lib/pocketbase";
import { ClientResponseError } from "pocketbase";

const action = createSafeActionClient();


export const DataCollection = action(
  DataCollectionSchema,
  async ({ league, year, week, currentWeek }) => {
    try {
      const url = `https://www.oddsshark.com/api/scores/football/${league.toLowerCase()}/${year}/${week}?_format=json`;
      console.log(url);
      const response = await fetch(url);
      const data = await response.json();

      const gamesData: gameData[] = Object.entries(
        data.scores as Record<string, gameType>
      ).map(([id, game]) => {
        return {
          gameID: id,
          date: new Date(game.date * 1000), // convert UNIX timestamp to Date object
          status: game.eventStatus,
          tvStation: game.tvStationName,
          homeTeam: game.teams.home.names.abbreviation,
          homeSpread: game.teams.home.spread,
          awayTeam: game.teams.away.names.abbreviation,
          awaySpread: game.teams.away.spread,
        };
      });
      
      // for each game in gamesData we are going to either create or update the database
      for (const game of gamesData) {
        try {
          const gameExists = await pb.collection("games").getFirstListItem(`game_id="${game.gameID}"`)
          await pb.collection("games").update(gameExists.id, {
            "game_id": game.gameID,
            "date": game.date,
            "status": game.status,
            "home_spread": game.homeSpread,
            "away_spread": game.awaySpread,
            "home_name": game.homeTeam,
            "away_name": game.awayTeam,
            "tv_station": game.tvStation,
            "week": currentWeek,
          })
        } catch (error) {
          if (error instanceof ClientResponseError) {
            // Unable to find game in database so going to create a new entry
            await pb.collection("games").create({
              "game_id": game.gameID,
              "date": game.date,
              // "stadium": game.stadium,
              "status": game.status,
              "home_spread": game.homeSpread,
              "away_spread": game.awaySpread,
              "home_name": game.homeTeam,
              "away_name": game.awayTeam,
              // "home_score": game.homeScore,
              // "away_score": game.awayScore,
              "tv_station": game.tvStation,
              "week": currentWeek,
            })
          } else {
            // Another error occurred passing it up the chain
            return { error: "Data Collection Failed" };
          }
        }
      }
    } catch (error) {
      console.log(error);
      return { error: "Data Collection Failed" };
    }
    return { success: "Data Collected" };
  }
);