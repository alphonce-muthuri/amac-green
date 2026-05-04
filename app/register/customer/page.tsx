"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { registerCustomer } from "@/app/actions/auth"
import { SiteHeader } from "@/components/site-header"
import { toast } from "@/hooks/use-toast"
import { getFriendlyRegistrationError } from "@/lib/registration-errors"

const draftStorageKey = "customer-registration-draft"

const customerSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(7, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm your password"),
    customerType: z.string().min(1, "Customer type is required"),
    organizationName: z.string().optional(),
    address: z.string().min(2, "Address is required"),
    city: z.string().min(2, "City is required"),
    country: z.string().min(2, "Country is required"),
    acceptMarketing: z.boolean(),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: "Please accept the terms and conditions" }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type CustomerFormValues = z.infer<typeof customerSchema>

export default function CustomerRegistration() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      customerType: "",
      organizationName: "",
      address: "",
      city: "",
      country: "",
      acceptMarketing: false,
      acceptTerms: false,
    },
  })

  const customerType = watch("customerType")
  const acceptMarketing = watch("acceptMarketing")
  const acceptTerms = watch("acceptTerms")
  const password = watch("password")
  const confirmPassword = watch("confirmPassword")
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  useEffect(() => {
    const raw = sessionStorage.getItem(draftStorageKey)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as Partial<CustomerFormValues>
      reset({ ...parsed })
    } catch {
      sessionStorage.removeItem(draftStorageKey)
    }
  }, [reset])

  useEffect(() => {
    const subscription = watch((values) => {
      sessionStorage.setItem(draftStorageKey, JSON.stringify(values))
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const onSubmit = async (values: CustomerFormValues) => {
    const submissionData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (key === "acceptTerms" || key === "acceptMarketing") {
        if (value) submissionData.append(key, "on")
        return
      }
      submissionData.append(key, String(value ?? ""))
    })

    setIsSubmitting(true)

    const result = await registerCustomer(submissionData)

    if (result.success) {
      sessionStorage.removeItem(draftStorageKey)
      router.push("/register/success?role=customer")
      return
    } else {
      toast({ description: getFriendlyRegistrationError(result.error), variant: "destructive" })
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" {...register("firstName")} />
                    {errors.firstName && <p className="text-xs text-red-600">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" {...register("lastName")} />
                    {errors.lastName && <p className="text-xs text-red-600">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" type="tel" {...register("phone")} />
                    {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
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
                    {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        {...register("confirmPassword")}
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
                    {confirmPassword.length > 0 && !errors.confirmPassword && (
                      <p className={`text-xs ${passwordsMatch ? "text-emerald-600" : "text-red-600"}`}>
                        {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                      </p>
                    )}
                    {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerType">Customer Type *</Label>
                  <Select
                    value={customerType}
                    onValueChange={(value) => setValue("customerType", value, { shouldDirty: true, shouldValidate: true })}
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
                  {errors.customerType && <p className="text-xs text-red-600">{errors.customerType.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name (Optional)</Label>
                  <Input 
                    id="organizationName" 
                    {...register("organizationName")}
                    placeholder="Enter organization name if applicable"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" {...register("address")} />
                  {errors.address && <p className="text-xs text-red-600">{errors.address.message}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" {...register("city")} />
                    {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" {...register("country")} />
                    {errors.country && <p className="text-xs text-red-600">{errors.country.message}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptMarketing"
                      checked={acceptMarketing}
                      onCheckedChange={(checked) =>
                        setValue("acceptMarketing", checked === true, { shouldDirty: true, shouldValidate: true })
                      }
                    />
                    <Label htmlFor="acceptMarketing" className="text-sm">
                      I would like to receive marketing emails about new products and offers
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) =>
                        setValue("acceptTerms", checked === true, { shouldDirty: true, shouldValidate: true })
                      }
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
                {errors.acceptTerms && <p className="text-xs text-red-600">{errors.acceptTerms.message}</p>}

                <Button
                  type="submit"
                  className="w-full bg-emerald-800 hover:bg-emerald-600 text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}