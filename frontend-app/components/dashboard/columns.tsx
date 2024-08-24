"use client";

import { gameType } from "@/server/actions/picks/helpers/game-data";
import { pickType } from "@/server/actions/picks/helpers/pick-data";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import { moreInformation } from "@/server/actions/picks/more-information";

interface pickTypeTable extends pickType {
  expand: { game: gameType };
}

export const mobileColumns: ColumnDef<pickTypeTable>[] = [
  {
    header: "Team Selected",
    cell: ({ row }) => {
      const pick = row.original;
      if (pick.team_selected === "HOME") {
        return pick.expand.game.home_name;
      } else {
        return pick.expand.game.away_name;
      }
    },
  },
  {
    accessorKey: "pick_spread",
    header: "Spread",
  },
  {
    accessorKey: "pick_type",
    header: "Pick Type",
  },
  {
    id: "action",
    cell: ({ row }) => {
      const pick = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} size={"icon"}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => moreInformation({ id: pick.id })}>
              More Information
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const columns: ColumnDef<pickTypeTable>[] = [
  {
    accessorKey: "team_selected",
    header: "Team Selected",
  },
  {
    accessorKey: "pick_spread",
    header: "Spread",
  },
  {
    header: "Home Team",
    cell: ({ row }) => {
      const pick = row.original;
      if (pick.team_selected === "HOME") {
        return (
          <p className="font-bold text-primary">{pick.expand.game.home_name}</p>
        );
      } else {
        return pick.expand.game.home_name;
      }
    },
  },
  {
    header: "Away Team",
    cell: ({ row }) => {
      const pick = row.original;
      if (pick.team_selected === "AWAY") {
        return (
          <p className="font-bold text-primary">{pick.expand.game.away_name}</p>
        );
      } else {
        return pick.expand.game.away_name;
      }
    },
  },
  {
    accessorKey: "expand.game.status",
    header: "Status",
  },
  {
    accessorKey: "expand.game.league",
    header: "League",
  },
  {
    accessorKey: "pick_type",
    header: "Pick Type",
  },
  {
    accessorKey: "result_text",
    header: "Result",
  },
  {
    accessorKey: "Score",
    cell: ({ row }) => {
      const pick = row.original;
      if (pick.expand.game.status === "FINAL") {
        return (
          pick.expand.game.home_score + " - " + pick.expand.game.away_score
        );
      }
    },
  },
  {
    id: "action",
    cell: ({ row }) => {
      const pick = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} size={"icon"}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => moreInformation({ id: pick.id })}>
              More Information
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
