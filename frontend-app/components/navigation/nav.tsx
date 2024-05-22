import { Button } from "../ui/button";
import Link from "next/link";
import { LogIn, Menu, Package2 } from "lucide-react";
import Image from "next/image";
import { SignInButton, SignedOut, SignedIn, UserButton } from "@clerk/nextjs";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { auth } from "@clerk/nextjs/server";

export default async function Nav() {
  const {userId} = auth()
  return (
    <header className="py-8">
      <nav className="">
        <ul className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm md:justify-between lg:gap-6">
          <div className="flex items-center gap-6">
            <li>
              <Link href={"/"} aria-label="pickems logo">
                <Image
                  src="/logo_light.svg"
                  alt="Logo"
                  width={100}
                  height={100}
                  priority={true}
                />
              </Link>
            </li>
            <SignedIn>
              <li>
                <Link
                  href={`/${userId}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <p>User Homepage</p>
                </Link>
              </li>
              <li>
                <Link
                  href={`/${userId}/picks`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <p>Picks</p>
                </Link>
              </li>
              <li>
                <Link
                  href={`/${userId}/results`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <p>Results</p>
                </Link>
              </li>
            </SignedIn>
          </div>

          <SignedOut>
            <li>
              <Button asChild className="gap-2">
                <div>
                  <LogIn size={16} />
                  <SignInButton />
                </div>
              </Button>
            </li>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </ul>
        <div className="flex justify-between md:hidden">
        <Sheet modal={false}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link href={"/"} aria-label="pickems logo">
                <Image
                  src="/logo_light.svg"
                  alt="Logo"
                  width={100}
                  height={100}
                  priority={true}
                />
                <span className="sr-only">Acme Inc</span>
              </Link>
              <Link
                  href={`/${userId}`}
                className="text-muted-foreground hover:text-foreground"
              >
                <p>User Homepage</p>
              </Link>
              <Link
                  href={`/${userId}/picks`}
                className="text-muted-foreground hover:text-foreground"
              >
                <p>Picks</p>
              </Link>
              <Link
                  href={`/${userId}/results`}
                className="text-muted-foreground hover:text-foreground"
              >
                <p>Results</p>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
          <SignedOut>
            <li>
              <Button asChild className="gap-2">
                <div>
                  <LogIn size={16} />
                  <SignInButton />
                </div>
              </Button>
            </li>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>


        </div>
      </nav>
    </header>
  );
}
