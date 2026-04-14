"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getCountyNames, getSubCounties, getWards } from "@/lib/kenya-locations"

interface KenyaLocationFieldsProps {
  sectionTitle?: string
  sectionDescription?: string
  formData: {
    county?: string
    sub_county?: string
    ward?: string
    sub_location?: string
    street_address?: string
    landmark?: string
    delivery_instructions?: string
  }
  errors: Record<string, string>
  onChange: (field: string, value: string) => void
}

export function KenyaLocationFields({
  sectionTitle = "Detailed delivery location",
  sectionDescription = "Provide detailed location information for accurate delivery.",
  formData,
  errors,
  onChange,
}: KenyaLocationFieldsProps) {
  const [subCounties, setSubCounties] = useState<string[]>([])
  const [wards, setWards] = useState<string[]>([])

  useEffect(() => {
    if (formData.county) {
      const subs = getSubCounties(formData.county)
      setSubCounties(subs)
      if (formData.sub_county && !subs.includes(formData.sub_county)) {
        onChange("sub_county", "")
        onChange("ward", "")
      }
    } else {
      setSubCounties([])
      setWards([])
    }
  }, [formData.county, formData.sub_county, onChange])

  useEffect(() => {
    if (formData.county && formData.sub_county) {
      const wardList = getWards(formData.county, formData.sub_county)
      setWards(wardList)
      if (formData.ward && !wardList.includes(formData.ward)) {
        onChange("ward", "")
      }
    } else {
      setWards([])
    }
  }, [formData.county, formData.sub_county, formData.ward, onChange])

  const labelCls = "text-[11px] font-medium text-gray-400 uppercase tracking-[0.15em]"
  const inputCls = (field: string) =>
    `h-11 rounded-none border-0 border-b text-sm bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${
      errors[field] ? "border-red-400" : "border-gray-200 focus:border-gray-900"
    } transition-colors`
  const triggerCls = (field: string) =>
    `rounded-none border-0 border-b bg-transparent px-0 text-sm focus:ring-0 focus:ring-offset-0 h-11 ${
      errors[field] ? "border-red-400" : "border-gray-200 focus:border-gray-900"
    } transition-colors`

  const Err = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p> : null

  return (
    <div className="space-y-1">
      {/* Section header */}
      <div className="border-t border-gray-100 pb-6 pt-8">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-2">{sectionTitle}</p>
        <p className="text-sm text-gray-400">{sectionDescription}</p>
      </div>

      <div className="space-y-6">
        {/* County */}
        <div>
          <Label className={labelCls}>County <span className="text-red-500">*</span></Label>
          <Select value={formData.county || ""} onValueChange={(v) => onChange("county", v)}>
            <SelectTrigger id="county" className={triggerCls("county")}>
              <SelectValue placeholder="Select county" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {getCountyNames().map((county) => (
                <SelectItem key={county} value={county}>{county}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Err field="county" />
        </div>

        {/* Sub-County */}
        <div>
          <Label className={labelCls}>Sub-County <span className="text-red-500">*</span></Label>
          <Select
            value={formData.sub_county || ""}
            onValueChange={(v) => onChange("sub_county", v)}
            disabled={!formData.county || subCounties.length === 0}
          >
            <SelectTrigger id="sub_county" className={triggerCls("sub_county")}>
              <SelectValue placeholder={formData.county ? "Select sub-county" : "Select county first"} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {subCounties.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Err field="sub_county" />
        </div>

        {/* Ward */}
        <div>
          <Label className={labelCls}>Ward / Location <span className="text-red-500">*</span></Label>
          <Select
            value={formData.ward || ""}
            onValueChange={(v) => onChange("ward", v)}
            disabled={!formData.sub_county || wards.length === 0}
          >
            <SelectTrigger id="ward" className={triggerCls("ward")}>
              <SelectValue placeholder={formData.sub_county ? "Select ward" : "Select sub-county first"} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {wards.map((w) => (
                <SelectItem key={w} value={w}>{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Err field="ward" />
        </div>

        {/* Sub-Location */}
        <div>
          <Label className={labelCls}>Sub-Location / Village / Estate <span className="text-red-500">*</span></Label>
          <Input
            id="sub_location"
            value={formData.sub_location || ""}
            onChange={(e) => onChange("sub_location", e.target.value)}
            placeholder="e.g. Kilimani Estate, Githurai 44"
            className={inputCls("sub_location")}
          />
          <Err field="sub_location" />
        </div>

        {/* Street / Building */}
        <div>
          <Label className={labelCls}>Street / Building / House No. <span className="text-red-500">*</span></Label>
          <Input
            id="street_address"
            value={formData.street_address || ""}
            onChange={(e) => onChange("street_address", e.target.value)}
            placeholder="e.g. Moi Avenue, Apt 5B, House No. 123"
            className={inputCls("street_address")}
          />
          <Err field="street_address" />
        </div>

        {/* Landmark */}
        <div>
          <Label className={labelCls}>Landmark <span className="text-red-500">*</span></Label>
          <Input
            id="landmark"
            value={formData.landmark || ""}
            onChange={(e) => onChange("landmark", e.target.value)}
            placeholder="e.g. Opposite Nakumatt, Next to Shell Station"
            className={inputCls("landmark")}
          />
          <p className="text-[11px] text-gray-400 mt-1">A nearby landmark helps the delivery team find you faster</p>
          <Err field="landmark" />
        </div>

        {/* Additional instructions */}
        <div>
          <Label className={labelCls}>Additional Instructions <span className="normal-case text-gray-300 font-normal">(optional)</span></Label>
          <Textarea
            id="gas_delivery_instructions"
            value={formData.delivery_instructions || ""}
            onChange={(e) => onChange("delivery_instructions", e.target.value)}
            placeholder="e.g. Gate code is 1234, call on arrival, deliver to back entrance…"
            className={`rounded-none border-0 border-b text-sm bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none border-gray-200 focus:border-gray-900 transition-colors`}
            rows={2}
          />
        </div>
      </div>
    </div>
  )
}
