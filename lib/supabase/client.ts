"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient<Database> | undefined;

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, publishableKey } = getSupabaseEnv();
  browserClient = createBrowserClient<Database>(url, publishableKey);
  return browserClient;
}
