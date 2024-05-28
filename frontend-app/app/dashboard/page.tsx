import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Pocketbase from "pocketbase";


export default async function DashboardPage() {
    const pb = new Pocketbase(process.env.POCKETBASE_URL)
    const userToken = cookies().get("pb_auth")?.value
    if (userToken){
        pb.authStore.loadFromCookie(userToken)
    }

    if (pb.authStore.isValid){
    return (
        <div>
        <h1>User Dashboard</h1>
        <p>{pb.authStore.model.first_name}</p>
        </div>
    );
    }

    redirect("/login")

    
}