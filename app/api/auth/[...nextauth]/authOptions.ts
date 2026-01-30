import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

const WHITELIST = process.env.WHITE_LIST
  ? process.env.WHITE_LIST.split(",").map((email) => email.trim().toLowerCase())
  : [];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    /*     DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }), */
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      return WHITELIST.includes(user.email.toLowerCase());
    },
    async redirect({ url, baseUrl }) {
      // If the URL is a relative path, allow it
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // If the callback URL is on the same origin, allow it
      if (new URL(url).origin === baseUrl) return url;
      // Otherwise redirect to home
      return baseUrl;
    },
  },
};
