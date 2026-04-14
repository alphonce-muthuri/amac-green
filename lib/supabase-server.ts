import { createServerClient as createSSRClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase server environment variables")
}

// Admin client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Server client for server-side operations with RLS enabled.
// Accepts the resolved cookie store from `await cookies()` so callers
// don't need to know about @supabase/ssr internals.
// In server actions the setAll handler can write refreshed tokens back
// to the response; in server components it silently no-ops.
export function createServerClient(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createSSRClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server components cannot write cookies; server actions can.
            // The middleware will handle proactive refresh for components.
          }
        },
      },
    }
  )
}
