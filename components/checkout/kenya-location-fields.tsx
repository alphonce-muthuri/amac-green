"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ALL_KENYA_COUNTIES, getSubCounties, getWards } from "@/lib/kenya-locations"

interface KenyaLocationFieldsProps {
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

export function KenyaLocationFields({ formData, errors, onChange }: KenyaLocationFieldsProps) {
  const [subCounties, setSubCounties] = useState<string[]>([])
  const [wards, setWards] = useState<string[]>([])

  // Update sub-counties when county changes
  useEffect(() => {
    if (formData.county) {
      const subs = getSubCounties(formData.county)
      setSubCounties(subs)
      // Reset dependent fields
      if (formData.sub_county && !subs.includes(formData.sub_county)) {
        onChange("sub_county", "")
        onChange("ward", "")
      }
    } else {
      setSubCounties([])
      setWards([])
    }
  }, [formData.county])

  // Update wards when sub-county changes
  useEffect(() => {
    if (formData.county && formData.sub_county) {
      const wardList = getWards(formData.county, formData.sub_county)
      setWards(wardList)
      // Reset ward if it's not in the new list
      if (formData.ward && !wardList.includes(formData.ward)) {
        onChange("ward", "")
      }
    } else {
      setWards([])
    }
  }, [formData.county, formData.sub_county])

  return (
    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
        <h3 className="font-semibold text-blue-900">Gas Yetu Delivery Location Details</h3>
      </div>
      <p className="text-sm text-blue-700 mb-4">
        Please provide detailed location information for accurate Gas Yetu product delivery
      </p>

      {/* County */}
      <div className="space-y-2">
        <Label htmlFor="county">
          County <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.county || ""} onValueChange={(value) => onChange("county", value)}>
          <SelectTrigger id="county" className={errors.county ? "border-red-500" : ""}>
            <SelectValue placeholder="Select county" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {ALL_KENYA_COUNTIES.map((county) => (
              <SelectItem key={county} value={county}>
                {county}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.county && <p className="text-sm text-red-500">{errors.county}</p>}
      </div>

      {/* Sub-County */}
      <div className="space-y-2">
        <Label htmlFor="sub_county">
          Sub-County <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.sub_county || ""}
          onValueChange={(value) => onChange("sub_county", value)}
          disabled={!formData.county || subCounties.length === 0}
        >
          <SelectTrigger id="sub_county" className={errors.sub_county ? "border-red-500" : ""}>
            <SelectValue placeholder={formData.county ? "Select sub-county" : "Select county first"} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {subCounties.map((subCounty) => (
              <SelectItem key={subCounty} value={subCounty}>
                {subCounty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.sub_county && <p className="text-sm text-red-500">{errors.sub_county}</p>}
      </div>

      {/* Ward */}
      <div className="space-y-2">
        <Label htmlFor="ward">
          Ward/Location <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.ward || ""}
          onValueChange={(value) => onChange("ward", value)}
          disabled={!formData.sub_county || wards.length === 0}
        >
          <SelectTrigger id="ward" className={errors.ward ? "border-red-500" : ""}>
            <SelectValue placeholder={formData.sub_county ? "Select ward" : "Select sub-county first"} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {wards.map((ward) => (
              <SelectItem key={ward} value={ward}>
                {ward}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.ward && <p className="text-sm text-red-500">{errors.ward}</p>}
      </div>

      {/* Sub-Location / Village / Estate */}
      <div className="space-y-2">
        <Label htmlFor="sub_location">
          Sub-Location / Village / Estate <span className="text-red-500">*</span>
        </Label>
        <Input
          id="sub_location"
          value={formData.sub_location || ""}
          onChange={(e) => onChange("sub_location", e.target.value)}
          placeholder="e.g., Kilimani Estate, Githurai 44"
          className={errors.sub_location ? "border-red-500" : ""}
        />
        {errors.sub_location && <p className="text-sm text-red-500">{errors.sub_location}</p>}
      </div>

      {/* Street / Building / House Number */}
      <div className="space-y-2">
        <Label htmlFor="street_address">
          Street / Building / House Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="street_address"
          value={formData.street_address || ""}
          onChange={(e) => onChange("street_address", e.target.value)}
          placeholder="e.g., Moi Avenue, Apartment 5B, House No. 123"
          className={errors.street_address ? "border-red-500" : ""}
        />
        {errors.street_address && <p className="text-sm text-red-500">{errors.street_address}</p>}
      </div>

      {/* Landmark */}
      <div className="space-y-2">
        <Label htmlFor="landmark">
          Landmark <span className="text-red-500">*</span>
        </Label>
        <Input
          id="landmark"
          value={formData.landmark || ""}
          onChange={(e) => onChange("landmark", e.target.value)}
          placeholder="e.g., Opposite Nakumatt, Next to Shell Petrol Station"
          className={errors.landmark ? "border-red-500" : ""}
        />
        <p className="text-xs text-gray-500">Provide a nearby landmark to help locate your address</p>
        {errors.landmark && <p className="text-sm text-red-500">{errors.landmark}</p>}
      </div>

      {/* Additional Delivery Instructions */}
      <div className="space-y-2">
        <Label htmlFor="gas_delivery_instructions">Additional Delivery Instructions (Optional)</Label>
        <Textarea
          id="gas_delivery_instructions"
          value={formData.delivery_instructions || ""}
          onChange={(e) => onChange("delivery_instructions", e.target.value)}
          placeholder="e.g., Gate code is 1234, Call when you arrive, Deliver to back entrance"
          rows={3}
        />
        <p className="text-xs text-gray-500">Any special instructions for the delivery team</p>
      </div>
    </div>
  )
}
