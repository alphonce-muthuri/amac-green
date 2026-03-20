"use client"

import { useState } from "react"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { registerCustomer } from "@/app/actions/auth"
import { SiteHeader } from "@/components/site-header"

export default function CustomerRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [formData, setFormData] = useState({
    customerType: "",
    acceptTerms: false,
    acceptMarketing: false,
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    if (!formData.get("acceptTerms")) {
      setMessage({ type: "error", text: "Please accept the terms and conditions" })
      return
    }

    if (formData.get("password") !== formData.get("confirmPassword")) {
      setMessage({ type: "error", text: "Passwords do not match" })
      return
    }

    if ((formData.get("password") as string).length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long" })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    const result = await registerCustomer(formData)

    if (result.success) {
      setMessage({ type: "success", text: result.message })
      // Don't auto-redirect, let user read the verification message
    } else {
      setMessage({ type: "error", text: result.error })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/register" className="flex items-center text-emerald-600 hover:text-emerald-700 font-medium mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to registration options
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tighter">Customer Registration</h1>
            <p className="text-gray-600 mt-2 tracking-tight">Create your account to start shopping for renewable energy products</p>
          </div>

          <Card className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:border-emerald-200/80 transition-colors overflow-hidden">
            <CardHeader className="border-b border-gray-200/70 bg-white/80">
              <CardTitle className="text-xl tracking-tighter">Personal Information</CardTitle>
              <CardDescription>Please provide your details to create your account</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {message && (
                <div
                  className={`mb-4 p-4 rounded-xl border ${
                    message.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                      : "bg-red-50 text-red-800 border-red-200/80"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form action={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" name="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" name="lastName" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" name="phone" type="tel" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerType">Customer Type *</Label>
                  <Select
                    name="customerType"
                    onValueChange={(value) => setFormData({ ...formData, customerType: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual/Homeowner</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="school">School/Educational Institution</SelectItem>
                      <SelectItem value="hospital">Hospital/Healthcare</SelectItem>
                      <SelectItem value="government">Government/Public Sector</SelectItem>
                      <SelectItem value="ngo">NGO/Non-Profit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="customerType" value={formData.customerType} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name (Optional)</Label>
                  <Input 
                    id="organizationName" 
                    name="organizationName" 
                    placeholder="Enter organization name if applicable"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" name="address" required />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" name="city" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" name="country" required />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptMarketing"
                      name="acceptMarketing"
                      checked={formData.acceptMarketing}
                      onCheckedChange={(checked) => setFormData({ ...formData, acceptMarketing: checked as boolean })}
                    />
                    <Label htmlFor="acceptMarketing" className="text-sm">
                      I would like to receive marketing emails about new products and offers
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                    />
                    <Label htmlFor="acceptTerms" className="text-sm">
                      I agree to the{" "}
                      <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 font-medium">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700 font-medium">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-800 hover:bg-emerald-600 text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all"
                  disabled={!formData.acceptTerms || isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>

                {message?.type === "success" && (
                  <div className="mt-4 text-center">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => router.push("/login")}
                    >
                      Go to Login Page
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}