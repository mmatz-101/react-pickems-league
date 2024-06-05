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

export default function GameCard({ game }: { game: gameType }) {
  function homeTeamClick() {}
  function awayTeamClick() {}
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
          className=" flex items-center space-x-4 rounded-md border p-4 hover:bg-primary/5 cursor-pointer"
        >
          <BellRing />
          <div className="flex-1 space-y-1" onClick={homeTeamClick}>
            <p className="text-sm font-medium leading-none">{game.home_name}</p>
            <p className="text-sm text-muted-foreground">record</p>
          </div>
          <span>{game.home_spread}</span>
        </div>
        <div
          onClick={awayTeamClick}
          className=" flex items-center space-x-4 rounded-md border p-4 hover:bg-primary/5 cursor-pointer"
        >
          <BellRing />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{game.away_name}</p>
            <p className="text-sm text-muted-foreground">record</p>
          </div>
          <span>{game.away_spread}</span>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-grow justify-between items-end">
          <div className="flex-col container">
            <Select onValueChange={() => {}}>
              <SelectTrigger className="">
                <SelectValue placeholder="Select a pick type." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="regular">REGULAR</SelectItem>
                  <SelectItem value="binnny">BINNY</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button
            size={"sm"}
            onClick={() => {
              // execute({
              //   gameID: game.id,
              //   team: teamSelected!,
              //   pickType: pickType!,
              // });
            }}
          >
            Submit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
