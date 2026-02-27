"use client"

import { useState } from "react"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileUpload } from "@/components/ui/file-upload"
import { registerVendor } from "@/app/actions/auth"

export default function VendorRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [formData, setFormData] = useState({
    businessType: "",
    acceptTerms: false,
    password: "",
    confirmPassword: "",
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
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

    const result = await registerVendor(formData)

    if (result.success) {
      // Upload documents if any
      if (uploadedFiles.length > 0 && result.applicationId) {
        setMessage({ type: "success", text: "Application submitted! Uploading documents..." })
        
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
          setMessage({ 
            type: "error", 
            text: `Application submitted but ${failedUploads.length} document(s) failed to upload. Please contact support.` 
          })
        } else {
          setMessage({ 
            type: "success", 
            text: `${result.message} All documents uploaded successfully!` 
          })
        }
      } else {
        setMessage({ type: "success", text: result.message })
      }
      
      // Don't auto-redirect, let user read the verification message
      // setTimeout(() => {
      //   router.push("/login")
      // }, 3000)
    } else {
      setMessage({ type: "error", text: result.error })
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/register" className="flex items-center text-green-600 hover:text-green-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to registration options
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Registration</h1>
            <p className="text-gray-600 mt-2">Join our marketplace and start selling renewable energy products</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Please provide accurate information about your business</CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <div
                  className={`mb-4 p-4 rounded-md ${
                    message.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form action={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input id="companyName" name="companyName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input id="contactPerson" name="contactPerson" required />
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
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select
                    name="businessType"
                    onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                    required
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
                  <input type="hidden" name="businessType" value={formData.businessType} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your business and the products you offer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address *</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input id="website" name="website" type="url" placeholder="https://yourwebsite.com" />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID / Registration Number *</Label>
                      <Input id="taxId" name="taxId" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input id="bankName" name="bankName" required />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="accountNumber">Bank Account Number *</Label>
                    <Input id="accountNumber" name="accountNumber" required />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Document Upload</h3>
                  <div className="space-y-4">
                    <FileUpload
                      onFilesChange={setUploadedFiles}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      multiple={true}
                      maxFiles={5}
                      maxSize={10}
                    />
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-700 mb-2">Required Documents:</h4>
                      <ul className="text-sm text-green-600 space-y-1">
                        <li>• Business Registration Certificate</li>
                        <li>• Tax Identification Number (PIN Certificate)</li>
                        <li>• Business License</li>
                        <li>• Bank Statement or Letter</li>
                        <li>• Director's ID Copy (optional)</li>
                      </ul>
                      <p className="text-xs text-green-500 mt-2">
                        Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                      </p>
                    </div>
                  </div>
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
                    <Link href="/terms" className="text-green-600 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-green-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!formData.acceptTerms || isSubmitting}
                >
                  {isSubmitting ? "Submitting Application..." : "Submit Application"}
                </Button>

                {message?.type === "success" && (
                  <div className="mt-4 text-center">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
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
