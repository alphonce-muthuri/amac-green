"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { z } from "zod"
import { FieldErrors, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileUpload } from "@/components/ui/file-upload"
import { registerVendor } from "@/app/actions/auth"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { toast } from "@/hooks/use-toast"
import { getFriendlyRegistrationError } from "@/lib/registration-errors"

const draftStorageKey = "vendor-registration-draft"

const vendorSchema = z
  .object({
    companyName: z.string().min(2, "Company name is required"),
    contactPerson: z.string().min(2, "Contact person is required"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(7, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm your password"),
    businessType: z.string().min(1, "Business type is required"),
    description: z.string().optional(),
    address: z.string().min(2, "Business address is required"),
    city: z.string().min(2, "City is required"),
    country: z.string().min(2, "Country is required"),
    website: z.union([z.literal(""), z.string().url("Enter a valid URL starting with https://")]),
    taxId: z.string().min(2, "Tax ID / Registration Number is required"),
    bankName: z.string().min(2, "Bank name is required"),
    accountNumber: z.string().min(2, "Bank account number is required"),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: "Please accept the terms and conditions" }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type VendorFormValues = z.infer<typeof vendorSchema>

export default function VendorRegistration() {
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
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      businessType: "",
      description: "",
      address: "",
      city: "",
      country: "",
      website: "",
      taxId: "",
      bankName: "",
      accountNumber: "",
      acceptTerms: false,
    },
  })

  const businessType = watch("businessType")
  const acceptTerms = watch("acceptTerms")
  const password = watch("password")
  const confirmPassword = watch("confirmPassword")
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  useEffect(() => {
    const raw = sessionStorage.getItem(draftStorageKey)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as Partial<VendorFormValues>
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

  const onSubmit = async (values: VendorFormValues) => {
    const submissionData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (key === "acceptTerms") {
        if (value) submissionData.append(key, "on")
        return
      }
      submissionData.append(key, String(value ?? ""))
    })

    setIsSubmitting(true)

    const result = await registerVendor(submissionData)

    if (result.success) {
      // Upload documents if any
      if (uploadedFiles.length > 0 && result.applicationId) {
        toast({ title: "Application submitted", description: "Uploading documents..." })
        
        const uploadPromises = uploadedFiles.map(async (file, index) => {
          const documentFormData = new FormData()
          documentFormData.append("file", file)
          documentFormData.append("applicationType", "vendor")
          documentFormData.append("applicationId", result.applicationId)
          documentFormData.append("documentType", `document-${index + 1}`)

          const response = await fetch("/api/upload/documents", {
            method: "POST",
            body: documentFormData,
          })

          const uploadResult = await response.json()
          
          if (uploadResult.success) {
            return {
              url: uploadResult.url,
              type: `document-${index + 1}`,
              name: file.name,
              uploadedAt: new Date().toISOString()
            }
          }
          
          return null
        })

        const uploadResults = await Promise.all(uploadPromises)
        const successfulUploads = uploadResults.filter(r => r !== null)
        const failedUploads = uploadResults.filter(r => r === null)
        
        // Save document URLs to database
        if (successfulUploads.length > 0) {
          const { saveApplicationDocuments } = await import("@/app/actions/documents")
          await saveApplicationDocuments(result.applicationId, "vendor", successfulUploads)
        }
        
        if (failedUploads.length > 0) {
          toast({
            title: "Some documents failed to upload",
            description: `Your application was submitted, but ${failedUploads.length} document(s) failed. Please try again or contact support.`,
            variant: "destructive",
          })
        } else {
          toast({ title: "Success", description: `${result.message} All documents uploaded successfully!` })
        }
      } else {
        toast({ title: "Success", description: result.message })
      }

      sessionStorage.removeItem(draftStorageKey)
      
    } else {
      toast({
        title: "Couldn't submit application",
        description: getFriendlyRegistrationError(result.error),
        variant: "destructive",
      })
    }

    setIsSubmitting(false)
  }

  const onInvalid = (formErrors: FieldErrors<VendorFormValues>) => {
    const firstError = Object.values(formErrors)[0]
    const message =
      firstError && typeof firstError === "object" && "message" in firstError
        ? String(firstError.message)
        : "Please fix the highlighted fields and try again."
    toast({ title: "Please check your details", description: message, variant: "destructive" })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />
      <main className="flex-1 -mt-20 pt-28 sm:pt-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
          <div className="mb-8">
            <Link href="/register" className="inline-flex items-center text-sm text-emerald-700 hover:text-emerald-600 font-medium mb-5 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to registration options
            </Link>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.4em] mb-3">Vendor Registration</p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight leading-none">
              Build your supplier profile.
            </h1>
            <p className="text-gray-500 mt-3 text-sm leading-relaxed max-w-2xl">
              Share your company details to join our marketplace and start selling renewable energy products.
            </p>
          </div>

          <Card className="rounded-2xl border border-gray-200 bg-white shadow-none overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-white">
              <CardTitle className="text-xl tracking-tight">Company Information</CardTitle>
              <CardDescription className="text-gray-500">
                Please provide accurate information about your business.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
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
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select
                    value={businessType}
                    onValueChange={(value) => setValue("businessType", value, { shouldValidate: true, shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manufacturer">Manufacturer</SelectItem>
                      <SelectItem value="distributor">Distributor</SelectItem>
                      <SelectItem value="installer">Installer</SelectItem>
                      <SelectItem value="retailer">Retailer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.businessType && <p className="text-xs text-red-600">{errors.businessType.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Describe your business and the products you offer"
                  />
                  {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
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

                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input id="website" type="url" placeholder="https://yourwebsite.com" {...register("website")} />
                  {errors.website && <p className="text-xs text-red-600">{errors.website.message}</p>}
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-lg font-semibold tracking-tight mb-4">Financial Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID / Registration Number *</Label>
                      <Input id="taxId" {...register("taxId")} />
                      {errors.taxId && <p className="text-xs text-red-600">{errors.taxId.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input id="bankName" {...register("bankName")} />
                      {errors.bankName && <p className="text-xs text-red-600">{errors.bankName.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="accountNumber">Bank Account Number *</Label>
                    <Input id="accountNumber" {...register("accountNumber")} />
                    {errors.accountNumber && <p className="text-xs text-red-600">{errors.accountNumber.message}</p>}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-lg font-semibold tracking-tight mb-4">Document Upload</h3>
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
                        <li>Business Registration Certificate</li>
                        <li>Tax Identification Number (PIN Certificate)</li>
                        <li>Business License</li>
                        <li>Bank Statement or Letter</li>
                        <li>Director&apos;s ID Copy (optional)</li>
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
                    onCheckedChange={(checked) => setValue("acceptTerms", checked === true, { shouldValidate: true, shouldDirty: true })}
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

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-emerald-700 hover:bg-emerald-600 text-white rounded-full h-10 text-sm font-medium transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting Application..." : "Submit Application"}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
