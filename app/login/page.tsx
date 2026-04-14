"use client"

import type React from "react"
import { useCallback, useState, useEffect } from "react"
import { Eye, EyeOff, ArrowLeft, Sparkles, Shield, Lock, Mail, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null)
  const [showResendVerification, setShowResendVerification] = useState(false)
  const [resendingVerification, setResendingVerification] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  const redirectToRoleDashboard = useCallback((role: string) => {
    switch (role) {
      case "vendor":
        router.push("/vendor")
        break
      case "professional":
        router.push("/professional")
        break
      case "admin":
        router.push("/admin")
        break
      case "delivery":
        router.push("/delivery")
        break
      case "customer":
      default:
        router.push("/dashboard")
        break
    }
  }, [router])

  useEffect(() => {
    const checkUser = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const messageParam = urlParams.get('message')
        
        if (messageParam === 'password_updated') {
          setMessage({
            type: 'success',
            text: 'Password updated successfully! You can now sign in with your new password.'
          })
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const userRole = user.user_metadata?.role || "customer"
          redirectToRoleDashboard(userRole)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    void checkUser()
  }, [redirectToRoleDashboard])

  const handleResendVerification = async () => {
    if (!formData.email) {
      setMessage({ type: "error", text: "Please enter your email address first." })
      return
    }

    setResendingVerification(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      })

      if (error) {
        setMessage({ type: "error", text: error.message })
      } else {
        setMessage({ 
          type: "success", 
          text: "Verification email sent! Please check your inbox and click the verification link." 
        })
        setShowResendVerification(false)
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to send verification email. Please try again." })
    } finally {
      setResendingVerification(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        console.error("Login error:", error)
        
        if (error.message.includes("Email not confirmed") || error.message.includes("email_not_confirmed")) {
          setMessage({ 
            type: "warning", 
            text: "Please verify your email address before logging in. Check your inbox for the verification link." 
          })
          setShowResendVerification(true)
        } else {
          setMessage({ type: "error", text: error.message })
        }
        setIsSubmitting(false)
        return
      }

      if (!data.user) {
        setMessage({ type: "error", text: "Login failed - no user data" })
        setIsSubmitting(false)
        return
      }

      setMessage({ type: "success", text: "Login successful! Redirecting..." })

      setTimeout(() => {
        const userRole = data.user.user_metadata?.role || "customer"
        redirectToRoleDashboard(userRole)
      }, 1000)
    } catch (error) {
      console.error("Login exception:", error)
      setMessage({ type: "error", text: "An unexpected error occurred during login" })
      setIsSubmitting(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-800 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white/20 rounded-full" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-t-white rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden flex bg-gradient-to-b from-white to-gray-50">
      {/* Left panel - brand & benefits (independently scrollable, scrollbar hidden) */}
      <div className="hidden lg:flex lg:w-1/2 lg:h-screen lg:min-h-0 relative flex-col overflow-y-auto overflow-x-hidden scrollbar-hide bg-gradient-to-br from-[#052e1a] via-[#0b3b24] to-[#062515]">
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/images/hero-renewable-energy.png"
            alt="Renewable Energy"
            fill
            className="object-cover opacity-15"
          />
        </div>
        <div
          className="absolute inset-0 opacity-10 bg-[length:40px_40px] [background-image:radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] pointer-events-none"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-emerald-900/90 to-[#041d12]/90 pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full min-h-full">
          <Link href="/" className="inline-block group transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/images/logo/AMAC-Green-logo.png"
              alt="AMAC Green"
              width={160}
              height={48}
              className="h-10 w-auto object-contain brightness-0 invert"
            />
          </Link>

          <div className="space-y-8">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] text-emerald-200/90 uppercase">
              AMAC GREEN • SIGN IN
            </p>
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight tracking-tighter">
                Welcome back to<br />
                <span className="text-emerald-300">clean energy</span>
              </h1>
              <p className="text-base text-emerald-50/90 leading-relaxed tracking-tight max-w-xl">
                Sign in to access Kenya's leading renewable energy marketplace and continue your sustainable journey.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:bg-white/[0.06]">
                <div className="w-9 h-9 bg-emerald-400/20 border border-emerald-300/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight">Verified Suppliers</h3>
                  <p className="text-emerald-100/80 text-sm tracking-tight">Access 1000+ trusted vendors</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:bg-white/[0.06]">
                <div className="w-9 h-9 bg-emerald-400/20 border border-emerald-300/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight">Secure Platform</h3>
                  <p className="text-emerald-100/80 text-sm tracking-tight">Your data is protected with SSL</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:bg-white/[0.06]">
                <div className="w-9 h-9 bg-emerald-400/20 border border-emerald-300/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight">Best Prices</h3>
                  <p className="text-emerald-100/80 text-sm tracking-tight">Compare and save on energy products</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-emerald-200/80 text-sm tracking-tight">
            © 2025 AMAC Green & Renewable Energy. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel - form (independently scrollable, scrollbar hidden) */}
      <div className="flex-1 min-h-0 h-screen overflow-y-auto overflow-x-hidden scrollbar-hide flex justify-center p-6 sm:p-8">
        <div className="min-h-full flex flex-col w-full max-w-md py-8 justify-center">
          <div className="mb-6 lg:hidden text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white/80 text-gray-700 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-300 text-xs font-medium mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mt-3">AMAC GREEN • SIGN IN</p>
            <h1 className="text-xl font-semibold text-gray-900 mt-1.5 tracking-tighter">Welcome back</h1>
            <div className="w-10 h-[1px] bg-emerald-600/40 rounded-full mx-auto mt-2" />
          </div>

          <div className="hidden lg:block mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white/80 text-gray-700 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-300 text-xs font-medium mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to home
            </Link>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1.5">AMAC GREEN • SIGN IN</p>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1.5 tracking-tighter">Sign in</h1>
            <p className="text-sm text-gray-600 tracking-tight mb-3">Enter your credentials to access your account</p>
            <div className="w-12 h-[1px] bg-emerald-600/40 rounded-full" />
          </div>

          {/* Form card - matches landing feature cards */}
          <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm p-5 sm:p-6 hover:border-emerald-200/80 transition-all duration-300">
          {message && (
            <div
              className={`mb-4 p-3 rounded-xl border flex items-start gap-2.5 ${
                message.type === "success"
                  ? "bg-emerald-50 border-emerald-200/80 text-emerald-800"
                  : message.type === "warning"
                  ? "bg-gray-100 border-gray-300 text-gray-800"
                  : "bg-gray-900 border-gray-900 text-white"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white/80 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                {message.type === "success" ? "✓" : "!"}
              </div>
              <p className="text-xs font-medium tracking-tight">{message.text}</p>
            </div>
          )}

          {showResendVerification && (
            <div className="mb-4 p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-xl">
              <p className="text-xs text-emerald-800 mb-3 font-medium tracking-tight">
                Didn't receive the verification email? We can send you a new one.
              </p>
              <Button
                type="button"
                onClick={handleResendVerification}
                disabled={resendingVerification || !formData.email}
                className="w-full h-10 bg-emerald-800 hover:bg-emerald-600 text-white text-sm font-medium rounded-full shadow hover:shadow-md transition-all duration-300"
              >
                {resendingVerification ? "Sending..." : "Resend Verification Email"}
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-900 text-sm font-medium flex items-center gap-1.5 ml-2">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-10 pl-4 pr-4 text-sm border border-gray-300 focus:border-emerald-500 rounded-full"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-900 text-sm font-medium flex items-center gap-1.5 ml-2">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-10 pl-4 pr-10 text-sm border border-gray-300 focus:border-emerald-500 rounded-full"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                />
                <span className="text-xs text-gray-700 font-medium">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-emerald-800 hover:bg-emerald-600 text-white text-sm font-medium rounded-full shadow hover:shadow-md transition-all duration-300"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </div>
              ) : (
                "Sign In to Your Account"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600 tracking-tight">
              Don't have an account?{" "}
              <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                Create Account
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200/80">
            <p className="text-center text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-3">Or continue with</p>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" aria-label="Continue with Google" className="h-9 border border-gray-200 rounded-full hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-300 flex items-center justify-center text-gray-600 hover:text-emerald-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
              </button>
              <button type="button" aria-label="Continue with Facebook" className="h-9 border border-gray-200 rounded-full hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-300 flex items-center justify-center text-gray-600 hover:text-emerald-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button type="button" aria-label="Continue with Twitter" className="h-9 border border-gray-200 rounded-full hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-300 flex items-center justify-center text-gray-600 hover:text-emerald-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/>
                </svg>
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}