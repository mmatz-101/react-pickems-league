import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Crown } from "lucide-react";
import { WeeklyWinnerDataTable } from "./weekly-data-table";
import { weeklyColumns } from "./weekly-columns";
import { weeklyWinnerExpandTableType } from "@/server/actions/picks/helpers/weekly-winner";

export default async function WinnersCircle({
  weeklyWinnerData,
}: {
  weeklyWinnerData: weeklyWinnerExpandTableType[];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex flex-row" variant="outline">
          <p className="pr-2">Winner's Circle</p>
          <Crown size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="py-2">Winner's Circle</DialogTitle>
          <DialogDescription>
            <WeeklyWinnerDataTable
              columns={weeklyColumns}
              data={weeklyWinnerData}
            />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
