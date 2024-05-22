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
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAction } from "next-safe-action/hooks";
import { FormSuccess } from "../auth/form-success";

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

enum teamSelectedEnum {
  HOME = "HOME",
  AWAY = "AWAY",
}

enum pickTypeEnum {
  REGULAR = "REGULAR",
  BINNY = "BINNY",
}

export function GameCard({ game, key }: { game: gameProps; key: string }) {
  const homeTeamClick = () => {
    setHomeTeamSelected(!homeTeamSelected);
    setAwayTeamSelected(false);
    if (!(teamSelected === teamSelectedEnum.HOME)) {
      setTeamSelected(teamSelectedEnum.HOME);
    } else {
      setTeamSelected(undefined);
    }
  };
  const awayTeamClick = () => {
    setAwayTeamSelected(!awayTeamSelected);
    setHomeTeamSelected(false);
    if (!(teamSelected === teamSelectedEnum.AWAY)) {
      setTeamSelected(teamSelectedEnum.AWAY);
    } else {
    }
  };
  const pickTypeClick = (e: string) => {
    if (e === "regular") {
      setPickType(pickTypeEnum.REGULAR);
    } else {
      setPickType(pickTypeEnum.BINNY);
    }
  };

  const { execute, result } = useAction(teamSubmit);
  const [gameDate, setGameDate] = useState("");
  const [teamSelected, setTeamSelected] = useState<
    teamSelectedEnum | undefined
  >();
  const [homeTeamSelected, setHomeTeamSelected] = useState<boolean>(false);
  const [awayTeamSelected, setAwayTeamSelected] = useState<boolean>(false);
  const [pickType, setPickType] = useState<pickTypeEnum | undefined>();

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
        <div
          onClick={homeTeamClick}
          className=" flex items-center space-x-4 rounded-md border p-4 hover:bg-primary/5 cursor-pointer"
        >
          <BellRing />
          <div className="flex-1 space-y-1" onClick={homeTeamClick}>
            <p className="text-sm font-medium leading-none">{game.homeTeam}</p>
            <p className="text-sm text-muted-foreground">record</p>
          </div>
          <span>{game.homeSpread}</span>
        </div>
        <div
          onClick={awayTeamClick}
          className=" flex items-center space-x-4 rounded-md border p-4 hover:bg-primary/5 cursor-pointer"
        >
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
            <Select onValueChange={(e) => pickTypeClick(e)}>
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
              execute({
                gameID: game.id,
                team: teamSelected!,
                pickType: pickType!,
              });
            }}
          >
            Submit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
