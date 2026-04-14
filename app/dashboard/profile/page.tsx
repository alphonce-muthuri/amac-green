"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Lock, Save, Camera, Shield, ChevronRight } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

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

  const checkUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) { router.push("/login"); return }
      setUser(user)
      setFormData({
        first_name: user.user_metadata?.first_name || "",
        last_name: user.user_metadata?.last_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        address: user.user_metadata?.address || "",
        city: user.user_metadata?.city || "",
      })
    } catch {
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { void checkUser() }, [checkUser])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ data: formData })
      if (error) throw error
      toast({ title: "Profile updated", description: "Your changes have been saved." })
    } catch {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-2 space-y-2">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
    )
  }

  if (!user) return null

  const initials = `${formData.first_name?.charAt(0) || ""}${formData.last_name?.charAt(0) || ""}` || "U"

  return (
    <div className="max-w-2xl mx-auto py-2 space-y-2">

      {/* ── Profile hero ── */}
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Subtle gradient strip */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-emerald-50/80 to-transparent pointer-events-none" />

        <div className="relative px-6 pt-6 pb-5">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-200 flex items-center justify-center text-emerald-800 text-2xl font-bold tracking-tight select-none shadow-sm">
                {initials}
              </div>
              <button
                type="button"
                aria-label="Change photo"
                className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Camera className="h-3 w-3 text-gray-500" />
              </button>
            </div>

            {/* Name / email / badge */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold text-gray-900 tracking-tight">
                  {formData.first_name} {formData.last_name}
                </h2>
                <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold rounded-full px-2 py-0">
                  <Shield className="h-2.5 w-2.5 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-sm text-gray-400 mt-0.5 truncate">{formData.email}</p>
            </div>
          </div>

          {/* Divider + meta row */}
          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Account</p>
              <p className="text-xs font-semibold text-gray-700 mt-1">{user.user_metadata?.role || "Customer"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Member since</p>
              <p className="text-xs font-semibold text-gray-700 mt-1">{new Date(user.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Status</p>
              <p className="text-xs font-semibold text-emerald-600 mt-1">Verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Personal information ── */}
      <Section label="Personal Information" icon={<User className="h-3.5 w-3.5" />}>
        <Row label="First name">
          <Input
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className="h-7 text-sm border-0 shadow-none bg-transparent focus-visible:ring-0 p-0 text-right text-gray-700 w-48"
          />
        </Row>
        <Row label="Last name">
          <Input
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className="h-7 text-sm border-0 shadow-none bg-transparent focus-visible:ring-0 p-0 text-right text-gray-700 w-48"
          />
        </Row>
        <Row label="Email">
          <span className="text-sm text-gray-400 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            {formData.email}
          </span>
        </Row>
        <Row label="Phone" last>
          <div className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+254 123 456 789"
              className="h-7 text-sm border-0 shadow-none bg-transparent focus-visible:ring-0 p-0 text-right text-gray-700 w-44 placeholder:text-gray-300"
            />
          </div>
        </Row>
      </Section>

      {/* ── Address ── */}
      <Section label="Address" icon={<MapPin className="h-3.5 w-3.5" />}>
        <Row label="Street address">
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Main Street"
            className="h-7 text-sm border-0 shadow-none bg-transparent focus-visible:ring-0 p-0 text-right text-gray-700 w-48 placeholder:text-gray-300"
          />
        </Row>
        <Row label="City" last>
          <Input
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Nairobi"
            className="h-7 text-sm border-0 shadow-none bg-transparent focus-visible:ring-0 p-0 text-right text-gray-700 w-48 placeholder:text-gray-300"
          />
        </Row>
      </Section>

      {/* ── Security ── */}
      <Section label="Security" icon={<Lock className="h-3.5 w-3.5" />}>
        <button
          type="button"
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700">Change Password</span>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-xs tracking-widest">••••••••</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </button>
      </Section>

      {/* ── Actions ── */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-8 px-5 text-sm bg-emerald-600 hover:bg-emerald-700 rounded-xl font-medium"
        >
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {saving ? "Saving…" : "Save Changes"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="h-8 px-4 text-sm text-gray-400 hover:text-gray-600 rounded-xl"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

/* ── Helpers ── */

function Section({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-100">
        <span className="text-gray-400">{icon}</span>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</span>
      </div>
      <div className="divide-y divide-gray-100">{children}</div>
    </div>
  )
}

function Row({ label, children, last = false }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-5 py-3 ${last ? "" : ""}`}>
      <span className="text-sm font-medium text-gray-600 shrink-0">{label}</span>
      <div className="flex items-center justify-end">{children}</div>
    </div>
  )
}
