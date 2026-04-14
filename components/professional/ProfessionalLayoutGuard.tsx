"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ProfessionalLayoutGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user
      if (!user) {
        router.replace("/login")
        return
      }
      const role = user.user_metadata?.role
      if (role !== "professional") {
        if (role === "admin") router.replace("/admin")
        else if (role === "vendor") router.replace("/vendor")
        else router.replace("/dashboard")
      }
    })
  }, [router])

  return <>{children}</>
}
