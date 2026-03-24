"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SiteHeader } from "@/components/site-header"
import { supabase } from "@/lib/supabase"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!email) {
      setError("Please enter your email address")
      setLoading(false)
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    try {
      console.log("[FORGOT_PASSWORD] Sending reset email to:", email)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        console.error("[FORGOT_PASSWORD] Error:", error)
        setError(error.message)
      } else {
        console.log("[FORGOT_PASSWORD] Reset email sent successfully")
        setSent(true)
      }
    } catch (error) {
      console.error("[FORGOT_PASSWORD] Unexpected error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tighter">Check Your Email</CardTitle>
              <CardDescription className="text-sm text-gray-600 tracking-tight">
                We've sent a password reset link to your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  We sent a password reset link to:
                </p>
                <p className="font-medium text-gray-900">{email}</p>
              </div>
              
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full rounded-full border-2 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                  onClick={() => {
                    setSent(false)
                    setEmail("")
                  }}
                >
                  Send Another Email
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full rounded-full hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  onClick={() => router.push("/login")}
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/login")}
                className="p-0 h-auto hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">Back to login</span>
            </div>
            <CardTitle className="text-xl font-bold tracking-tighter">Forgot Password?</CardTitle>
            <CardDescription className="text-sm text-gray-600 tracking-tight">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-800 hover:bg-emerald-600 text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Remember your password?{" "}
                  <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}