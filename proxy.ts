import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  return NextResponse.redirect(
    new URL("/api/auth/signin?callbackUrl=%2F", request.url),
  );
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

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
