import { createServerClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

/**
 * Verifies the current session belongs to an admin.
 * Returns the admin's userId on success, or null if unauthenticated / unauthorized.
 * Always calls getUser() for cryptographic verification — never trusts caller-supplied identity.
 */
export async function requireAdmin(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    if (user.user_metadata?.role !== "admin") return null
    return user.id
  } catch {
    return null
  }
}
