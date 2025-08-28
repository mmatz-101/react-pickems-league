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
  Medal,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="flex h-16 items-center justify-between bg-background px-4 sm:px-6 relative">
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

      {/* Hamburger Button */}
      <button
        className="block sm:hidden p-2"
        onClick={handleMenuToggle}
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      {/* Desktop Menu */}
      <nav className="hidden sm:flex items-center gap-4">
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
          href="/user/weekly-winner"
          className="text-sm font-medium text-muted-foreground hover:text-foreground flex flex-row"
          prefetch={false}
        >
          <Medal size={16} className="mr-1" />
          Weekly Winner
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
        <nav className="sm:hidden absolute top-16 left-0 w-full bg-background p-4 flex flex-col gap-4">
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
            href="/user/weekly-winner"
            className="text-sm font-medium text-muted-foreground hover:text-foreground flex flex-row"
            prefetch={false}
          >
            <Medal size={16} className="mr-1" />
            Weekly Winner
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
      )}
    </header>
  );
}
