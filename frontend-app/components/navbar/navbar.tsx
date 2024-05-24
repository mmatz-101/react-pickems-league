import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { LogIn, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTrigger,
} from "../ui/sheet";
import { createClient } from "@/utils/supabase/server";

const navLinks = [
  {
    title: "User Dashboard",
    url: "/",
    key: "user-dashboard",
  },
  {
    title: "Picks",
    url: "/picks",
    key: "picks",
  },
  {
    title: "Results",
    url: "/results",
    key: "results",
  },
];

export default async function NavBar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-6xl flex justify-between items-center p-3 text-sm">
        <div className="flex">
          <Link href="/">
            <Image
              src="/logo_light.svg"
              alt="Logo"
              width={100}
              height={100}
              priority
            />
          </Link>
        </div>

        {user ? (
          <>
            {/* User is signed in and not on mobile */}
            <ul className="flex gap-4">
              {navLinks.map((link) => (
                <li className="hidden md:block" key={link.key}>
                  <Link
                    className="hover:text-primary/60 hover:cursor-pointer"
                    href={`/${link.url}`}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>

            {/* User is sign in and on mobile */}
            <ul className="md:hidden">
              <li>
                <Sheet>
                  <SheetTrigger>
                    <Button variant={"outline"} size={"icon"}>
                      <Menu size={24} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetDescription>
                      {navLinks.map((link) => (
                        <div>
                          <Link
                            className="text-primary text-lg hover:text-primary/60 hover:cursor-pointer"
                            href={`/${link.url}`}
                          >
                            {link.title}
                          </Link>
                        </div>
                      ))}
                    </SheetDescription>
                  </SheetContent>
                </Sheet>
              </li>
            </ul>
          </>
        ) : (
          // User is not signed in
          <Link href="/login">
            <Button variant={"outline"} className="gap-2">
              <LogIn size={24} />
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
