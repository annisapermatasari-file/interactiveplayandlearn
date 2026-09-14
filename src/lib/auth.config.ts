import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/parent", "/learn", "/admin", "/teacher"];

/**
 * Edge-safe config only: no providers, no Prisma, no bcrypt. This is what
 * middleware imports so the Node-only credentials/db code never gets bundled
 * for the Edge runtime. The full config (src/lib/auth.ts) spreads this and
 * adds the Credentials provider for use in Server Components/Actions.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ request, auth }) {
      const isProtected = PROTECTED_PREFIXES.some((prefix) =>
        request.nextUrl.pathname.startsWith(prefix),
      );
      if (!isProtected) return true;
      if (auth?.user) return true;

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    },
  },
} satisfies NextAuthConfig;
