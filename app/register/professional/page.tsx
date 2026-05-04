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
import { FileUpload } from "@/components/ui/file-upload"
import { registerProfessional } from "@/app/actions/auth"
import { SiteHeader } from "@/components/site-header"
import { toast } from "@/hooks/use-toast"
import { getFriendlyRegistrationError } from "@/lib/registration-errors"

const draftStorageKey = "professional-registration-draft"

const professionalSchema = z
  .object({
    companyName: z.string().min(2, "Company/Organization name is required"),
    contactPerson: z.string().min(2, "Contact person is required"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(7, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm your password"),
    professionalType: z.string().min(1, "Professional type is required"),
    licenseNumber: z.string().optional(),
    epraLicense: z.string().optional(),
    address: z.string().min(2, "Business address is required"),
    city: z.string().min(2, "City is required"),
    country: z.string().min(2, "Country is required"),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: "Please accept the terms and conditions" }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ProfessionalFormValues = z.infer<typeof professionalSchema>

export default function ProfessionalRegistration() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      professionalType: "",
      licenseNumber: "",
      epraLicense: "",
      address: "",
      city: "",
      country: "",
      acceptTerms: false,
    },
  })

  const professionalType = watch("professionalType")
  const acceptTerms = watch("acceptTerms")
  const password = watch("password")
  const confirmPassword = watch("confirmPassword")
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  useEffect(() => {
    const raw = sessionStorage.getItem(draftStorageKey)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as Partial<ProfessionalFormValues>
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

  const onSubmit = async (values: ProfessionalFormValues) => {
    const submissionData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (key === "acceptTerms") {
        if (value) submissionData.append(key, "on")
        return
      }
      submissionData.append(key, String(value ?? ""))
    })
    uploadedFiles.forEach((file) => submissionData.append("documents", file))

    setIsSubmitting(true)

    const result = await registerProfessional(submissionData)

    if (result.success) {
      sessionStorage.removeItem(draftStorageKey)
      router.push("/register/success?role=professional")
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tighter">Professional Registration</h1>
            <p className="text-gray-600 mt-2 tracking-tight">
              Register as a verified professional for bulk pricing and priority support
            </p>
          </div>

          <Card className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:border-emerald-200/80 transition-colors overflow-hidden">
            <CardHeader className="border-b border-gray-200/70 bg-white/80">
              <CardTitle className="text-xl tracking-tighter">Professional Information</CardTitle>
              <CardDescription>Provide your professional credentials for verification</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company/Organization Name *</Label>
                    <Input id="companyName" {...register("companyName")} />
                    {errors.companyName && <p className="text-xs text-red-600">{errors.companyName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input id="contactPerson" {...register("contactPerson")} />
                    {errors.contactPerson && <p className="text-xs text-red-600">{errors.contactPerson.message}</p>}
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
                  <Label htmlFor="professionalType">Professional Type *</Label>
                  <Select
                    value={professionalType}
                    onValueChange={(value) =>
                      setValue("professionalType", value, { shouldDirty: true, shouldValidate: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your professional category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solar_expert">Solar Expert</SelectItem>
                      <SelectItem value="gas_expert">Gas Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.professionalType && <p className="text-xs text-red-600">{errors.professionalType.message}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Professional License Number</Label>
                    <Input id="licenseNumber" {...register("licenseNumber")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="epraLicense">EPRA License Number</Label>
                    <Input id="epraLicense" {...register("epraLicense")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address *</Label>
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

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-lg font-semibold tracking-tight mb-4">Document Verification</h3>
                  <div className="space-y-4">
                    <FileUpload
                      onFilesChange={setUploadedFiles}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      multiple={true}
                      maxFiles={5}
                      maxSize={10}
                    />
                    
                    <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/70 p-3">
                      <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800 mb-2">
                        Required Documents
                      </h4>
                      <ul className="space-y-1 text-xs text-emerald-700 leading-relaxed">
                        <li>Professional License/Certificate</li>
                        <li>EPRA License (if applicable)</li>
                        <li>Company Registration Certificate</li>
                        <li>Insurance Certificate</li>
                        <li>Project Portfolio (optional)</li>
                      </ul>
                      <p className="mt-2 text-[11px] text-emerald-700/90">
                        PDF, DOC, DOCX, JPG, PNG - max 10MB each
                      </p>
                    </div>
                  </div>
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
                {errors.acceptTerms && <p className="text-xs text-red-600">{errors.acceptTerms.message}</p>}

                <Button
                  type="submit"
                  className="w-full bg-emerald-800 hover:bg-emerald-600 text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting Application..." : "Submit Application"}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
