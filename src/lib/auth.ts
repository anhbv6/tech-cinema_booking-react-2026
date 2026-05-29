import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const adminRoles = ["ADMIN", "MANAGER", "STAFF"] as const;

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: (() => {
    const providers: NextAuthOptions["providers"] = [
      Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "");
        const password = String(credentials?.password || "");

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password || !user.isActive) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
      }),
    ];

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      providers.push(
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
      );
    }

    return providers;
  })(),
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider !== "google" || !user.email) {
        return true;
      }

      const existing = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existing && !existing.isActive) {
        return false;
      }

      const saved = await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        },
        create: {
          email: user.email,
          name: user.name,
          image: user.image,
          role: "CUSTOMER",
          isActive: true,
        },
      });

      (user as { id?: string; role?: string }).id = saved.id;
      (user as { id?: string; role?: Role }).role = saved.role;

      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: Role }).role;
      }

      if (!token.role && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = String(token.role) as never;
        session.user.email = token.email ?? session.user.email;
      }
      return session;
    },
  },
};

export function isAdminRole(role?: string | null) {
  return adminRoles.includes((role || "") as (typeof adminRoles)[number]);
}
