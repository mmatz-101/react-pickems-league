import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware} from "@clerk/nextjs/server"


export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};

// export function middleware(request: NextRequest){
//     const requestHeaders = new Headers(request.headers)
//     requestHeaders.set("x-forwarded-host", "localhost:3000")
//     requestHeaders.set("origin", "localhost:3000")

//     const response = NextResponse.next({
//         request: {
//             headers: requestHeaders,
//         }
//     })

//     return response
// }