"use server";

import { getPB } from "@/app/pocketbase";
import { action } from "@/lib/safe-action";
import { LeagueInviteSchema } from "@/schema/league-invite-schema";
import { createHash, randomBytes } from "node:crypto";

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export const createLeagueInvite = action
  .inputSchema(LeagueInviteSchema)
  .action(async ({ parsedInput: { leagueId, expiresAt, maxUses } }) => {
    const pb = await getPB();
    const userId = pb.authStore.model?.id;

    if (!userId) {
      return { error: "You must be signed in." };
    }

    const commissioner = await pb.collection("league_memberships").getFirstListItem(
      `league="${leagueId}" && user="${userId}" && role="COMMISSIONER" && status="ACTIVE"`,
    ).catch(() => null);

    if (!commissioner) {
      return { error: "Only an active league commissioner can create invites." };
    }

    const rawToken = randomBytes(32).toString("base64url");
    const tokenHash = hashToken(rawToken);

    const record = await pb.collection("league_invites").create({
      league: leagueId,
      created_by: userId,
      token_hash: tokenHash,
      expires_at: expiresAt ?? "",
      max_uses: maxUses ?? 0,
      use_count: 0,
      status: "ACTIVE",
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const inviteUrl = `${baseUrl}/join/${rawToken}`;

    return {
      success: "Invite created.",
      invite: {
        id: record.id,
        url: inviteUrl,
        expiresAt: record.expires_at,
        maxUses: record.max_uses,
      },
    };
  });
