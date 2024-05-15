"use server";

import { DataCollectionSchema } from "@/types/data-collection-schema";
import { createSafeActionClient } from "next-safe-action";

const action = createSafeActionClient();

export const DataCollection = action(
  DataCollectionSchema,
  async ({ league, year, week, currentWeek }) => {
    try {
        const url = `https://oddsharkhttps://www.oddsshark.com/api/scores/football/${league.toLowerCase()}/${year}/${week}?_format=json`
    } catch (error) {
      return { error: "Data Collection Failed" };
    }
    return { success: "Data Collected" };
  }
);
