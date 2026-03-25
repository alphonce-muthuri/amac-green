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

// Server client for server-side operations with RLS enabled
export function createServerClient(cookieStore?: ReturnType<typeof cookies>) {
  const config: any = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }

  // Only add cookies if cookieStore is provided
  if (cookieStore) {
    const anyCookieStore = cookieStore as any

    // Next's `cookies()` API differs a bit between versions/transport.
    // We only need a raw `Cookie` header string for Supabase client requests.
    let cookieHeader: string | undefined

    // Preferred: Next versions that expose `getAll()`
    if (typeof anyCookieStore.getAll === "function") {
      const cookiePairs: string[] = []
      anyCookieStore.getAll().forEach((cookie: any) => {
        if (cookie?.name && cookie?.value) cookiePairs.push(`${cookie.name}=${cookie.value}`)
      })
      if (cookiePairs.length > 0) cookieHeader = cookiePairs.join("; ")
    } else if (typeof anyCookieStore.toString === "function") {
      // Fallback: `toString()` often returns `name=value; name2=value2`
      const asString = anyCookieStore.toString()
      if (asString && asString.includes("=")) cookieHeader = asString
    } else if (typeof anyCookieStore[Symbol.iterator] === "function") {
      // Last resort: try iterating cookies (if supported)
      const cookiePairs: string[] = []
      for (const entry of anyCookieStore as any) {
        const name = Array.isArray(entry) ? entry[0] : entry?.name
        const value = Array.isArray(entry) ? entry[1] : entry?.value
        if (name && value) cookiePairs.push(`${name}=${value}`)
      }
      if (cookiePairs.length > 0) cookieHeader = cookiePairs.join("; ")
    }

    if (cookieHeader) {
      config.global = {
        headers: {
          cookie: cookieHeader,
        },
      }
    }
  }

  return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, config)
}
