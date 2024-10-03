"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { enrollUser } from "@/server/actions/weekly-winner/enroll";

export default function WeeklyWinnerEnroll({ id }: { id: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Weekly Winner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            You are not enrolled in the weekly winner challenge.
          </p>
          <p className="mt-4 text-gray-600">
            If you would like to participate venmo{" "}
            <strong>Jayson Binion</strong> and{" "}
            <strong>click the button below</strong>.
          </p>
          <p className="mt-4 text-gray-600">
            The weekly winner challenge is a separate challenge from the league
            that is held every week.
            <br />
            The person(s) with the highest score for a given week wins then it
            will start over and go again next week.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={async () => {
              await enrollUser({ userID: id });
            }}
          >
            Join Challenge
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
