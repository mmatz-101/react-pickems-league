"use client";

import { LogoutUser } from "@/server/actions/logout";
import { Calendar, LogOutIcon, MousePointer, Trophy, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between bg-background px-4 sm:px-6">
      <Link href="/" className="flex items-center gap-2" prefetch={false}>
        <Image
          src="/binny_logo2.svg"
          width={32}
          height={32}
          alt="Acme Inc"
          className="h-8 w-8"
          style={{ aspectRatio: "32/32", objectFit: "cover" }}
        />
        <span className="text-lg font-medium">PICKEMS</span>
      </Link>
      <nav className="flex items-center gap-4">
        <Link
          href="/user/dashboard"
          className="text-sm font-medium text-muted-foreground hover:text-foreground flex flex-row"
          prefetch={false}
        >
          <User size={16} className="mr-1" />
          User Dashboard
        </Link>
        <Link
          href="/user/picks"
          className="text-sm font-medium text-muted-foreground hover:text-foreground flex flex-row"
          prefetch={false}
        >
          <MousePointer size={16} className="mr-1" />
          Picks
        </Link>
        <Link
          href="/user/league/picks"
          className="text-sm font-medium text-muted-foreground hover:text-foreground flex flex-row"
          prefetch={false}
        >
          <Calendar size={16} className="mr-1" />
          Weekly
        </Link>
        <Link
          href="/user/results"
          className="text-sm font-medium text-muted-foreground hover:text-foreground flex flex-row"
          prefetch={false}
        >
          <Trophy size={16} className="mr-1" />
          Results
        </Link>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <LogOutIcon
                size={16}
                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:cursor-pointer"
                onClick={async () => {
                  await LogoutUser({});
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </header>
  );
}
