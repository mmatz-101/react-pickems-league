"use client";

import { userTeamType } from "@/server/actions/picks/helpers/pick-data";
import { ColumnDef } from "@tanstack/react-table";

export type weeklyColumnsType = {
  user_team: string;
  week_winner: string;
  expand: { user_team: userTeamType };
};

export const weeklyColumns: ColumnDef<weeklyColumnsType>[] = [
  {
    accessorKey: "user_team",
    header: "Name",
    accessorFn: (row) => row.expand.user_team.team_name,
  },
  {
    accessorKey: "week_winner",
    header: "Week Winner",
  },
];
