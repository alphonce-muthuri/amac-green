"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, EyeOff, Truck, User, Car, MapPin, Phone, CreditCard, File } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { SiteHeader } from "@/components/site-header"
import { registerDelivery } from "@/app/actions/auth"
import { toast } from "@/hooks/use-toast"
import { getFriendlyRegistrationError } from "@/lib/registration-errors"

const draftStorageKey = "delivery-registration-draft"

const deliverySchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(7, "Phone number is required"),
    nationalId: z.string().min(4, "National ID number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    driverLicense: z.string().min(4, "Driver's license number is required"),
    vehicleType: z.string().min(1, "Vehicle type is required"),
    vehicleRegistration: z.string().min(3, "Vehicle registration number is required"),
    address: z.string().min(5, "Street address is required"),
    city: z.string().min(2, "City is required"),
    country: z.string().min(2, "Country is required"),
    emergencyContactName: z.string().min(2, "Emergency contact name is required"),
    emergencyContactPhone: z.string().min(7, "Emergency contact phone is required"),
    bankName: z.string().min(1, "Bank name is required"),
    accountNumber: z.string().min(4, "Account number is required"),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: "Please accept the terms and conditions" }) }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type DeliveryFormValues = z.infer<typeof deliverySchema>

export default function DeliveryRegistrationPage() {
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
  } = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliverySchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      nationalId: "",
      password: "",
      confirmPassword: "",
      driverLicense: "",
      vehicleType: "",
      vehicleRegistration: "",
      address: "",
      city: "",
      country: "Kenya",
      emergencyContactName: "",
      emergencyContactPhone: "",
      bankName: "",
      accountNumber: "",
      acceptTerms: false,
    },
  })

  const vehicleType = watch("vehicleType")
  const country = watch("country")
  const bankName = watch("bankName")
  const acceptTerms = watch("acceptTerms")
  const password = watch("password")
  const confirmPassword = watch("confirmPassword")
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  useEffect(() => {
    const raw = sessionStorage.getItem(draftStorageKey)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as Partial<DeliveryFormValues>
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

  const onSubmit = async (values: DeliveryFormValues) => {
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (key === "acceptTerms") {
        if (value) formData.append(key, "on")
        return
      }
      formData.append(key, String(value ?? ""))
    })
    uploadedFiles.forEach((file) => formData.append("documents", file))

    setIsSubmitting(true)
    const result = await registerDelivery(formData)

    if (result.success) {
      sessionStorage.removeItem(draftStorageKey)
      router.push("/register/success?role=delivery")
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tighter">Delivery Partner</h1>
            <p className="text-gray-600 mt-2 tracking-tight">Join our delivery network and help deliver renewable energy products across Kenya</p>
          </div>

          <Card className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:border-emerald-200/80 transition-colors overflow-hidden">
            <CardHeader className="text-center border-b border-gray-200/70 bg-white/80 pb-6">
              <div className="mx-auto mb-4 p-3 bg-emerald-100 rounded-full w-fit">
                <Truck className="h-8 w-8 text-emerald-700" />
              </div>
              <CardTitle className="text-2xl text-gray-900 tracking-tighter">Join Our Delivery Network</CardTitle>
              <CardDescription>
                Become a delivery partner and help us deliver renewable energy products across Kenya
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" {...register("email")} />
                      {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" type="tel" placeholder="+254 700 123 456" {...register("phone")} />
                      {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationalId">National ID Number *</Label>
                    <Input id="nationalId" {...register("nationalId")} />
                    {errors.nationalId && <p className="text-xs text-red-600">{errors.nationalId.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                        </Button>
                      </div>
                      {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <div className="relative">
                        <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} {...register("confirmPassword")} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
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
                </div>

                {/* Vehicle Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Car className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driverLicense">Driver&apos;s License Number *</Label>
                    <Input id="driverLicense" {...register("driverLicense")} />
                    {errors.driverLicense && <p className="text-xs text-red-600">{errors.driverLicense.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vehicle Type *</Label>
                      <Select
                        value={vehicleType}
                        onValueChange={(v) => setValue("vehicleType", v, { shouldValidate: true, shouldDirty: true })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="motorcycle">Motorcycle</SelectItem>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="pickup">Pickup Truck</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.vehicleType && <p className="text-xs text-red-600">{errors.vehicleType.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleRegistration">Vehicle Registration Number *</Label>
                      <Input id="vehicleRegistration" placeholder="KXX 123X" {...register("vehicleRegistration")} />
                      {errors.vehicleRegistration && <p className="text-xs text-red-600">{errors.vehicleRegistration.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Textarea id="address" rows={2} {...register("address")} />
                    {errors.address && <p className="text-xs text-red-600">{errors.address.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" {...register("city")} />
                      {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Country *</Label>
                      <Select
                        value={country}
                        onValueChange={(v) => setValue("country", v, { shouldValidate: true, shouldDirty: true })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kenya">Kenya</SelectItem>
                          <SelectItem value="Uganda">Uganda</SelectItem>
                          <SelectItem value="Tanzania">Tanzania</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.country && <p className="text-xs text-red-600">{errors.country.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Phone className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Contact Name *</Label>
                      <Input id="emergencyContactName" {...register("emergencyContactName")} />
                      {errors.emergencyContactName && <p className="text-xs text-red-600">{errors.emergencyContactName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Contact Phone *</Label>
                      <Input id="emergencyContactPhone" type="tel" {...register("emergencyContactPhone")} />
                      {errors.emergencyContactPhone && <p className="text-xs text-red-600">{errors.emergencyContactPhone.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bank Name *</Label>
                      <Select
                        value={bankName}
                        onValueChange={(v) => setValue("bankName", v, { shouldValidate: true, shouldDirty: true })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KCB Bank">KCB Bank</SelectItem>
                          <SelectItem value="Equity Bank">Equity Bank</SelectItem>
                          <SelectItem value="Cooperative Bank">Cooperative Bank</SelectItem>
                          <SelectItem value="NCBA Bank">NCBA Bank</SelectItem>
                          <SelectItem value="Standard Chartered">Standard Chartered</SelectItem>
                          <SelectItem value="Absa Bank">Absa Bank</SelectItem>
                          <SelectItem value="DTB Bank">DTB Bank</SelectItem>
                          <SelectItem value="I&M Bank">I&M Bank</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.bankName && <p className="text-xs text-red-600">{errors.bankName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input id="accountNumber" {...register("accountNumber")} />
                      {errors.accountNumber && <p className="text-xs text-red-600">{errors.accountNumber.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Document Upload */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <File className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
                  </div>

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
                      <li>Copy of National ID</li>
                      <li>Copy of Driver&apos;s License</li>
                      <li>Certificate of Good Conduct</li>
                      <li>Vehicle Registration Certificate</li>
                      <li>Insurance Certificate (optional)</li>
                    </ul>
                    <p className="mt-2 text-[11px] text-emerald-700/90">PDF, DOC, DOCX, JPG, PNG — max 10MB each</p>
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200/60">
                  <h4 className="font-semibold text-emerald-800 mb-2">Requirements:</h4>
                  <ul className="text-sm text-emerald-700 space-y-1">
                    <li>• Valid driver&apos;s license</li>
                    <li>• Own vehicle with valid registration</li>
                    <li>• Smartphone with GPS capability</li>
                    <li>• Clean driving record</li>
                    <li>• Ability to lift up to 25kg</li>
                  </ul>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) =>
                      setValue("acceptTerms", checked === true, { shouldValidate: true, shouldDirty: true })
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
