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
    // Build cookie string manually to ensure proper format
    const cookiePairs: string[] = []
    
    // Get all cookies and format them properly
    cookieStore.getAll().forEach(cookie => {
      if (cookie.name && cookie.value) {
        cookiePairs.push(`${cookie.name}=${cookie.value}`)
      }
    })
    
    if (cookiePairs.length > 0) {
      config.global = {
        headers: {
          cookie: cookiePairs.join('; ')
        },
      }
    }
  }

  return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, config)
}
