import { columns, mobileColumns } from "@/components/dashboard/columns";
import { DataTable } from "@/components/dashboard/data-table";
import { getPB } from "@/lib/pocketbase";
import { currentDataType } from "@/server/actions/admin/helpers/current-data";
import { gameType } from "@/server/actions/picks/helpers/game-data";
import { pickType } from "@/server/actions/picks/helpers/pick-data";
import { redirect } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface pickTypeQuery extends pickType {
  expand: { game: gameType };
}

export default async function DashboardPage() {
  const pb = getPB();

  const picks: pickTypeQuery[] = await pb.collection("picks").getFullList({
    filter: `user="${pb.authStore.model!.id}"`,
    expand: "game",
  });

  const currentData: currentDataType = await pb
    .collection("current")
    .getFirstListItem("");

  if (pb.authStore.isValid) {
    return (
      <div>
        <h1>User Dashboard</h1>
        <p>{pb.authStore.model!.first_name}</p>
        <div className="container mx-auto py-10 sm:block md:hidden">
          <DataTable columns={mobileColumns} data={picks} />
        </div>
        <div className="container mx-auto py-10 hidden md:block">
          <DataTable columns={columns} data={picks} />
        </div>

        <Accordion
          className="max-w-5xl justify-center"
          type="single"
          collapsible
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>Week 1</AccordionTrigger>
            <AccordionContent>
              <div className="container mx-auto py-10">
                <DataTable columns={columns} data={picks} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  redirect("/login");
}
