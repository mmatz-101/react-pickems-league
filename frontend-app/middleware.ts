import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest){
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-forwarded-host", "localhost:3000")

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        }
    })

    return response
}