import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/prisma/client";
import argon2 from "argon2";

const WHITELIST = process.env.WHITE_LIST
  ? process.env.WHITE_LIST.split(",").map((email) => email.trim().toLowerCase())
  : [];

export const authOptions: NextAuthOptions = {
  /* adapter: PrismaAdapter(prisma), */
  providers: [
    /* Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Find user by username (lowercase 'user')
        const user = await prisma.user.findFirst({
          where: { name: credentials.username },
        });

        if (!user || !user.password) {
          return null;
        }

        // Verify password using argon2
        const isValidPassword = await argon2.verify(
          user.password,
          credentials.password,
        );

        if (!isValidPassword) {
          return null;
        }

        // Return user object
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }), */
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
  },
};
