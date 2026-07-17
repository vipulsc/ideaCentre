import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export function assertAuthConfigured() {
  const missing: string[] = [];
  if (!process.env.NEXTAUTH_SECRET?.trim()) missing.push("NEXTAUTH_SECRET");
  if (!process.env.GOOGLE_CLIENT_ID?.trim()) missing.push("GOOGLE_CLIENT_ID");
  if (!process.env.GOOGLE_CLIENT_SECRET?.trim()) {
    missing.push("GOOGLE_CLIENT_SECRET");
  }
  if (missing.length > 0) {
    throw new Error(`Auth is not configured. Missing: ${missing.join(", ")}`);
  }
}

function productionCookieDomain(): string | undefined {
  const raw = process.env.NEXTAUTH_URL?.trim();
  if (!raw) return undefined;
  try {
    const hostname = new URL(raw).hostname;
    if (hostname === "ideacentre.xyz" || hostname.endsWith(".ideacentre.xyz")) {
      return ".ideacentre.xyz";
    }
  } catch {
    return undefined;
  }
  return undefined;
}

const cookieDomain = productionCookieDomain();
const useSecureCookies =
  process.env.NEXTAUTH_URL?.trim().startsWith("https://") ?? false;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID?.trim() ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    error: "/login",
    signIn: "/login",
  },
  // Share the session cookie across www + apex so OAuth redirects don't drop auth.
  ...(cookieDomain
    ? {
        cookies: {
          sessionToken: {
            name: useSecureCookies
              ? "__Secure-next-auth.session-token"
              : "next-auth.session-token",
            options: {
              httpOnly: true,
              sameSite: "lax" as const,
              path: "/",
              secure: useSecureCookies,
              domain: cookieDomain,
            },
          },
        },
      }
    : {}),
  callbacks: {
    async signIn({ user }) {
      assertAuthConfigured();

      if (!user.email) {
        return false;
      }

      try {
        const supabase = getSupabaseAdminClient();
        const { error } = await supabase.from("users").upsert(
          {
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
          },
          { onConflict: "email" },
        );

        if (error) {
          console.error("Failed to upsert signed-in user", error.message);
          return false;
        }

        return true;
      } catch (err) {
        console.error("Failed to upsert signed-in user", err);
        return false;
      }
    },
  },
};
