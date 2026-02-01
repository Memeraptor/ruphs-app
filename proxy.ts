// src/proxy.ts or /proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Example: Redirect a user if a certain cookie is missing
  if (!request.cookies.has("authenticated")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Example: Add a custom header to the request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-custom-header", "hello");

  // You can also rewrite the URL (URL proxy)
  // return NextResponse.rewrite(new URL('/home', request.url));

  // Or proceed with the request as normal, optionally modifying headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configuration to specify which paths the proxy applies to
export const config = {
  matcher: [
    "/newcharacter",
    "/classes/new",
    "/races/new",
    "/races/:id",
    "/race-classes",
    "/race-classes/new",
    "/specializations/new",
    "/characters/:id",
  ],
};
