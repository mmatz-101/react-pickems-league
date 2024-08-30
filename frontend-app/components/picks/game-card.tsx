"use client";

import { gameType, teamType } from "@/server/actions/picks/helpers/game-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Suspense, useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { ReturnInfo, submitPick } from "@/server/actions/picks/submit-pick";
import { z } from "zod";
import { useToast } from "../ui/use-toast";
import { pickType } from "@/server/actions/picks/helpers/pick-data";
import Image from "next/image";
import { format, parseISO } from "date-fns";

export interface gameTypeExpanded extends gameType {
  expand: { home_team: teamType | null; away_team: teamType | null };
}

const gameDateDisplay: (dateString: string) => string = (dateString) => {
  // Parse the ISO date string into a Date object
  const date = parseISO(dateString);

  // Format the Date object into a readable string
  const formattedDate = format(date, "MMMM d, h:mm a");

  return formattedDate;
};

export default function GameCard({
  game,
  pick,
}: {
  game: gameTypeExpanded;
  pick: pickType | undefined;
}) {
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

  useEffect(() => {
    if (pick) {
      if (pick.team_selected === "HOME") {
        setHomeTeamSelected(true);
      } else {
        setAwayTeamSelected(true);
      }
      if (pick.pick_type === "REGULAR") {
        setPickTypeSelected("REGULAR");
      } else {
        setPickTypeSelected("BINNY");
      }
    }
  }, [pick]);

  const pickTypeSchema = z.enum(["REGULAR", "BINNY"]);
  const [pickTypeSelected, setPickTypeSelected] =
    useState<z.infer<typeof pickTypeSchema>>("REGULAR");

  const { toast } = useToast();

  const { execute } = useAction(submitPick, {
    onSuccess: (data: ReturnInfo) => {
      if (data.error) {
        toast({
          title: "Pick unable to be submitted.",
          description: data.error,
          variant: "destructive",
        });

        if (!data.update) {
          setHomeTeamSelected(false);
          setAwayTeamSelected(false);
        }
      } else {
        toast({
          title: "Pick Submitted",
          description: data.success,
        });
      }
    },
    onError: (data) => {
      console.log(data);
      toast({
        title: "Server Error",
        description:
          "Your pick has not been submitted. Try refreshing the page.",
        variant: "destructive",
      });
    },
  });

  // check if the home_team or away_team that was provided is null
  let homeTeamImageValid = true;
  let homeTeamImageSrc = "";
  if (game.expand.home_team) {
    if (!game.expand.home_team.image_src) {
      homeTeamImageValid = false;
    } else {
      homeTeamImageSrc = game.expand.home_team.image_src;
    }
  }
  let awayTeamImageValid = true;
  let awayTeamImageSrc = "";
  if (game.expand.away_team) {
    if (!game.expand.away_team.image_src) {
      awayTeamImageValid = false;
    } else {
      awayTeamImageSrc = game.expand.away_team.image_src.trim();
    }
  }
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Card className="flex-auto">
        <CardHeader>
          <CardDescription className="flex justify-between content-center">
            <span className="flex flex-col">
              <span>{game.tv_station ? game.tv_station : "hidden"}</span>
              <span>
                {game.status != "FINAL" ? gameDateDisplay(game.date) : "FINAL"}
              </span>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div
            onClick={awayTeamClick}
            className={`flex items-center space-x-4 rounded-md border p-4  cursor-pointer ${
              awayTeamSelected
                ? "bg-primary/25 hover:bg-primary/20"
                : "hover:bg-primary/5"
            }`}
          >
            <div className="h-50 w-50 flex items-center justify-center">
              {awayTeamImageSrc && (
                <Image
                  src={awayTeamImageSrc}
                  alt="Logo"
                  height={50}
                  width={50}
                />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {game.away_name}
              </p>
              <p className="text-sm text-muted-foreground">record</p>
            </div>
            <span>{game.away_spread}</span>
          </div>
          <div
            onClick={homeTeamClick}
            className={`flex items-center space-x-4 rounded-md border p-4  cursor-pointer ${
              homeTeamSelected
                ? "bg-primary/25 hover:bg-primary/20"
                : "hover:bg-primary/5"
            }`}
          >
            <div className="h-50 w-50 flex items-center justify-center">
              {homeTeamImageValid && (
                <Image
                  src={homeTeamImageSrc}
                  alt="Logo"
                  height={50}
                  width={50}
                />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                @{game.home_name}
              </p>
              <p className="text-sm text-muted-foreground">record</p>
            </div>
            <span>{game.home_spread}</span>
          </div>
        </CardContent>
        <CardFooter
          className={homeTeamSelected || awayTeamSelected ? "" : "invisible"}
        >
          <div className="flex flex-grow justify-between items-end">
            <div className="container pl-0">
              <Select
                onValueChange={(value: "REGULAR" | "BINNY") =>
                  setPickTypeSelected(value)
                }
              >
                <SelectTrigger className="">
                  {pickTypeSelected ? (
                    pickTypeSelected === "REGULAR" ? (
                      <SelectValue placeholder="REGULAR" />
                    ) : (
                      <SelectValue placeholder="BINNY" />
                    )
                  ) : (
                    <SelectValue placeholder="Select a pick type." />
                  )}
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
                  id: pick ? pick.id : "",
                  game: game.id,
                  league: game.league,
                  teamSelected: homeTeamSelected ? "HOME" : "AWAY",
                  pickType: pickTypeSelected,
                });
              }}
            >
              Submit
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Suspense>
  );
}
