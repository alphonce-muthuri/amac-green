"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { SiteHeader } from "@/components/site-header"

function SetPasswordForm() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" })
      return
    }

    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long" })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      // This would typically be done through a secure token system
      // For now, we'll use a simple approach
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setMessage({ type: "error", text: error.message })
      } else {
        setMessage({ type: "success", text: "Password set successfully! You can now log in." })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <Card className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tighter">Set Your Password</CardTitle>
              <CardDescription className="text-sm text-gray-600 tracking-tight">
                {email ? `Set a password for ${email}` : "Set your account password"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <div
                  className={`mb-4 p-4 rounded-md ${
                    message.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-800 hover:bg-emerald-600 text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Setting Password..." : "Set Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <Card className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-sm">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SetPasswordForm />
    </Suspense>
  )
}
