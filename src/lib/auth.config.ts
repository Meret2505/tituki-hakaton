import type { NextAuthConfig } from "next-auth";

// Lightweight config for middleware (no Prisma, no Node.js APIs)
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/auth/login" },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === "admin";
      const pathname = nextUrl.pathname;

      if (pathname.startsWith("/admin") && !isAdmin) return false;
      if (pathname.startsWith("/profile") && !isLoggedIn) return false;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "user";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // filled in auth.ts with credentials provider
};
