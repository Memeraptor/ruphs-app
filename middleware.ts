export { default } from "next-auth/middleware";

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
