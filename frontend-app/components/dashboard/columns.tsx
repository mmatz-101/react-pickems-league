"use client"

import { gameType } from "@/server/actions/picks/helpers/game-data";
import { pickType } from "@/server/actions/picks/helpers/pick-data";
import {ColumnDef} from "@tanstack/react-table"

interface pickTypeTable extends pickType {
  expand: { game: gameType };
}

export const columns: ColumnDef<pickTypeTable>[] = [
    {
        accessorKey: "expand.game.home_name",
        header: "Home Team",
    },
    {
        accessorKey: "expand.game.away_name",
        header: "Away Team",
    },
    {
        accessorKey: "team_selected",
        header: "Team Selected",
    },
    {
        accessorKey: "pick_type",
        header: "Pick Type",
    },
]