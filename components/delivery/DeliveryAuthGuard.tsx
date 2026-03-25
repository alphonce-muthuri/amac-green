"use client"

import type React from "react"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface DeliveryAuthGuardProps {
  children: React.ReactNode
}

export default function DeliveryAuthGuard({ children }: DeliveryAuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        router.push("/login")
        return
      }

      const userRole = user.user_metadata?.role
      if (userRole !== "delivery") {
        router.push("/dashboard")
        return
      }

      setIsAuthorized(true)
    } catch (error) {
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    void checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
