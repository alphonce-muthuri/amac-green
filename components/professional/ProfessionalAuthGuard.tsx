"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, LogOut } from "lucide-react"

interface ProfessionalAuthGuardProps {
  children: React.ReactNode
}

export default function ProfessionalAuthGuard({ children }: ProfessionalAuthGuardProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isProfessional, setIsProfessional] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<any>(null)
  const router = useRouter()

  const checkUser = useCallback(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {

        router.push("/login")
        return
      }

      if (!user) {
        router.push("/login")
        return
      }

      setUser(user)

      // Check if user is a professional
      const userRole = user.user_metadata?.role
      if (userRole !== "professional") {
        // Redirect non-professionals to their appropriate dashboard
        switch (userRole) {
          case "admin":
            router.push("/admin")
            break
          case "vendor":
            router.push("/vendor")
            break
          case "customer":
          default:
            router.push("/dashboard")
            break
        }
        return
      }

      setIsProfessional(true)

      // Get professional application status
      const { data: applicationData, error: applicationError } = await supabase
        .from("professional_applications")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (applicationError && applicationError.code !== "PGRST116") {

        return
      }

      setApplicationStatus(applicationData)
    } catch (error) {
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void checkUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login")
      } else if (event === "SIGNED_IN" && session) {
        await checkUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [router, checkUser])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      // Handle logout error silently
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user || !isProfessional) {
    return null // Will redirect to appropriate page
  }

  // If professional but application is not approved, show pending message
  if (applicationStatus && applicationStatus.status !== "approved") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
              <CardTitle className="text-orange-800">Application Pending</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-orange-700">
              Your professional application is currently <strong>{applicationStatus.status}</strong>.
            </p>
            {applicationStatus.status === "pending" && (
              <p className="text-sm text-orange-600">
                Our team is reviewing your professional credentials. This typically takes 1-3 business days.
                Once approved, you'll have access to all professional features.
              </p>
            )}
            {applicationStatus.status === "rejected" && (
              <p className="text-sm text-orange-600">
                Your application was not approved. Please contact support for more information or to resubmit.
              </p>
            )}
            <div className="text-sm text-orange-600">
              <p>
                <strong>Company:</strong> {applicationStatus.company_name || "N/A"}
              </p>
              <p>
                <strong>Professional Type:</strong> {applicationStatus.professional_type || "N/A"}
              </p>
              <p>
                <strong>Applied:</strong>{" "}
                {applicationStatus.created_at
                  ? new Date(applicationStatus.created_at).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Button onClick={() => router.push("/contact")}>
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If professional and approved, show the protected content
  return <>{children}</>
}
