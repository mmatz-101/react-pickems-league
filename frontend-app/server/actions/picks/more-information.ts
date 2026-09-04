"use server";

import { action } from "@/lib/safe-action";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";

const moreInformationSchema = z.object({
  id: z.string(),
});

export const moreInformation = action
  .inputSchema(moreInformationSchema)
  .action(async ({ parsedInput: { id } }) => {
    const referer = (await headers()).get("referer") ?? "";
    const leagueSlug = new URL(referer, "http://localhost").pathname.match(/^\/user\/leagues\/([^/]+)/)?.[1];
    redirect(leagueSlug ? `/user/leagues/${leagueSlug}/picks/${id}` : `/user/picks/${id}`);
  });
