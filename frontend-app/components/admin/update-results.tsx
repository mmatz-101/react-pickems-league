"use client";

import { UpdatePickResults } from "@/server/actions/admin/update-results";
import { Button } from "../ui/button";
import { useAction } from "next-safe-action/hooks";

export default function UpdateResults() {
  return (
    <>
      <h1>Update Results</h1>
      <Button
        onClick={async () => {
          UpdatePickResults({});
        }}
        type="submit"
      >
        Update Games
      </Button>
    </>
  );
}
