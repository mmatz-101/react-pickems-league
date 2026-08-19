import { getPB } from "@/app/pocketbase";
import NavbarClient from "@/components/navbar/navbar-client";

export default async function Navbar({ leagueSlug }: { leagueSlug?: string }) {
  const pb = await getPB();
  const userId = pb.authStore.model?.id;

  if (!userId) return null;

  const settingsLeagueSlug = leagueSlug ?? "";
  return <NavbarClient settingsLeagueSlug={settingsLeagueSlug} />;
}
