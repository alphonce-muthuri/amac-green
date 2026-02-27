"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Eye, EyeOff, ArrowLeft, Sparkles, Shield, Zap, Lock, Mail, Check } from "lucide-react"
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
    checkUser()
  }, [])

  const redirectToRoleDashboard = (role: string) => {
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
  }

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-500/30 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-renewable-energy.png"
            alt="Renewable Energy"
            fill
            className="object-cover opacity-20"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 to-teal-700/90"></div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">EVEREADY</h2>
              <p className="text-xs text-emerald-200">ICEP PLATFORM</p>
            </div>
          </Link>

          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-extrabold mb-6 leading-tight">
                Welcome Back to<br />
                <span className="text-emerald-300">Clean Energy</span>
              </h1>
              <p className="text-xl text-emerald-100 leading-relaxed">
                Sign in to access Kenya's leading renewable energy marketplace and continue your sustainable journey.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="w-12 h-12 bg-emerald-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Verified Suppliers</h3>
                  <p className="text-emerald-200 text-sm">Access 1000+ trusted vendors</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="w-12 h-12 bg-teal-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Secure Platform</h3>
                  <p className="text-emerald-200 text-sm">Your data is protected with SSL</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Best Prices</h3>
                  <p className="text-emerald-200 text-sm">Compare and save on energy products</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-emerald-200 text-sm">
            © 2025 EVEREADY ICEP. All rights reserved.
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Home</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-6">Welcome Back</h1>
          </div>

          <div className="hidden lg:block mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Home</span>
            </Link>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Sign In</h1>
            <p className="text-gray-600 text-lg">Enter your credentials to access your account</p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-2xl border-2 flex items-start gap-3 ${
                message.type === "success"
                  ? "bg-green-50 border-green-300 text-green-800"
                  : message.type === "warning"
                  ? "bg-yellow-50 border-yellow-300 text-yellow-800"
                  : "bg-red-50 border-red-300 text-red-800"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                {message.type === "success" ? "✓" : "!"}
              </div>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {showResendVerification && (
            <div className="mb-6 p-5 bg-blue-50 border-2 border-blue-300 rounded-2xl">
              <p className="text-sm text-blue-800 mb-4 font-medium">
                Didn't receive the verification email? We can send you a new one.
              </p>
              <Button
                type="button"
                onClick={handleResendVerification}
                disabled={resendingVerification || !formData.email}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {resendingVerification ? "Sending..." : "Resend Verification Email"}
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-14 pl-4 pr-4 text-base border-2 border-gray-300 focus:border-emerald-500 rounded-xl"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 font-semibold flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-14 pl-4 pr-14 text-base border-2 border-gray-300 focus:border-emerald-500 rounded-xl"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                />
                <span className="text-sm text-gray-700 font-medium">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold">
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                "Sign In to Your Account"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500 mb-4">Or continue with</p>
            <div className="grid grid-cols-3 gap-3">
              <button className="h-12 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
              </button>
              <button className="h-12 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button className="h-12 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}