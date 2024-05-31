"use server";

import { DataCollectionSchema } from "@/types/data-collection-schema";
import { createSafeActionClient } from "next-safe-action";
import { gameData, gameType } from "@/server/actions/admin/helpers/game-types";
import { games } from "@/server/schema";
import { db } from "@/server";
import { eq } from "drizzle-orm";

const action = createSafeActionClient();


export const DataCollection = action(
  DataCollectionSchema,
  async ({ league, year, week, currentWeek }) => {
    try {
      const url = `https://www.oddsshark.com/api/scores/football/${league.toLowerCase()}/${year}/${week}?_format=json`;
      console.log(url);
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);

      const gamesData: gameData[] = Object.entries(
        data.scores as Record<string, gameType>
      ).map(([id, game]) => {
        return {
          id: id,
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
        const gameExists = await db.query.games.findFirst({
          where: eq(games.id, game.id)
        });
        if (gameExists) {
          await db.update(games).set({
            league,
            year: parseInt(year),
            week: parseInt(week),
            date: game.date,
            status: game.status,
            tvStation: game.tvStation,
            homeTeam: game.homeTeam,
            homeSpread: game.homeSpread,
            awayTeam: game.awayTeam,
            awaySpread: game.awaySpread,
          }).where(eq(games.id, game.id));
        } else {
          await db.insert(games).values({
            id: game.id,
            league,
            year: parseInt(year),
            week: parseInt(currentWeek), // currentWeek is the week to sync NFL/NCAAF
            date: game.date,
            status: game.status,
            tvStation: game.tvStation,
            homeTeam: game.homeTeam,
            homeSpread: game.homeSpread,
            awayTeam: game.awayTeam,
            awaySpread: game.awaySpread,
          })
        }
      }
    } catch (error) {
      console.log(error);
      return { error: "Data Collection Failed" };
    }
    return { success: "Data Collected" };
  }
);