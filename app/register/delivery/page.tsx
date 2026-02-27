"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Truck, User, Car, MapPin, Phone, CreditCard, File } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { SiteHeader } from "@/components/site-header"
import { registerDelivery } from "@/app/actions/auth"
import router from "next/router"

export default function DeliveryRegistrationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setMessage(null)

    try {
      const result = await registerDelivery(formData)

      if (result.success) {
        // Upload documents if any
        if (uploadedFiles.length > 0 && result.applicationId) {
          setMessage({ type: "success", text: "Application submitted! Uploading documents..." })
          
          const uploadPromises = uploadedFiles.map(async (file, index) => {
            const documentFormData = new FormData()
            documentFormData.append("file", file)
            documentFormData.append("applicationType", "delivery")
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
            await saveApplicationDocuments(result.applicationId, "delivery", successfulUploads)
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
        
        // Reset form
        const form = document.getElementById("delivery-form") as HTMLFormElement
        form?.reset()
        setUploadedFiles([])
      } else {
        setMessage({ type: "error", text: result.error })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/register">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Registration Options
              </Button>
            </Link>
          </div>

          <Card className="border-2 border-purple-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <Truck className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-purple-700">Join Our Delivery Network</CardTitle>
              <CardDescription>
                Become a delivery partner and help us deliver renewable energy products across Kenya
              </CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <div
                  className={`mb-6 p-4 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form id="delivery-form" action={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-purple-700">Personal Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" name="firstName" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" name="lastName" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+254 700 123 456" required />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="nationalId">National ID Number *</Label>
                    <Input id="nationalId" name="nationalId" required />
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Car className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-purple-700">Vehicle Information</h3>
                  </div>

                  <div>
                    <Label htmlFor="driverLicense">Driver's License Number *</Label>
                    <Input id="driverLicense" name="driverLicense" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vehicleType">Vehicle Type *</Label>
                      <Select name="vehicleType" required>
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
                    </div>
                    <div>
                      <Label htmlFor="vehicleRegistration">Vehicle Registration Number *</Label>
                      <Input id="vehicleRegistration" name="vehicleRegistration" placeholder="KXX 123X" required />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-purple-700">Address Information</h3>
                  </div>

                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Textarea id="address" name="address" rows={2} required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" name="city" required />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Select name="country" defaultValue="Kenya" required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kenya">Kenya</SelectItem>
                          <SelectItem value="Uganda">Uganda</SelectItem>
                          <SelectItem value="Tanzania">Tanzania</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Phone className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-purple-700">Emergency Contact</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
                      <Input id="emergencyContactName" name="emergencyContactName" required />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
                      <Input id="emergencyContactPhone" name="emergencyContactPhone" type="tel" required />
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-purple-700">Payment Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Select name="bankName" required>
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
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">Account Number *</Label>
                      <Input id="accountNumber" name="accountNumber" required />
                    </div>
                  </div>
                </div>

                {/* Document Upload */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <File className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-purple-700">Required Documents</h3>
                  </div>

                  <FileUpload
                    onFilesChange={setUploadedFiles}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    multiple={true}
                    maxFiles={5}
                    maxSize={10}
                  />
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">Required Documents:</h4>
                    <ul className="text-sm text-purple-600 space-y-1">
                      <li>• Copy of National ID</li>
                      <li>• Copy of Driver's License</li>
                      <li>• Certificate of Good Conduct</li>
                      <li>• Vehicle Registration Certificate</li>
                      <li>• Insurance Certificate (optional)</li>
                    </ul>
                    <p className="text-xs text-purple-500 mt-2">
                      Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-2">Requirements:</h4>
                  <ul className="text-sm text-purple-600 space-y-1">
                    <li>• Valid driver's license</li>
                    <li>• Own vehicle with valid registration</li>
                    <li>• Smartphone with GPS capability</li>
                    <li>• Clean driving record</li>
                    <li>• Ability to lift up to 25kg</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
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
