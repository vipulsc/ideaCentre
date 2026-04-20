const requiredEnv = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
};

export function getSupabaseEnv() {
  const { url, publishableKey } = requiredEnv;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!publishableKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  return { url, publishableKey };
}

export function getSupabaseServiceRoleKey() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return serviceRoleKey;
}
