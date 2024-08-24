import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen w-full">
      {/* Image Section */}
      <div className="relative flex items-center justify-center bg-gray-100">
        <Image
          src="/binny_logo2.svg"
          alt="Landing Page Image"
          width={650}
          height={650}
        />
      </div>
      {/* Content Section */}
      <div className="flex flex-col justify-center items-center px-6 py-12 md:px-12 bg-white">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Ultimate Pickems League
            </h2>
            <p className="mt-2 text-muted-foreground">
              A more affordable form of therapy
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Button>
              <Link href="/login" className="flex-grow">
                Login
              </Link>
            </Button>
            <Button variant="secondary">
              <Link href="/signup" className="flex-grow">
                Signup
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
