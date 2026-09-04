import { getPB } from "@/app/pocketbase";
import ApproveRequestButton from "@/components/leagues/approve-request-button";
import { redirect } from "next/navigation";

export default async function LeagueRequestsPage() {
  const pb = await getPB();
  if (!pb.authStore.isValid) redirect("/login");
  if (pb.authStore.model?.platform_role !== "PLATFORM_ADMIN") redirect("/user/dashboard");

  const requests = await pb.collection("league_requests").getFullList({
    filter: 'status="PENDING"',
    sort: "requested_name",
    expand: "requester",
  });

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <p className="text-sm text-muted-foreground">Platform administration</p>
        <h1 className="text-3xl font-bold">League requests</h1>
      </div>
      {requests.length === 0 ? <p>No pending requests.</p> : (
        <div className="space-y-4">
          {requests.map((request) => (
            <section className="flex items-start justify-between gap-4 rounded border p-4" key={request.id}>
              <div>
                <h2 className="font-semibold">{request.requested_name}</h2>
                <p className="text-sm text-muted-foreground">{request.description || "No description provided."}</p>
                <p className="mt-2 text-sm">Status: {request.status}</p>
              </div>
              <ApproveRequestButton request={request.id} />
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
