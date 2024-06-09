"use server"

import { getPB } from "@/lib/pocketbase";
import { action } from "@/lib/safe-action";
import { SubmitPickSchema } from "@/schema/submit-pick";
import { currentDataType } from "../admin/helpers/current-data";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";


export const submitPick = action(SubmitPickSchema, async ({id, game, teamSelected, pickType}) => {
    const pb = getPB();
    console.log(id, game, teamSelected, pickType)
    // get current data
  const currentData: currentDataType = await pb
    .collection("current")
    .getFirstListItem("");
    // attempty to create/update picks
    try {
        if (id){
            console.log("updating pick")
            const record = await pb.collection('picks').update(id, {
                "user": pb.authStore.model!.id,
                "game": game,
                "week": currentData.week,
                "team_selected": teamSelected,
                "pick_type": pickType,
            });
            revalidatePath("/user/picks")
        return {success: "pick updated", record}
        } else {
            console.log("creating pick")
            const record = await pb.collection('picks').create({
                "user": pb.authStore.model!.id,
                "game": game,
                "week": currentData.week,
                "team_selected": teamSelected,
                "pick_type": pickType,
            });
            revalidatePath("/user/picks")
        return {success: "pick created", record}
        }
    } catch (error: any) {
        console.log(error.data)
        return {error: "server error"}
    }
})