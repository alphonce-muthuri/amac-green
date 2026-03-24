"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Lock, Save, Camera, Shield, Bell } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  })
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        router.push("/login")
        return
      }

      setUser(user)
      setFormData({
        first_name: user.user_metadata?.first_name || "",
        last_name: user.user_metadata?.last_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        address: user.user_metadata?.address || "",
        city: user.user_metadata?.city || "",
      })
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: formData
      })

      if (error) throw error

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tighter text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="border border-emerald-200/60 lg:col-span-1 overflow-hidden">
          <div className="h-2 bg-emerald-500/30 rounded-t-lg"></div>
          <CardContent className="p-6">
            <div className="text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <div className="w-28 h-28 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-700 text-3xl font-bold">
                  {formData.first_name?.charAt(0) || "U"}{formData.last_name?.charAt(0) || ""}
                </div>
                <button
                  className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-full shadow-sm border border-emerald-200 flex items-center justify-center hover:bg-emerald-50"
                  type="button"
                  aria-label="Change profile photo"
                  title="Change profile photo"
                >
                  <Camera className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {formData.first_name} {formData.last_name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{formData.email}</p>
              
              <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-700 border border-emerald-200/60 hover:border-emerald-200/60 font-bold mb-4 rounded-full">
                <Shield className="h-3 w-3 mr-1" />
                Account Active
              </Badge>

              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Account Type</span>
                  <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-700 border border-emerald-200/60 hover:border-emerald-200/60 font-bold rounded-full">
                    {user.user_metadata?.role || "Customer"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="border border-emerald-200/60 overflow-hidden">
            <div className="h-2 bg-emerald-500/30 rounded-t-lg"></div>
            <CardHeader className="bg-white border-b border-emerald-200/60">
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-600" />
                <span className="text-lg">Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-xs sm:text-sm font-semibold text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="border border-emerald-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-xs sm:text-sm font-semibold text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="border border-emerald-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="pl-10 border border-emerald-200 bg-gray-50"
                  />
                </div>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-gray-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 border border-emerald-200"
                    placeholder="+254 123 456 789"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="border border-emerald-200/60 overflow-hidden">
            <div className="h-2 bg-emerald-500/30 rounded-t-lg"></div>
            <CardHeader className="bg-white border-b border-emerald-200/60">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <span className="text-lg">Address Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs sm:text-sm font-semibold text-gray-700">
                  Street Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="border border-emerald-200"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs sm:text-sm font-semibold text-gray-700">
                  City
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="border border-emerald-200"
                  placeholder="Nairobi"
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border border-emerald-200/60 overflow-hidden">
            <div className="h-2 bg-emerald-500/30 rounded-t-lg"></div>
            <CardHeader className="bg-white border-b border-emerald-200/60">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-600" />
                <span className="text-lg">Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Button variant="outline" className="w-full border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300">
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/dashboard")}
              className="border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}