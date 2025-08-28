"use server";

import { action } from "@/lib/safe-action";
import { redirect } from "next/navigation";
import { z } from "zod";

const moreInformationSchema = z.object({
  id: z.string(),
});

export const moreInformation = action(moreInformationSchema, async ({ id }) => {
  redirect(`/user/picks/${id}`);
});
