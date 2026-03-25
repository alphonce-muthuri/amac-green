"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/ui/file-upload"
import { 
  Settings, 
  User, 
  Building2, 
  FileText, 
  Shield,
  Save,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Award,
  Key,
  Lock,
  Sparkles,
  Clock,
  Star,
  Zap,
  Calendar
} from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ProfessionalSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("Auth error:", error)
        return
      }

      if (!user) {
        return
      }

      setUser(user)

      // Get professional profile
      const { data: profileData, error: profileError } = await supabase
        .from("professional_applications")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile:", profileError)
        return
      }

      setProfile(profileData)
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (formData: FormData) => {
    setSaving(true)
    setMessage(null)

    try {
      const updateData = {
        company_name: formData.get("companyName") as string,
        contact_person: formData.get("contactPerson") as string,
        phone: formData.get("phone") as string,
        professional_type: formData.get("professionalType") as string,
        license_number: formData.get("licenseNumber") as string,
        address: formData.get("address") as string,
        city: formData.get("city") as string,
        country: formData.get("country") as string,
        epra_license: formData.get("epraLicense") as string,
      }

      const { error } = await supabase
        .from("professional_applications")
        .update(updateData)
        .eq("user_id", user.id)

      if (error) {
        throw error
      }

      setMessage({ type: "success", text: "Profile updated successfully!" })
      await checkUser() // Refresh profile
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "Failed to update profile. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (formData: FormData) => {
    setSaving(true)
    setMessage(null)

    try {
      const newPassword = formData.get("newPassword") as string
      const confirmPassword = formData.get("confirmPassword") as string

      if (newPassword !== confirmPassword) {
        setMessage({ type: "error", text: "Passwords do not match" })
        return
      }

      if (newPassword.length < 6) {
        setMessage({ type: "error", text: "Password must be at least 6 characters long" })
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      setMessage({ type: "success", text: "Password updated successfully!" })
    } catch (error) {
      console.error("Error updating password:", error)
      setMessage({ type: "error", text: "Failed to update password. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <Settings className="absolute inset-0 m-auto h-8 w-8 text-teal-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">Loading Settings</p>
          <p className="text-sm text-gray-600 mt-1">Preparing your preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            <Card className="border border-emerald-300 shadow-sm">
              <div className="h-2 bg-teal-500/30" />
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-teal-700 border border-teal-800 rounded-2xl flex items-center justify-center shadow-sm">
                      <Settings className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-600 border border-emerald-700 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 mb-1">
                      Account Settings
                    </h1>
                    <p className="text-base text-gray-600">
                      Manage your professional profile and preferences
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Success/Error Message */}
          {message && (
            <Card 
              className={`border ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50"
              } shadow-sm animate-in fade-in duration-200`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    message.type === "success" 
                      ? "bg-green-100" 
                      : "bg-red-100"
                  }`}>
                    {message.type === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-rose-600" />
                    )}
                  </div>
                  <p className={`font-semibold ${
                    message.type === "success" ? "text-green-800" : "text-red-800"
                  }`}>
                    {message.text}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Information */}
          <Card className="border border-teal-200 shadow-sm">
            <div className="h-2 bg-teal-500/30" />
            <CardHeader className="bg-teal-50/60 border-b-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-700 border border-teal-800 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Profile Information</CardTitle>
                  <CardDescription>Update your professional details and contact information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form action={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-teal-600" />
                      Company/Organization Name *
                    </Label>
                    <Input 
                      id="companyName" 
                      name="companyName" 
                      required 
                      defaultValue={profile?.company_name || ""}
                      className="border border-emerald-200 focus:border-emerald-500 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson" className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-teal-600" />
                      Contact Person *
                    </Label>
                    <Input 
                      id="contactPerson" 
                      name="contactPerson" 
                      required 
                      defaultValue={profile?.contact_person || ""}
                      className="border border-emerald-200 focus:border-emerald-500 h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      Email Address
                    </Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      disabled 
                      value={user?.email || ""}
                      className="bg-gray-100 border border-gray-200 h-11"
                    />
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Email cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-teal-600" />
                      Phone Number *
                    </Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      required 
                      defaultValue={profile?.phone || ""}
                      className="border border-emerald-200 focus:border-emerald-500 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professionalType" className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Award className="h-4 w-4 text-teal-600" />
                    Professional Type *
                  </Label>
                  <Select name="professionalType" defaultValue={profile?.professional_type || ""}>
                    <SelectTrigger className="border border-emerald-200 h-11">
                      <SelectValue placeholder="Select your professional category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="installer">🔧 Certified Installer</SelectItem>
                      <SelectItem value="distributor">🚚 LPG Distributor</SelectItem>
                      <SelectItem value="wholesaler">📦 Wholesaler</SelectItem>
                      <SelectItem value="contractor">⚡ Energy Contractor</SelectItem>
                      <SelectItem value="consultant">💡 Energy Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber" className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-teal-600" />
                      Professional License Number
                    </Label>
                    <Input 
                      id="licenseNumber" 
                      name="licenseNumber" 
                      defaultValue={profile?.license_number || ""}
                      className="border border-emerald-200 focus:border-emerald-500 h-11"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="epraLicense" className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-teal-600" />
                      EPRA License Number
                    </Label>
                    <Input 
                      id="epraLicense" 
                      name="epraLicense" 
                      defaultValue={profile?.epra_license || ""}
                      className="border border-emerald-200 focus:border-emerald-500 h-11"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-teal-600" />
                    Business Address *
                  </Label>
                  <Input 
                    id="address" 
                    name="address" 
                    required 
                    defaultValue={profile?.address || ""}
                    className="border border-emerald-200 focus:border-emerald-500 h-11"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-bold text-gray-900">City *</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      required 
                      defaultValue={profile?.city || ""}
                      className="border border-emerald-200 focus:border-emerald-500 h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-bold text-gray-900">Country *</Label>
                    <Input 
                      id="country" 
                      name="country" 
                      required 
                      defaultValue={profile?.country || ""}
                      className="border border-emerald-200 focus:border-emerald-500 h-11"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={saving}
                  className="w-full h-12 bg-teal-600 hover:bg-teal-700 hover:bg-teal-700 text-base font-bold shadow-sm"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {saving ? "Saving Changes..." : "Save Profile Changes"}
                  <Sparkles className="h-5 w-5 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="border border-green-200 shadow-sm">
            <div className="h-2 bg-emerald-500/30" />
            <CardHeader className="bg-white border-b border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-700 border border-emerald-800 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Account Status</CardTitle>
                  <CardDescription>Your professional verification and approval status</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-teal-50/50 p-5 rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Verification Status</span>
                      <Star className="h-5 w-5 text-teal-600" />
                    </div>
                    <Badge 
                      className={`text-base px-4 py-2 ${
                        profile?.status === "approved" 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                          : profile?.status === "rejected"
                          ? "bg-red-600 text-white"
                          : "bg-orange-600 text-white "
                      }`}
                    >
                      {profile?.status === "approved" && <CheckCircle2 className="h-4 w-4 mr-1" />}
                      {profile?.status === "rejected" && <AlertCircle className="h-4 w-4 mr-1" />}
                      {profile?.status === "pending" && <Clock className="h-4 w-4 mr-1" />}
                      {(profile?.status || "pending").toUpperCase()}
                    </Badge>
                  </div>

                  <div className="bg-teal-50/60 p-5 rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Application Date</span>
                      <Calendar className="h-5 w-5 text-teal-600" />
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {profile?.created_at 
                        ? new Date(profile.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : "N/A"
                      }
                    </p>
                  </div>
                </div>

                {profile?.status === "pending" && (
                  <div className="bg-amber-50 p-6 rounded-xl border border-amber-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-amber-900 font-bold text-lg mb-2">Application Under Review</p>
                        <p className="text-amber-800 text-sm">
                          Your professional application is being reviewed by our verification team. 
                          This typically takes 1-3 business days. You'll receive an email notification once approved.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {profile?.status === "approved" && (
                  <div className="bg-emerald-50 p-6 rounded-xl border border-green-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-green-900 font-bold text-lg mb-2">✨ Account Verified & Active!</p>
                        <p className="text-green-800 text-sm">
                          Your professional account is verified and active. You can now bid on installation jobs and access professional pricing.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="border border-teal-200 shadow-sm">
            <div className="h-2 bg-teal-500/30" />
            <CardHeader className="bg-teal-50/50 border-b-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-700 border border-teal-800 rounded-xl flex items-center justify-center">
                  <Key className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Change Password</CardTitle>
                  <CardDescription>Update your account password for security</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form action={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-teal-600" />
                    New Password *
                  </Label>
                  <Input 
                    id="newPassword" 
                    name="newPassword" 
                    type="password" 
                    required 
                    minLength={6}
                    placeholder="Enter new password (min. 6 characters)"
                    className="border border-emerald-200 focus:border-teal-500 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-teal-600" />
                    Confirm New Password *
                  </Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    required 
                    minLength={6}
                    placeholder="Re-enter new password"
                    className="border border-emerald-200 focus:border-teal-500 h-11"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-base font-bold shadow-sm"
                >
                  <Key className="h-5 w-5 mr-2" />
                  {saving ? "Updating Password..." : "Update Password"}
                  <Zap className="h-5 w-5 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Document Management */}
          <Card className="border border-teal-200 shadow-sm overflow-hidden">
            <div className="h-2 bg-indigo-500/30" />
            <CardHeader className="bg-white border-b border-indigo-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-700 border border-indigo-800 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Document Management</CardTitle>
                  <CardDescription>Upload certificates, licenses, and professional documents</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <FileUpload
                    onFilesChange={setUploadedFiles}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    multiple={true}
                    maxFiles={5}
                    maxSize={10}
                  />
                  <div className="mt-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      Upload professional certificates, licenses, and other relevant documents.
                      <br />
                      <strong>Supported formats:</strong> PDF, DOC, DOCX, JPG, PNG (max 10MB each)
                    </p>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-12 border border-teal-300 hover:bg-indigo-50"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Documents
                  </Button>
                  <Button 
                    variant="outline"
                    className="h-12 border border-emerald-300 hover:bg-purple-50"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}