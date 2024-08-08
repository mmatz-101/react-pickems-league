"use server";
// had tomove this file into app with a weird bug with the next/headers
import { cookies } from "next/headers";
import Pocketbase from "pocketbase";

export async function getPB() {
  const pb = new Pocketbase(process.env.POCKETBASE_URL);
  const userToken = cookies().get("pb_auth")?.value;
  if (userToken) {
    pb.authStore.loadFromCookie(userToken);
    return pb;
  } else {
    console.log("No user token found creating.");
    const pb = new Pocketbase(process.env.POCKETBASE_URL);
    return pb;
  }
}

