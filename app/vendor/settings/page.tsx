"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  User, Building2, Bell, Shield, CreditCard, MapPin,
  Save, Eye, EyeOff, Clock, CheckCircle,
} from "lucide-react"

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
    monday:    { open: string; close: string; closed: boolean }
    tuesday:   { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday:  { open: string; close: string; closed: boolean }
    friday:    { open: string; close: string; closed: boolean }
    saturday:  { open: string; close: string; closed: boolean }
    sunday:    { open: string; close: string; closed: boolean }
  }
}

const DEFAULT_PROFILE = (userId: string, email?: string | null): VendorProfile => ({
  id: "", user_id: userId,
  business_name: "", business_description: "",
  contact_email: email || "", contact_phone: "",
  business_address: "", business_city: "", business_state: "", business_country: "Kenya",
  business_website: "", tax_id: "", business_license: "",
  notification_preferences: {
    email_notifications: true, sms_notifications: true, order_notifications: true,
    inventory_alerts: true, marketing_emails: false,
  },
  business_hours: {
    monday:    { open: "09:00", close: "17:00", closed: false },
    tuesday:   { open: "09:00", close: "17:00", closed: false },
    wednesday: { open: "09:00", close: "17:00", closed: false },
    thursday:  { open: "09:00", close: "17:00", closed: false },
    friday:    { open: "09:00", close: "17:00", closed: false },
    saturday:  { open: "09:00", close: "15:00", closed: false },
    sunday:    { open: "09:00", close: "15:00", closed: true  },
  },
})

const TABS = [
  { key: "profile",       label: "Profile",       icon: User      },
  { key: "business",      label: "Business",      icon: Building2 },
  { key: "notifications", label: "Notifications", icon: Bell      },
  { key: "security",      label: "Security",      icon: Shield    },
] as const

type TabKey = typeof TABS[number]["key"]

function Section({
  icon: Icon, title, children,
}: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
          <Icon className="h-3.5 w-3.5 text-emerald-700" />
        </div>
        <p className="text-xs font-semibold text-gray-800">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-gray-700">{label}</Label>
        {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

export default function VendorSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<VendorProfile | null>(null)
  const [tab, setTab] = useState<TabKey>("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" })

  const loadProfile = useCallback(async (userId: string, email?: string | null) => {
    const { data } = await supabase.from("vendor_profiles").select("*").eq("user_id", userId).single()
    setProfile(data ?? DEFAULT_PROFILE(userId, email))
  }, [])

  const init = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) { setUser(user); await loadProfile(user.id, user.email) }
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [loadProfile])

  useEffect(() => { void init() }, [init])

  const saveProfile = async () => {
    if (!profile || !user) return
    setSaving(true)
    try {
      await supabase.from("vendor_profiles").upsert({ ...profile, updated_at: new Date().toISOString() })
      toast({ title: "Saved", description: "Business profile updated successfully." })
    } catch {
      toast({ title: "Error", description: "Failed to save. Please try again.", variant: "destructive" })
    }
    setSaving(false)
  }

  const updatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match.", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      await supabase.auth.updateUser({ password: passwordData.newPassword })
      toast({ title: "Password Updated", description: "Your password has been changed." })
      setPasswordData({ newPassword: "", confirmPassword: "" })
    } catch {
      toast({ title: "Error", description: "Failed to update password.", variant: "destructive" })
    }
    setSaving(false)
  }

  const patchProfile = (patch: Partial<VendorProfile>) =>
    setProfile((p) => (p ? { ...p, ...patch } : p))

  const patchNotif = (key: string, val: boolean) =>
    setProfile((p) =>
      p ? { ...p, notification_preferences: { ...p.notification_preferences, [key]: val } } : p
    )

  const patchHours = (day: string, field: string, val: string | boolean) =>
    setProfile((p) =>
      p ? {
        ...p,
        business_hours: {
          ...p.business_hours,
          [day]: { ...p.business_hours[day as keyof typeof p.business_hours], [field]: val },
        },
      } : p
    )

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-6">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-4 w-px mx-1" />
          <Skeleton className="h-4 w-20" />
        </header>
        <div className="flex-1 p-5 space-y-4 max-w-3xl mx-auto w-full">
          <Skeleton className="h-9 w-full rounded-2xl" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const inputCls = "h-8 rounded-xl border-gray-200 bg-gray-50 text-xs focus-visible:ring-emerald-500"

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <VendorHeader title="Settings">
        <Button
          size="sm"
          className="h-8 gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs"
          disabled={saving}
          onClick={() => void saveProfile()}
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </VendorHeader>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
        <div className="max-w-3xl mx-auto space-y-4">

          {/* Tab bar */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors",
                  tab === key
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Profile ── */}
          {tab === "profile" && (
            <Section icon={User} title="Personal Information">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Email Address" hint="Cannot be changed">
                  <Input value={user?.email || ""} disabled className={cn(inputCls, "opacity-60")} />
                </Field>
                <Field label="Phone Number">
                  <Input
                    type="tel"
                    value={profile?.contact_phone || ""}
                    onChange={(e) => patchProfile({ contact_phone: e.target.value })}
                    placeholder="+254 700 000 000"
                    className={inputCls}
                  />
                </Field>
              </div>
            </Section>
          )}

          {/* ── Business ── */}
          {tab === "business" && (
            <div className="space-y-4">
              <Section icon={Building2} title="Business Information">
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Business Name">
                      <Input
                        value={profile?.business_name || ""}
                        onChange={(e) => patchProfile({ business_name: e.target.value })}
                        placeholder="Your Business Name"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Tax ID">
                      <Input
                        value={profile?.tax_id || ""}
                        onChange={(e) => patchProfile({ tax_id: e.target.value })}
                        placeholder="Tax ID Number"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Description">
                    <Textarea
                      value={profile?.business_description || ""}
                      onChange={(e) => patchProfile({ business_description: e.target.value })}
                      placeholder="Describe your business…"
                      rows={3}
                      className="rounded-xl border-gray-200 bg-gray-50 text-xs resize-none"
                    />
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Website">
                      <Input
                        type="url"
                        value={profile?.business_website || ""}
                        onChange={(e) => patchProfile({ business_website: e.target.value })}
                        placeholder="https://yourwebsite.com"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Business License">
                      <Input
                        value={profile?.business_license || ""}
                        onChange={(e) => patchProfile({ business_license: e.target.value })}
                        placeholder="License Number"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </div>
              </Section>

              <Section icon={MapPin} title="Business Address">
                <div className="space-y-3">
                  <Field label="Street Address">
                    <Input
                      value={profile?.business_address || ""}
                      onChange={(e) => patchProfile({ business_address: e.target.value })}
                      placeholder="123 Business Street"
                      className={inputCls}
                    />
                  </Field>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="City">
                      <Input
                        value={profile?.business_city || ""}
                        onChange={(e) => patchProfile({ business_city: e.target.value })}
                        placeholder="Nairobi"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="County">
                      <Input
                        value={profile?.business_state || ""}
                        onChange={(e) => patchProfile({ business_state: e.target.value })}
                        placeholder="Nairobi County"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Country">
                      <Select
                        value={profile?.business_country || "Kenya"}
                        onValueChange={(v) => patchProfile({ business_country: v })}
                      >
                        <SelectTrigger className={inputCls}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kenya">🇰🇪 Kenya</SelectItem>
                          <SelectItem value="Uganda">🇺🇬 Uganda</SelectItem>
                          <SelectItem value="Tanzania">🇹🇿 Tanzania</SelectItem>
                          <SelectItem value="Rwanda">🇷🇼 Rwanda</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>
              </Section>

              <Section icon={Clock} title="Business Hours">
                <div className="space-y-1.5">
                  {Object.entries(profile?.business_hours || {}).map(([day, hours]) => (
                    <div
                      key={day}
                      className="grid grid-cols-[7rem_auto_1fr] items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!hours.closed}
                          onCheckedChange={(checked) => patchHours(day, "closed", !checked)}
                        />
                        <span className="text-xs font-medium capitalize text-gray-700">{day}</span>
                      </div>
                      {hours.closed ? (
                        <span className="col-span-2 text-[10px] font-medium text-gray-400">Closed</span>
                      ) : (
                        <div className="col-span-2 flex items-center gap-2">
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) => patchHours(day, "open", e.target.value)}
                            className="h-7 w-28 rounded-xl border-gray-200 bg-white text-xs"
                          />
                          <span className="text-[10px] text-gray-400">to</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) => patchHours(day, "close", e.target.value)}
                            className="h-7 w-28 rounded-xl border-gray-200 bg-white text-xs"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* ── Notifications ── */}
          {tab === "notifications" && (
            <Section icon={Bell} title="Notification Preferences">
              <div className="space-y-1.5">
                {[
                  { key: "email_notifications", title: "Email Notifications",  desc: "Receive notifications via email"               },
                  { key: "sms_notifications",   title: "SMS Notifications",    desc: "Receive notifications via SMS"                 },
                  { key: "order_notifications", title: "Order Alerts",         desc: "Get notified when new orders are placed"       },
                  { key: "inventory_alerts",    title: "Inventory Alerts",     desc: "Get notified when items are low in stock"      },
                  { key: "marketing_emails",    title: "Marketing Emails",     desc: "Receive promotional and marketing emails"      },
                ].map((pref) => (
                  <div
                    key={pref.key}
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-xs font-medium text-gray-900">{pref.title}</p>
                      <p className="text-[10px] text-gray-400">{pref.desc}</p>
                    </div>
                    <Switch
                      checked={
                        profile?.notification_preferences[pref.key as keyof typeof profile.notification_preferences] ?? false
                      }
                      onCheckedChange={(v) => patchNotif(pref.key, v)}
                    />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Security ── */}
          {tab === "security" && (
            <div className="space-y-4">
              <Section icon={Shield} title="Change Password">
                <div className="space-y-3">
                  <Field label="New Password">
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData((d) => ({ ...d, newPassword: e.target.value }))}
                        placeholder="Enter new password"
                        className={cn(inputCls, "pr-8")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Confirm Password">
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData((d) => ({ ...d, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className={inputCls}
                    />
                  </Field>
                  <Button
                    className="h-8 w-full rounded-xl bg-gray-900 hover:bg-gray-800 text-xs"
                    disabled={saving || !passwordData.newPassword || !passwordData.confirmPassword}
                    onClick={() => void updatePassword()}
                  >
                    {saving ? "Updating…" : "Update Password"}
                  </Button>
                </div>
              </Section>

              <Section icon={CreditCard} title="Payment Methods">
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                      <span className="text-sm font-bold text-emerald-700">M</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">M-Pesa</p>
                      <p className="text-[10px] text-gray-400">Mobile money payments</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-medium text-white">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </span>
                </div>
              </Section>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
