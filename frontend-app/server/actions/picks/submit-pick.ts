"use server"

import { pb } from "@/lib/pocketbase";
import { action } from "@/lib/safe-action";
import { SubmitPickSchema } from "@/schema/submit-pick";
import { currentDataType } from "../admin/helpers/current-data";
import { cookies } from "next/headers";


export const submitPick = action(SubmitPickSchema, async ({id, game, teamSelected, pickType}) => {
    console.log(id, game, teamSelected, pickType)
    // get current data
  const currentData: currentDataType = await pb
    .collection("current")
    .getFirstListItem("");
    // get user data
    const userToken = cookies().get("pb_auth")?.value;
    if (userToken) {
        pb.authStore.loadFromCookie(userToken);
    }
    // attempty to create/update picks
    console.log(pb.authStore.model!.id)
    try {
        if (id){
            const record = await pb.collection('picks').update(id, {
                "user": pb.authStore.model!.id,
                "game": game,
                "week": currentData.week,
                "team_selected": teamSelected,
                "pick_type": pickType,
            });
        return {success: "pick successfully updated", record}
        } else {
            const record = await pb.collection('picks').create({
                "user": pb.authStore.model!.id,
                "game": game,
                "week": currentData.week,
                "team_selected": teamSelected,
                "pick_type": pickType,
            });
        return {success: "pick successfully created", record}
        }
    } catch (error: any) {
        console.log(error.data)
        return {error: "server error"}
    }
})