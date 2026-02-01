import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "./app/api/auth/[...nextauth]/authOptions";

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.redirect(
      new URL("/api/auth/signin?callbackUrl=%2F", request.url),
    );
  }
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
