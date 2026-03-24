"use server"

import { createServerClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { z } from "zod"

/** Spec §4.1 — flexible JSON; validate top-level shape only. */
const programProfileSchema = z
  .object({
    nationalIdOrReg: z.string().optional(),
    county: z.string().optional(),
    subCounty: z.string().optional(),
    physicalAddress: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    gridAccess: z.enum(["on_grid", "off_grid", "unreliable"]).optional(),
    userType: z.enum(["institution", "sme", "household", "individual"]).optional(),
    facilityType: z.string().optional(),
    monthlyKwh: z.string().optional(),
    electricityUseTypes: z.array(z.string()).optional(),
    cookingFuelTypes: z.array(z.string()).optional(),
    cookingConsumption: z.string().optional(),
    solarWaterPumping: z.boolean().optional(),
    heatingProcessing: z.string().optional(),
    monthlyEnergySpend: z.string().optional(),
    paymentMethodPreference: z.string().optional(),
    willingnessToFinance: z.boolean().optional(),
  })
  .passthrough()

export async function getProgramProfile() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data, error } = await supabase
      .from("customer_program_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) return { success: false, error: error.message }
    return { success: true, data: data ?? null }
  } catch (e) {
    return { success: false, error: "Failed to load profile" }
  }
}

export async function upsertProgramProfile(input: unknown) {
  try {
    const parsed = programProfileSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.message }
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const county = typeof parsed.data.county === "string" ? parsed.data.county : null
    const user_segment = typeof parsed.data.userType === "string" ? parsed.data.userType : null

    const { data, error } = await supabase
      .from("customer_program_profiles")
      .upsert(
        {
          user_id: user.id,
          profile: parsed.data as Record<string, unknown>,
          county,
          user_segment,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, data }
  } catch (e) {
    return { success: false, error: "Failed to save profile" }
  }
}
