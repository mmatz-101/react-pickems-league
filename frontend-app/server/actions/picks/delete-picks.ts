"use server"

import { getPB } from "@/lib/pocketbase"
import { action } from "@/lib/safe-action"
import { revalidatePath } from "next/cache"
import {z} from "zod"

const deleteSchema = z.object({
    id: z.string()
})

export const deletePick = action(deleteSchema, async ({id}) => {
    const pb = getPB();
    try {
        await pb.collection("picks").delete(id)
        revalidatePath("/user/picks")
        return {success: "pick deleted"}
    } catch (error) {
        return {error: "error deleting pick"}
    }
})