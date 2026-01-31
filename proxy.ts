export { default } from "next-auth/middleware";
import type { NextRequest } from "next/server";
//import { isAuthenticated } from "@lib/auth";

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

export function proxy(request: NextRequest) {}
