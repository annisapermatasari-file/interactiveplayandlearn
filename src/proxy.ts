import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/parent/:path*", "/learn/:path*", "/admin/:path*", "/teacher/:path*"],
};
