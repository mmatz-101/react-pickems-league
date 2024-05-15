import { UserButton } from "@/components/navigation/user-button";
import { Button } from "../ui/button";
import Link from "next/link";
import { LogIn } from "lucide-react";
import Image from "next/image";
import { auth } from "@/server/auth";

export default async function Nav() {
  const session = await auth();

  return (
    <header className="py-8">
      <nav>
        <ul className="flex justify-between items-center px-4">
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
          {!session ? (
            <li>
              <Button asChild>
                <Link className="flex gap-2" href="/auth/login">
                  <LogIn size={16} />
                  <span>Login</span>
                </Link>
              </Button>
            </li>
          ) : (
            <li>
              <UserButton expires={session?.expires} user={session?.user} />
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
