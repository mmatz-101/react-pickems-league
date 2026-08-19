import { getLeagueContext } from "@/lib/league-context";
import Link from "next/link";

export default async function LeagueSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { league, membership, season, week } = await getLeagueContext(slug);
  const isCommissioner = membership.role === "COMMISSIONER";

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <p className="text-sm text-muted-foreground">League settings</p>
        <h1 className="text-3xl font-bold">{league?.name ?? "League"}</h1>
      </div>

      <section className="rounded border p-4">
        <h2 className="text-lg font-semibold">League information</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Slug</dt>
            <dd>{league?.slug}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Your role</dt>
            <dd>{membership.role}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Status</dt>
            <dd>{league?.status}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Timezone</dt>
            <dd>{league?.timezone}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded border p-4">
        <h2 className="text-lg font-semibold">Active season</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Season</dt>
            <dd>{season.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Current week</dt>
            <dd>Week {week.number}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Regular win</dt>
            <dd>{season.regular_win_points}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Binny win/loss</dt>
            <dd>{season.binny_win_points} / {season.binny_loss_points}</dd>
          </div>
        </dl>
      </section>

      {isCommissioner && (
        <section className="rounded border p-4">
          <h2 className="text-lg font-semibold">Commissioner tools</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage membership and invitations for this league.
          </p>
          <Link
            className="mt-4 inline-block rounded bg-primary px-4 py-2 text-primary-foreground"
            href="/user/league/invites"
          >
            Manage invites
          </Link>
        </section>
      )}
    </main>
  );
}
