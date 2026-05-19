import { createClient } from "@supabase/supabase-js"

// Server-only admin client — bypasses RLS. Never import this in client components.
// Lazy to avoid evaluating env vars at build time.
export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
