import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  events: {
    async signIn({ user }) {
      if (!user.email) {
        return;
      }

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
        // Avoid breaking login flow while still making failures visible.
        console.error("Failed to upsert signed-in user", error.message);
      }
    },
  },
};
