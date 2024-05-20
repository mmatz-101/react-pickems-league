import { BellRing } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { games } from "@/server/schema";

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

export function GameCard({ game }: { game: gameProps }) {
  return (
    <Card className={cn("w-[380px]")}>
      <CardHeader>
        <CardDescription className="flex justify-between">
          <span>{game.tvStation}</span>
          <span>{game.date?.toDateString()}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className=" flex items-center space-x-4 rounded-md border p-4">
          <BellRing />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{game.homeTeam}</p>
            <p className="text-sm text-muted-foreground">record</p>
          </div>
          <span>{game.homeSpread}</span>
        </div>
        <div className=" flex items-center space-x-4 rounded-md border p-4">
          <BellRing />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{game.awayTeam}</p>
            <p className="text-sm text-muted-foreground">record</p>
          </div>
          <span>{game.awaySpread}</span>
        </div>
      </CardContent>
    </Card>
  );
}
