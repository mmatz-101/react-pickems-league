"use client";

import { UpdateLinkTeamsToGames } from "@/server/actions/admin/helpers/link-teams-to-games";
import { Button } from "../ui/button";

export default function LinkTeamsToGames() {
  return (
    <>
      <h1>Update Results</h1>
      <Button
        onClick={async () => {
          UpdateLinkTeamsToGames({});
        }}
        type="submit"
      >
        Update Games
      </Button>
    </>
  );
}
