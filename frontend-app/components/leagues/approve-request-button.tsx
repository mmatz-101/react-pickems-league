"use client";

import { Button } from "@/components/ui/button";
import { approveLeagueRequest } from "@/server/actions/leagues/approve-request";
import { useAction } from "next-safe-action/hooks";
import { useToast } from "@/components/ui/use-toast";

export default function ApproveRequestButton({ request }: { request: string }) {
  const { toast } = useToast();
  const { execute, status } = useAction(approveLeagueRequest, {
    onSuccess: ({ data }) => toast({
      title: data?.error ? "Approval failed" : "Request approved",
      description: data?.error ?? data?.success,
      variant: data?.error ? "destructive" : "default",
    }),
  });
  return <Button disabled={status === "executing"} onClick={() => execute({ request })}>
    {status === "executing" ? "Approving…" : "Approve"}
  </Button>;
}
