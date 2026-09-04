"use client";

import { Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LeaguePageHeader({ league, leagues }: { league: { name: string; slug: string }; leagues: { name: string; slug: string }[] }) {
  const router = useRouter();

  return (
    <div className="mx-auto flex w-full max-w-6xl items-center px-4 pt-6 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Trophy className="size-5" /></span>
        <div className="min-w-0">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Current league</p>
          <Select value={league.slug} onValueChange={(slug) => router.push(`/user/leagues/${slug}/dashboard`)}>
            <SelectTrigger aria-label="Select league" className="h-auto w-full min-w-[13rem] border-0 bg-transparent px-0 py-0 text-left text-xl font-bold shadow-none hover:text-primary focus:ring-0 sm:min-w-[18rem]">
              <SelectValue>{league.name}</SelectValue>
            </SelectTrigger>
            <SelectContent align="start" className="min-w-[var(--radix-select-trigger-width)]">
              {leagues.map((item) => <SelectItem key={item.slug} value={item.slug} className="py-2.5">{item.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
