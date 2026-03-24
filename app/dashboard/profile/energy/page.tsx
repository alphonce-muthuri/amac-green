"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getProgramProfile, upsertProgramProfile } from "@/app/actions/customer-program-profile"
import { toast } from "@/hooks/use-toast"

type ProgramProfile = {
  nationalIdOrReg?: string
  county?: string
  subCounty?: string
  physicalAddress?: string
  latitude?: number
  longitude?: number
  gridAccess?: "on_grid" | "off_grid" | "unreliable"
  userType?: "institution" | "sme" | "household" | "individual"
  facilityType?: string
  monthlyKwh?: string
  electricityUseTypes?: string[]
  cookingFuelTypes?: string[]
  cookingConsumption?: string
  solarWaterPumping?: boolean
  heatingProcessing?: string
  monthlyEnergySpend?: string
  paymentMethodPreference?: string
  willingnessToFinance?: boolean
}

export default function EnergyProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ProgramProfile>({})

  useEffect(() => {
    void (async () => {
      const res = await getProgramProfile()
      if (res.success && res.data?.profile) {
        setForm(res.data.profile as ProgramProfile)
      }
      setLoading(false)
    })()
  }, [])

  const set = (k: keyof ProgramProfile, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await upsertProgramProfile(form)
    setSaving(false)
    if (res.success) {
      toast({ title: "Profile saved" })
    } else {
      toast({ title: "Could not save", description: String(res.error), variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="w-full px-4 py-8">
      <Link
        href="/dashboard/profile"
        className="inline-flex items-center text-sm text-emerald-700 hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to profile
      </Link>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Programme Energy Profile</CardTitle>
            <CardDescription>
              Structured demand data (AMAC spec §4.1). All fields optional — add what you know.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>National ID / registration number</Label>
                <Input
                  value={form.nationalIdOrReg ?? ""}
                  onChange={(e) => set("nationalIdOrReg", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>User type</Label>
                <Select
                  value={form.userType ?? ""}
                  onValueChange={(v) => set("userType", v as ProgramProfile["userType"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="institution">Institution</SelectItem>
                    <SelectItem value="sme">SME</SelectItem>
                    <SelectItem value="household">Household</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>County</Label>
                <Input value={form.county ?? ""} onChange={(e) => set("county", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Sub-county</Label>
                <Input value={form.subCounty ?? ""} onChange={(e) => set("subCounty", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Physical address / site description</Label>
              <Textarea
                value={form.physicalAddress ?? ""}
                onChange={(e) => set("physicalAddress", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Grid access</Label>
              <Select
                value={form.gridAccess ?? ""}
                onValueChange={(v) => set("gridAccess", v as ProgramProfile["gridAccess"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_grid">On-grid</SelectItem>
                  <SelectItem value="off_grid">Off-grid</SelectItem>
                  <SelectItem value="unreliable">Unreliable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Facility / business type</Label>
              <Input
                value={form.facilityType ?? ""}
                onChange={(e) => set("facilityType", e.target.value)}
                placeholder="e.g. school, hospital, shop"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly electricity (kWh or estimate)</Label>
                <Input value={form.monthlyKwh ?? ""} onChange={(e) => set("monthlyKwh", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Monthly energy spend (KES)</Label>
                <Input
                  value={form.monthlyEnergySpend ?? ""}
                  onChange={(e) => set("monthlyEnergySpend", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cooking fuel (comma-separated)</Label>
              <Input
                value={(form.cookingFuelTypes || []).join(", ")}
                onChange={(e) =>
                  set(
                    "cookingFuelTypes",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="firewood, charcoal, LPG, electric"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wf"
                checked={!!form.willingnessToFinance}
                onCheckedChange={(c) => set("willingnessToFinance", !!c)}
              />
              <Label htmlFor="wf">Willing to use KCB financing</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="swp"
                checked={!!form.solarWaterPumping}
                onCheckedChange={(c) => set("solarWaterPumping", !!c)}
              />
              <Label htmlFor="swp">Solar water pumping interest</Label>
            </div>
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save profile"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
