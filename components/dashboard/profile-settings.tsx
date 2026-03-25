"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { User, Save, Eye, EyeOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ProfileData {
  first_name: string
  last_name: string
  email: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
}

interface ProfileSettingsProps {
  user: any
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Kenya",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const fetchProfile = useCallback(async () => {
    try {
      // Get profile from customer_profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("customer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {

      }

      // Set profile data, using user metadata as fallback
      setProfile({
        first_name: profileData?.first_name || user.user_metadata?.first_name || "",
        last_name: profileData?.last_name || user.user_metadata?.last_name || "",
        email: user.email || "",
        phone: profileData?.phone || user.user_metadata?.phone || "",
        address_line1: profileData?.address_line1 || "",
        address_line2: profileData?.address_line2 || "",
        city: profileData?.city || "",
        state: profileData?.state || "",
        postal_code: profileData?.postal_code || "",
        country: profileData?.country || "Kenya",
      })
    } catch (error) {
      // Error fetching profile
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      // Update or insert profile in customer_profiles table
      const { error: profileError } = await supabase
        .from("customer_profiles")
        .upsert({
          user_id: user.id,
          ...profile,
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        throw profileError
      }

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
        }
      })

      if (metadataError) {

        // Don't throw here as profile was saved successfully
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) {
        throw error
      }

      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      })

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setShowPasswordChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Profile Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={profile.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={profile.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Address Information</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="address_line1">Address Line 1</Label>
              <Input
                id="address_line1"
                value={profile.address_line1}
                onChange={(e) => handleInputChange("address_line1", e.target.value)}
                placeholder="Enter your street address"
              />
            </div>
            <div>
              <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
              <Input
                id="address_line2"
                value={profile.address_line2}
                onChange={(e) => handleInputChange("address_line2", e.target.value)}
                placeholder="Apartment, suite, etc."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter your city"
                />
              </div>
              <div>
                <Label htmlFor="state">State/County</Label>
                <Input
                  id="state"
                  value={profile.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="Enter your state/county"
                />
              </div>
              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={profile.postal_code}
                  onChange={(e) => handleInputChange("postal_code", e.target.value)}
                  placeholder="Enter postal code"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={profile.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Enter your country"
              />
            </div>
          </div>
        </div>

        {/* Save Profile Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveProfile} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>

        {/* Password Change Section */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Change Password</h3>
            <Button
              variant="outline"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
            >
              {showPasswordChange ? "Cancel" : "Change Password"}
            </Button>
          </div>

          {showPasswordChange && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="current_password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="new_password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handlePasswordChange} disabled={saving}>
                  {saving ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}