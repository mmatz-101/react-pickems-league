"use client";
import { BellRing } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { teamSubmit } from "@/server/actions/game/team-form";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";

interface gameProps {
  date: Date | null;
  id: string;
  league: string | null;
  year: number | null;
  week: number | null;
  status: string | null;
  tvStation: string | null;
  homeTeam: string | null;
  homeSpread: number | null;
  awayTeam: string | null;
  awaySpread: number | null;
}

export function GameCard({ game, key }: { game: gameProps; key: string }) {
  const homeTeamClick = async () => {
    console.log("hometeam clicked");
    await teamSubmit({ gameID: game.id, team: "HOME", pickType: "REGULAR" });
  };

  const [gameDate, setGameDate] = useState("");

  useEffect(() => {
    // Something with the hydration step renders the game.date with and without a timezone causing a mismatch.
    setGameDate(game.date!.toDateString());
  }, []);

  return (
    <Card className={cn("w-[380px]")}>
      <CardHeader>
        <CardDescription className="flex justify-between">
          <span>{game.tvStation}</span>
          <span>{gameDate}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form
          className=" flex items-center space-x-4 rounded-md border p-4 hover:bg-primary/5 cursor-pointer"
          onClick={homeTeamClick}
        >
          <BellRing />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{game.homeTeam}</p>
            <p className="text-sm text-muted-foreground">record</p>
          </div>
          <span>{game.homeSpread}</span>
        </form>
        <div className=" flex items-center space-x-4 rounded-md border p-4 hover:bg-primary/5 cursor-pointer">
          <BellRing />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{game.awayTeam}</p>
            <p className="text-sm text-muted-foreground">record</p>
          </div>
          <span>{game.awaySpread}</span>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-grow justify-between items-end">
          <div className="flex-col container">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Fruits</SelectLabel>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="blueberry">Blueberry</SelectItem>
                  <SelectItem value="grapes">Grapes</SelectItem>
                  <SelectItem value="pineapple">Pineapple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button size={"sm"}>Submit</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
