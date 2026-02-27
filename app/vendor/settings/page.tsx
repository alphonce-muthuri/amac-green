"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  CreditCard, 
  Mail, 
  Phone,
  MapPin,
  Save,
  AlertCircle,
  Settings,
  Store,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  Sparkles
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface VendorProfile {
  id: string
  user_id: string
  business_name: string
  business_description: string
  contact_email: string
  contact_phone: string
  business_address: string
  business_city: string
  business_state: string
  business_country: string
  business_website: string
  tax_id: string
  business_license: string
  notification_preferences: {
    email_notifications: boolean
    sms_notifications: boolean
    order_notifications: boolean
    inventory_alerts: boolean
    marketing_emails: boolean
  }
  business_hours: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
}

export default function VendorSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadUserAndProfile()
  }, [])

  const loadUserAndProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await loadProfile(user.id)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
    setLoading(false)
  }

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (data) {
        setProfile(data)
      } else {
        const defaultProfile: VendorProfile = {
          id: '',
          user_id: userId,
          business_name: '',
          business_description: '',
          contact_email: user?.email || '',
          contact_phone: '',
          business_address: '',
          business_city: '',
          business_state: '',
          business_country: 'Kenya',
          business_website: '',
          tax_id: '',
          business_license: '',
          notification_preferences: {
            email_notifications: true,
            sms_notifications: true,
            order_notifications: true,
            inventory_alerts: true,
            marketing_emails: false
          },
          business_hours: {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '15:00', closed: false },
            sunday: { open: '09:00', close: '15:00', closed: true }
          }
        }
        setProfile(defaultProfile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const saveProfile = async () => {
    if (!profile || !user) return

    setSaving(true)
    try {
      await supabase
        .from('vendor_profiles')
        .upsert({
          ...profile,
          updated_at: new Date().toISOString()
        })

      toast({
        title: "Profile Updated",
        description: "Your business profile has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      })
    }
    setSaving(false)
  }

  const updatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match.",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      })

      setPasswordData({ newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password.",
        variant: "destructive"
      })
    }
    setSaving(false)
  }

  const updateNotificationPreference = (key: string, value: boolean) => {
    if (!profile) return
    setProfile({
      ...profile,
      notification_preferences: {
        ...profile.notification_preferences,
        [key]: value
      }
    })
  }

  const updateBusinessHours = (day: string, field: string, value: string | boolean) => {
    if (!profile) return
    setProfile({
      ...profile,
      business_hours: {
        ...profile.business_hours,
        [day]: {
          ...profile.business_hours[day as keyof typeof profile.business_hours],
          [field]: value
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            <Settings className="absolute inset-0 m-auto h-8 w-8 text-gray-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">Loading Settings</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-6">
          <Card className="max-w-md mx-auto border-2 border-red-300">
            <CardContent className="text-center py-16">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
              <p className="text-gray-600">Please log in to access settings.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            <Card className="border-2 border-gray-300 shadow-2xl">
              <div className="h-2 bg-gradient-to-r from-gray-500 via-slate-500 to-zinc-500 animate-gradient-x"></div>
              
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-600 via-slate-600 to-zinc-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Settings className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Settings</h1>
                    <p className="text-lg text-gray-600">Manage your business profile and preferences</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-14">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Business
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="border-2 border-blue-200">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                <CardHeader className="bg-gradient-to-br from-blue-50 to-cyan-50 border-b-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">Personal Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="font-bold">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="bg-gray-50 border-2 h-11 mt-2"
                      />
                      <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="font-bold">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profile?.contact_phone || ''}
                        onChange={(e) => setProfile(profile ? { ...profile, contact_phone: e.target.value } : null)}
                        placeholder="+254 700 000 000"
                        className="border-2 h-11 mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Business Tab */}
            <TabsContent value="business" className="space-y-6">
              <Card className="border-2 border-purple-200">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50 border-b-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <Store className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">Business Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-bold">Business Name</Label>
                      <Input
                        value={profile?.business_name || ''}
                        onChange={(e) => setProfile(profile ? { ...profile, business_name: e.target.value } : null)}
                        placeholder="Your Business Name"
                        className="border-2 h-11 mt-2"
                      />
                    </div>
                    <div>
                      <Label className="font-bold">Tax ID</Label>
                      <Input
                        value={profile?.tax_id || ''}
                        onChange={(e) => setProfile(profile ? { ...profile, tax_id: e.target.value } : null)}
                        placeholder="Tax ID Number"
                        className="border-2 h-11 mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="font-bold">Description</Label>
                    <Textarea
                      value={profile?.business_description || ''}
                      onChange={(e) => setProfile(profile ? { ...profile, business_description: e.target.value } : null)}
                      placeholder="Describe your business..."
                      rows={3}
                      className="border-2 mt-2"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="font-bold">Website</Label>
                      <Input
                        type="url"
                        value={profile?.business_website || ''}
                        onChange={(e) => setProfile(profile ? { ...profile, business_website: e.target.value } : null)}
                        placeholder="https://yourwebsite.com"
                        className="border-2 h-11 mt-2"
                      />
                    </div>
                    <div>
                      <Label className="font-bold">Business License</Label>
                      <Input
                        value={profile?.business_license || ''}
                        onChange={(e) => setProfile(profile ? { ...profile, business_license: e.target.value } : null)}
                        placeholder="License Number"
                        className="border-2 h-11 mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50 border-b-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">Business Address</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label className="font-bold">Street Address</Label>
                    <Input
                      value={profile?.business_address || ''}
                      onChange={(e) => setProfile(profile ? { ...profile, business_address: e.target.value } : null)}
                      placeholder="123 Business Street"
                      className="border-2 h-11 mt-2"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="font-bold">City</Label>
                      <Input
                        value={profile?.business_city || ''}
                        onChange={(e) => setProfile(profile ? { ...profile, business_city: e.target.value } : null)}
                        placeholder="Nairobi"
                        className="border-2 h-11 mt-2"
                      />
                    </div>
                    <div>
                      <Label className="font-bold">State/County</Label>
                      <Input
                        value={profile?.business_state || ''}
                        onChange={(e) => setProfile(profile ? { ...profile, business_state: e.target.value } : null)}
                        placeholder="Nairobi County"
                        className="border-2 h-11 mt-2"
                      />
                    </div>
                    <div>
                      <Label className="font-bold">Country</Label>
                      <Select
                        value={profile?.business_country || 'Kenya'}
                        onValueChange={(value) => setProfile(profile ? { ...profile, business_country: value } : null)}
                      >
                        <SelectTrigger className="border-2 h-11 mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kenya">🇰🇪 Kenya</SelectItem>
                          <SelectItem value="Uganda">🇺🇬 Uganda</SelectItem>
                          <SelectItem value="Tanzania">🇹🇿 Tanzania</SelectItem>
                          <SelectItem value="Rwanda">🇷🇼 Rwanda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200">
                <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 border-b-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">Business Hours</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {Object.entries(profile?.business_hours || {}).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
                      <div className="flex items-center gap-4">
                        <span className="font-bold capitalize w-24">{day}</span>
                        <Switch
                          checked={!hours.closed}
                          onCheckedChange={(checked) => updateBusinessHours(day, 'closed', !checked)}
                        />
                      </div>
                      {!hours.closed && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                            className="w-28 border-2 h-10"
                          />
                          <span className="font-semibold">to</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                            className="w-28 border-2 h-10"
                          />
                        </div>
                      )}
                      {hours.closed && (
                        <Badge className="bg-red-600 text-white">Closed</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="border-2 border-amber-200">
                <div className="h-2 bg-gradient-to-r from-amber-500 to-yellow-500"></div>
                <CardHeader className="bg-gradient-to-br from-amber-50 to-yellow-50 border-b-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-lg flex items-center justify-center">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">Notification Preferences</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {[
                    { key: 'email_notifications', title: 'Email Notifications', desc: 'Receive notifications via email' },
                    { key: 'sms_notifications', title: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                    { key: 'order_notifications', title: 'Order Notifications', desc: 'Get notified when new orders are placed' },
                    { key: 'inventory_alerts', title: 'Inventory Alerts', desc: 'Get notified when items are low in stock' },
                    { key: 'marketing_emails', title: 'Marketing Emails', desc: 'Receive promotional and marketing emails' }
                  ].map((pref, index, arr) => (
                    <div key={pref.key}>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-200">
                        <div>
                          <Label className="text-base font-bold">{pref.title}</Label>
                          <p className="text-sm text-gray-600">{pref.desc}</p>
                        </div>
                        <Switch
                          checked={profile?.notification_preferences[pref.key as keyof typeof profile.notification_preferences] || false}
                          onCheckedChange={(checked) => updateNotificationPreference(pref.key, checked)}
                        />
                      </div>
                      {index < arr.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="border-2 border-red-200">
                <div className="h-2 bg-gradient-to-r from-red-500 to-rose-500"></div>
                <CardHeader className="bg-gradient-to-br from-red-50 to-rose-50 border-b-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-rose-600 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">Change Password</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label className="font-bold">New Password</Label>
                    <div className="relative mt-2">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        className="border-2 h-11"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="font-bold">Confirm Password</Label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="border-2 h-11 mt-2"
                    />
                  </div>

                  <Button 
                    onClick={updatePassword}
                    disabled={saving || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="w-full h-12 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                  >
                    {saving ? "Updating..." : "Update Password"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50 border-b-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">Payment Methods</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-xl">M</span>
                      </div>
                      <div>
                        <p className="font-bold">M-Pesa</p>
                        <p className="text-sm text-gray-600">Mobile money payments</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={saveProfile}
              disabled={saving}
              className="h-14 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-base font-bold shadow-lg"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
              <Sparkles className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  )
}