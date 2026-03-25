import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase-server'

export async function GET() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    // Log all cookies
    const allCookies = (() => {
      const anyCookieStore = cookieStore as any
      if (typeof anyCookieStore.getAll === "function") return anyCookieStore.getAll()

      const asString = typeof anyCookieStore.toString === "function" ? anyCookieStore.toString() : ""
      if (!asString || !asString.includes("=")) return []

      return asString
        .split(/;\s*/)
        .filter(Boolean)
        .map((pair: string) => {
          const idx = pair.indexOf("=")
          if (idx === -1) return { name: pair, value: "" }
          return { name: pair.slice(0, idx), value: pair.slice(idx + 1) }
        })
    })()
    console.log('🔍 All cookies:', allCookies.map(c => ({ name: c.name, value: c.value?.substring(0, 20) + '...' })))

    // Try to get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('🔍 Session result:', { 
      hasSession: !!session, 
      userId: session?.user?.id, 
      error: sessionError?.message 
    })

    // Try to get user directly
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('🔍 User result:', { 
      hasUser: !!user, 
      userId: user?.id, 
      error: userError?.message 
    })

    return NextResponse.json({
      cookies: allCookies.map(c => c.name),
      session: {
        hasSession: !!session,
        userId: session?.user?.id,
        error: sessionError?.message
      },
      user: {
        hasUser: !!user,
        userId: user?.id,
        error: userError?.message
      }
    })
  } catch (error) {
    console.error('🔍 Test auth error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
