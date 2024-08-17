"use client";

import { UpdatePickResults } from "@/server/actions/admin/update-results";
import { Button } from "../ui/button";

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
