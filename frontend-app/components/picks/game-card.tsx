"use client";

import { gameType } from "@/server/picks/helpers/game-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "../ui/card";
import { BellRing } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { submitPick } from "@/server/actions/picks/submit-pick";
import { z } from "zod";

export default function GameCard({ game }: { game: gameType }) {
  const [homeTeamSelected, setHomeTeamSelected] = useState(false);
  function homeTeamClick() {
    if (!homeTeamSelected) {
      setHomeTeamSelected(true);
      setAwayTeamSelected(false);
    } else {
      setHomeTeamSelected(false);
      setAwayTeamSelected(false);
    }
  }
  const [awayTeamSelected, setAwayTeamSelected] = useState(false);
  function awayTeamClick() {
    if (!awayTeamSelected) {
      setAwayTeamSelected(true);
      setHomeTeamSelected(false);
    } else {
      setAwayTeamSelected(false);
      setHomeTeamSelected(false);
    }
  }

  const pickTypeSchema = z.enum(["REGULAR", "BINNY"]);
  const [pickTypeSelected, setPickTypeSelected] =
    useState<z.infer<typeof pickTypeSchema>>("REGULAR");

  const { execute, result } = useAction(submitPick, {
    onSuccess: (data) => {
      console.log(result);
      console.log(data);
    },
    onError: (data) => {
      console.log(result);
      console.log(data);
    },
  });
  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex justify-between">
          <span>{game.tv_station}</span>
          <span>{game.date}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div
          onClick={homeTeamClick}
          className={`flex items-center space-x-4 rounded-md border p-4 hover:bg-primary/5 cursor-pointer ${
            homeTeamSelected ? "bg-primary/25 hover:bg-primary/30" : ""
          }`}
        >
          <BellRing />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{game.home_name}</p>
            <p className="text-sm text-muted-foreground">record</p>
          </div>
          <span>{game.home_spread}</span>
        </div>
        <div
          onClick={awayTeamClick}
          className={`flex items-center space-x-4 rounded-md border p-4 hover:bg-primary/5 cursor-pointer ${
            awayTeamSelected ? "bg-primary/25 hover:bg-primary/30" : ""
          }`}
        >
          <BellRing />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{game.away_name}</p>
            <p className="text-sm text-muted-foreground">record</p>
          </div>
          <span>{game.away_spread}</span>
        </div>
      </CardContent>
      {homeTeamSelected || awayTeamSelected ? (
        <CardFooter>
          <div className="flex flex-grow justify-between items-end">
            <div className="flex-col container">
              <Select
                onValueChange={(value: "REGULAR" | "BINNY") =>
                  setPickTypeSelected(value)
                }
              >
                <SelectTrigger className="">
                  <SelectValue placeholder="Select a pick type." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="REGULAR">REGULAR</SelectItem>
                    <SelectItem value="BINNY">BINNY</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button
              size={"sm"}
              onClick={() => {
                execute({
                  game: game.id,
                  teamSelected: homeTeamSelected ? "HOME" : "AWAY",
                  pickType: pickTypeSelected,
                });
              }}
            >
              Submit
            </Button>
          </div>
        </CardFooter>
      ) : null}
    </Card>
  );
}
