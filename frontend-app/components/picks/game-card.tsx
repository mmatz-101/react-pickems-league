"use client";

import { gameType } from "@/server/actions/picks/helpers/game-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "../ui/card";
import { BellRing, TrashIcon } from "lucide-react";
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
import { submitPick } from "@/server/actions/picks/submit-pick";
import { z } from "zod";
import { useToast } from "../ui/use-toast";
import { pickType } from "@/server/actions/picks/helpers/pick-data";
import { deletePick } from "@/server/actions/picks/delete-picks";

export default function GameCard({
  game,
  pick,
}: {
  game: gameType;
  pick: pickType | undefined;
}) {
  const [homeTeamSelected, setHomeTeamSelected] = useState(false);
  function homeTeamClick() {
    console.log("home team clicked");
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
    console.log(pick);
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
  }, []);

  const pickTypeSchema = z.enum(["REGULAR", "BINNY"]);
  const [pickTypeSelected, setPickTypeSelected] =
    useState<z.infer<typeof pickTypeSchema>>("REGULAR");

  const { toast } = useToast();

  const { execute } = useAction(submitPick, {
    onSuccess: (data) => {
      console.log("success");
      toast({
        title: "Pick Submitted",
        description: data.success,
      });
    },
    onError: (data) => {
      console.log("error");
      toast({
        title: "Pick Submitted Error",
        description: "Your pick has been submitted.",
        variant: "destructive",
      });
    },
  });
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Card>
        <CardHeader>
          <CardDescription className="flex justify-between content-center">
            <span>{game.tv_station}</span>
            <span>{game.date}</span>
            {pick ? (
              <Button
                onClick={async () => {
                  if (pick) {
                    try {
                      const resp = await deletePick({ id: pick.id });
                      setHomeTeamSelected(false);
                      setAwayTeamSelected(false);
                      toast({
                        title: "Pick Deleted",
                        description: "Your pick has been deleted.",
                        variant: "destructive",
                      });
                    } catch (error) {
                      toast({
                        title: "Server Error",
                        description: "Try refreshing the page.",
                        variant: "destructive",
                      });
                    }
                  }
                }}
                size={"icon"}
                variant={"destructive"}
              >
                <TrashIcon />
              </Button>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div
            onClick={homeTeamClick}
            className={`flex items-center space-x-4 rounded-md border p-4  cursor-pointer ${
              homeTeamSelected
                ? "bg-primary/25 hover:bg-primary/20"
                : "hover:bg-primary/5"
            }`}
          >
            <BellRing />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {game.home_name}
              </p>
              <p className="text-sm text-muted-foreground">record</p>
            </div>
            <span>{game.home_spread}</span>
          </div>
          <div
            onClick={awayTeamClick}
            className={`flex items-center space-x-4 rounded-md border p-4  cursor-pointer ${
              awayTeamSelected
                ? "bg-primary/25 hover:bg-primary/20"
                : "hover:bg-primary/5"
            }`}
          >
            <BellRing />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {game.away_name}
              </p>
              <p className="text-sm text-muted-foreground">record</p>
            </div>
            <span>{game.away_spread}</span>
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
