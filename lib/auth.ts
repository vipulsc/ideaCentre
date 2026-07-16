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
    error: "/",
  },
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
