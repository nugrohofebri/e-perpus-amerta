"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function createClient() {
  const { url, clientKey } = getSupabaseEnv();

  if (!url || !clientKey) {
    throw new Error("Supabase env belum diisi. Salin .env.example menjadi .env.local.");
  }

  return createBrowserClient(url, clientKey);
}
