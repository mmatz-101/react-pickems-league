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
import { deletePick } from "@/server/actions/picks/delete-picks";
import { toast } from "../ui/use-toast";
import { revalidatePath } from "next/cache";
import { moreInformation } from "@/server/actions/picks/more-information";

interface pickTypeTable extends pickType {
  expand: { game: gameType };
}

export const mobileColumns: ColumnDef<pickTypeTable>[] = [
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
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await deletePick({ id: pick.id });
                  toast({
                    title: "Pick Deleted",
                    description: "Your pick has been deleted.",
                    variant: "destructive",
                  });
                  revalidatePath("/user/dashboard");
                } catch (error) {
                  toast({
                    title: "Picks Closed",
                    description:
                      "Unable to delete picks. When allow picks is closed",
                    variant: "destructive",
                  });
                }
              }}
            >
              Delete Pick
            </DropdownMenuItem>
            <DropdownMenuItem>More Information</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

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
    accessorKey: "expand.game.league",
    header: "League",
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
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await deletePick({ id: pick.id });
                  toast({
                    title: "Pick Deleted",
                    description: "Your pick has been deleted.",
                    variant: "destructive",
                  });
                  revalidatePath("/user/dashboard");
                } catch (error) {
                  toast({
                    title: "Picks Closed",
                    description:
                      "Unable to delete picks. When allow picks is closed",
                    variant: "destructive",
                  });
                }
              }}
            >
              Delete Pick
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => moreInformation({ id: pick.id })}>
              More Information
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
