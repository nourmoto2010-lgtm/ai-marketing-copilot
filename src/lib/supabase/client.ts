// ============================================================================
// Supabase Safe Lazy Client Configuration (src/lib/supabase/client.ts)
// ============================================================================
// يضمن عدم حدوث أي خطأ أثناء عملية البناء (npm run build) على Vercel
// حتى لو كانت متغيرات البيئة غير ممررة أو تحتوي على مسافات/علامات تنصيص.
// ============================================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";

function cleanEnvValue(val?: string): string {
  if (!val) return "";
  return val.trim().replace(/^["']|["']$/g, "");
}

const rawUrl = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const rawAnonKey = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const isSupabaseConfigured: boolean = (() => {
  if (!rawUrl || !rawAnonKey) return false;
  if (rawUrl === "https://your-project-id.supabase.co") return false;
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
})();

let cachedClient: SupabaseClient | null = null;

export function getSafeSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (cachedClient) return cachedClient;
  try {
    cachedClient = createClient(rawUrl, rawAnonKey);
    return cachedClient;
  } catch {
    return null;
  }
}

export const supabase: SupabaseClient | null = getSafeSupabaseClient();
