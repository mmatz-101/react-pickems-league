"use client";

import { useState } from "react";
import Image from "next/image";
import { LogoutUser } from "@/server/actions/logout";
import {
  Menu,
  User,
  MousePointer,
  Calendar,
  Trophy,
  LogOutIcon,
  Settings,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export default function NavbarClient({
  settingsLeagueSlug,
}: {
  settingsLeagueSlug?: string;
}) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const leagueBase = settingsLeagueSlug
    ? `/user/leagues/${settingsLeagueSlug}`
    : "";

  const handleMenuToggle = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="relative z-20 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:px-6">
      <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-75" prefetch={false}>
        <Image
          src="/binny_logo2.svg"
          width={32}
          height={32}
          alt="Acme Inc"
          className="h-8 w-8"
          style={{ aspectRatio: "32/32", objectFit: "cover" }}
        />
        <span className="text-lg font-bold tracking-tight">PICKEMS</span>
      </Link>

      {/* Hamburger Button */}
      <button
        className="rounded-md p-2 transition-colors hover:bg-muted sm:hidden"
        onClick={handleMenuToggle}
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      {/* Desktop Menu */}
      <nav className="hidden items-center gap-1 sm:flex">
        <Link
          href={leagueBase ? `${leagueBase}/dashboard` : "/user/dashboard"}
          className="text-sm font-medium text-muted-foreground hover:text-foreground flex flex-row"
          prefetch={false}
        >
          <User size={16} className="mr-1" />
          User Dashboard
        </Link>
        <Link
          href={leagueBase ? `${leagueBase}/picks` : "/user/picks"}
          className="text-sm font-medium text-muted-foreground hover:text-foreground flex flex-row"
          prefetch={false}
        >
          <MousePointer size={16} className="mr-1" />
          Picks
        </Link>
        <Link
          href={leagueBase ? `${leagueBase}/league-picks` : "/user/league/picks"}
          className="text-sm font-medium text-muted-foreground hover:text-foreground flex flex-row"
          prefetch={false}
        >
          <Calendar size={16} className="mr-1" />
          Weekly
        </Link>
        <Link
          href={leagueBase ? `${leagueBase}/results` : "/user/results"}
          className="text-sm font-medium text-muted-foreground hover:text-foreground flex flex-row"
          prefetch={false}
        >
          <Trophy size={16} className="mr-1" />
          Results
        </Link>
        {settingsLeagueSlug && (
          <Link
            href={`/user/leagues/${settingsLeagueSlug}/settings`}
            aria-label="League settings"
            className="text-sm font-medium text-muted-foreground hover:text-foreground flex flex-row"
            prefetch={false}
          >
            <Settings size={16} className="mr-1" />
            Settings
          </Link>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <LogOutIcon
                size={16}
                className="text-sm font-medium text-muted-foreground hover:text-foreground hover:cursor-pointer"
                onClick={async () => {
                  await LogoutUser();
                }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <nav className="absolute left-0 top-16 flex w-full animate-slide-down flex-col gap-1 border-b bg-background p-3 shadow-lg sm:hidden">
          <Link
            href={leagueBase ? `${leagueBase}/dashboard` : "/user/dashboard"}
            className="text-sm font-medium text-muted-foreground hover:text-foreground flex flex-row"
            prefetch={false}
          >
            <User size={16} className="mr-1" />
            User Dashboard
          </Link>
          <Link
            href={leagueBase ? `${leagueBase}/picks` : "/user/picks"}
            className="text-sm font-medium text-muted-foreground hover:text-foreground flex flex-row"
            prefetch={false}
          >
            <MousePointer size={16} className="mr-1" />
            Picks
          </Link>
          <Link
            href={leagueBase ? `${leagueBase}/league-picks` : "/user/league/picks"}
            className="text-sm font-medium text-muted-foreground hover:text-foreground flex flex-row"
            prefetch={false}
          >
            <Calendar size={16} className="mr-1" />
            Weekly
          </Link>
          <Link
            href={leagueBase ? `${leagueBase}/results` : "/user/results"}
            className="text-sm font-medium text-muted-foreground hover:text-foreground flex flex-row"
            prefetch={false}
          >
            <Trophy size={16} className="mr-1" />
            Results
          </Link>
          {settingsLeagueSlug && (
            <Link
              href={`/user/leagues/${settingsLeagueSlug}/settings`}
              className="flex flex-row items-center rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              prefetch={false}
            >
              <Settings size={16} className="mr-1" />
              Settings
            </Link>
          )}
          <button
            className="flex flex-row items-center rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={async () => { await LogoutUser(); }}
            type="button"
          >
            <LogOutIcon size={16} className="mr-1" />
            Logout
          </button>
        </nav>
      )}
    </header>
  );
}
