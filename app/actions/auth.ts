"use server"

import { supabaseAdmin } from "@/lib/supabase-server"
import { supabase } from "@/lib/supabase"
import type { VendorApplication, ProfessionalApplication, CustomerProfile, DeliveryApplication } from "@/lib/supabase"

async function signUpWithEmailVerification(email: string, password: string, metadata: any) {
  // First, sign up the user with email verification
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/verify-email`,
      data: metadata
    }
  })

  if (signUpError) {
    return { success: false, error: signUpError.message, data: null }
  }

  return { success: true, data: signUpData, error: null }
}

export async function registerVendor(formData: FormData) {
  try {
    const password = formData.get("password") as string

    const vendorData: Omit<VendorApplication, "id" | "created_at" | "user_id"> = {
      company_name: formData.get("companyName") as string,
      contact_person: formData.get("contactPerson") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      business_type: formData.get("businessType") as string,
      description: formData.get("description") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      country: formData.get("country") as string,
      website: formData.get("website") as string,
      tax_id: formData.get("taxId") as string,
      bank_name: formData.get("bankName") as string,
      account_number: formData.get("accountNumber") as string,
      status: "pending",
    }

    // Create user account with email verification
    const signUpResult = await signUpWithEmailVerification(
      vendorData.email,
      password,
      {
        role: "vendor",
        company_name: vendorData.company_name,
        contact_person: vendorData.contact_person,
        status: "pending",
      }
    )

    if (!signUpResult.success) {
      return { success: false, error: signUpResult.error }
    }

    const authData = signUpResult.data

    // Insert vendor application
    const { data: applicationData, error: dbError } = await supabaseAdmin
      .from("vendor_applications")
      .insert({
        ...vendorData,
        user_id: authData.user.id,
      })
      .select()
      .single()

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    return {
      success: true,
      message:
        "Vendor application submitted successfully! Please check your email and click the verification link before logging in. Once your email is verified and application approved, you'll be able to list products.",
      applicationId: applicationData.id,
    }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function registerProfessional(formData: FormData) {
  try {
    const password = formData.get("password") as string

    const professionalData: Omit<ProfessionalApplication, "id" | "created_at" | "user_id"> = {
      company_name: formData.get("companyName") as string,
      contact_person: formData.get("contactPerson") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      professional_type: formData.get("professionalType") as string,
      license_number: formData.get("licenseNumber") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      country: formData.get("country") as string,
      epra_license: formData.get("epraLicense") as string,
      status: "pending",
    }

    // Create user account with email verification
    const signUpResult = await signUpWithEmailVerification(
      professionalData.email,
      password,
      {
        role: "professional",
        company_name: professionalData.company_name,
        contact_person: professionalData.contact_person,
        status: "pending",
      }
    )

    if (!signUpResult.success) {
      return { success: false, error: signUpResult.error }
    }

    const authData = signUpResult.data

    // Insert professional application
    const { data: applicationData, error: dbError } = await supabaseAdmin
      .from("professional_applications")
      .insert({
        ...professionalData,
        user_id: authData.user.id,
      })
      .select()
      .single()

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    return {
      success: true,
      message:
        "Professional application submitted successfully! Please check your email and click the verification link before logging in. Once your email is verified and application approved, you'll have access to professional features.",
      applicationId: applicationData.id,
    }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function registerCustomer(formData: FormData) {
  try {
    const password = formData.get("password") as string

    const customerData: Omit<CustomerProfile, "id" | "created_at" | "user_id"> = {
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      customer_type: formData.get("customerType") as string,
      organization_name: formData.get("organizationName") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      country: formData.get("country") as string,
      accept_marketing: formData.get("acceptMarketing") === "on",
    }

    // Create user account with email verification
    const signUpResult = await signUpWithEmailVerification(
      customerData.email,
      password,
      {
        role: "customer",
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        customer_type: customerData.customer_type,
      }
    )

    if (!signUpResult.success) {
      return { success: false, error: signUpResult.error }
    }

    const authData = signUpResult.data

    // Insert customer profile
    const { error: dbError } = await supabaseAdmin.from("customer_profiles").insert({
      ...customerData,
      user_id: authData.user.id,
    })

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    return {
      success: true,
      message: "Account created successfully! Please check your email and click the verification link before logging in.",
    }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function registerDelivery(formData: FormData) {
  try {
    const password = formData.get("password") as string

    const deliveryData: Omit<DeliveryApplication, "id" | "created_at" | "user_id"> = {
      first_name: formData.get("firstName") as string,
      last_name: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      national_id: formData.get("nationalId") as string,
      driver_license: formData.get("driverLicense") as string,
      vehicle_type: formData.get("vehicleType") as string,
      vehicle_registration: formData.get("vehicleRegistration") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      country: formData.get("country") as string,
      emergency_contact_name: formData.get("emergencyContactName") as string,
      emergency_contact_phone: formData.get("emergencyContactPhone") as string,
      bank_name: formData.get("bankName") as string,
      account_number: formData.get("accountNumber") as string,
      status: "pending",
    }

    // Create user account with email verification
    const signUpResult = await signUpWithEmailVerification(
      deliveryData.email,
      password,
      {
        role: "delivery",
        first_name: deliveryData.first_name,
        last_name: deliveryData.last_name,
        status: "pending",
      }
    )

    if (!signUpResult.success) {
      return { success: false, error: signUpResult.error }
    }

    const authData = signUpResult.data

    // Insert delivery application
    const { data: applicationData, error: dbError } = await supabaseAdmin
      .from("delivery_applications")
      .insert({
        ...deliveryData,
        user_id: authData.user.id,
      })
      .select()
      .single()

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    return {
      success: true,
      message:
        "Delivery application submitted successfully! Please check your email and click the verification link before logging in. Once your email is verified and application approved, you'll be able to receive delivery assignments.",
      applicationId: applicationData.id,
    }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}
