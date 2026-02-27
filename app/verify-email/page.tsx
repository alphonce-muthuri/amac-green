"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Mail, ArrowRight } from "lucide-react"
import Link from "next/link"
import { de } from "date-fns/locale"

function VerifyEmailContent() {
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get the token from URL parameters
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        if (!token || type !== "email") {
          setVerificationStatus("error")
          setMessage("Invalid verification link. Please check your email for the correct link.")
          return
        }

        // Verify the email using Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        })

        if (error) {
          setVerificationStatus("error")
          setMessage(error.message || "Email verification failed. The link may have expired.")
          return
        }

        if (data.user) {
          setVerificationStatus("success")
          setMessage("Your email has been successfully verified! You can now log in to your account.")

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login")
          }, 3000)
        } else {
          setVerificationStatus("error")
          setMessage("Email verification failed. Please try again or contact support.")
        }
      } catch (error) {
        setVerificationStatus("error")
        setMessage("An unexpected error occurred during verification.")
      }
    }

    handleEmailVerification()
  }, [searchParams, router])

  const resendVerification = async () => {
    // This would need to be implemented based on your needs
    // For now, we'll just redirect to login where they can request a new verification
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full w-fit">
              {verificationStatus === "loading" && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              )}
              {verificationStatus === "success" && (
                <CheckCircle className="h-8 w-8 text-green-600" />
              )}
              {verificationStatus === "error" && (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            <CardTitle>
              {verificationStatus === "loading" && "Verifying Email..."}
              {verificationStatus === "success" && "Email Verified!"}
              {verificationStatus === "error" && "Verification Failed"}
            </CardTitle>
            <CardDescription>
              {verificationStatus === "loading" && "Please wait while we verify your email address."}
              {verificationStatus === "success" && "Your account is now active and ready to use."}
              {verificationStatus === "error" && "There was a problem verifying your email address."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-md ${verificationStatus === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : verificationStatus === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
              <p className="text-sm">{message}</p>
            </div>

            {verificationStatus === "success" && (
              <div className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/login">
                    Continue to Login
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  You will be automatically redirected in a few seconds...
                </p>
              </div>
            )}

            {verificationStatus === "error" && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resendVerification}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Go to Login
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  You can request a new verification email from the login page.
                </p>
              </div>
            )}

            <div className="text-center">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-800">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full w-fit">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Please wait while we load the verification page.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}