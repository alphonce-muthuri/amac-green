"use server"

import { createClient } from "@supabase/supabase-js"
import { supabaseAdmin } from "@/lib/supabase-server"
import type { VendorApplication, ProfessionalApplication, CustomerProfile, DeliveryApplication, DocumentUpload } from "@/lib/supabase"
import { z } from "zod"

// Server-side auth client using implicit (OTP) flow — PKCE requires browser
// localStorage which doesn't exist in server actions, causing FK violations.
const supabaseServerAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      flowType: "implicit",
    },
  }
)

const registrationAuthSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

function validateRegistrationAuth(formData: FormData) {
  const result = registrationAuthSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Please check your registration details and try again."
    return { success: false as const, error: firstError }
  }

  return { success: true as const, data: result.data }
}

const APPLICATION_DOCUMENT_BUCKET = "product-images"
const APPLICATION_DOCUMENT_FIELD = "documents"
const APPLICATION_DOCUMENT_MAX_SIZE = 10 * 1024 * 1024
const APPLICATION_DOCUMENT_ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/jpg",
  "image/png",
])

function getRegistrationFiles(formData: FormData) {
  return formData
    .getAll(APPLICATION_DOCUMENT_FIELD)
    .filter((value): value is File => value instanceof File && value.size > 0)
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-")
}

async function uploadApplicationDocuments(
  applicationType: "vendor" | "professional" | "delivery",
  applicationId: string,
  files: File[],
) {
  const uploadedDocuments: DocumentUpload[] = []
  let failedCount = 0

  for (const [index, file] of files.entries()) {
    if (!APPLICATION_DOCUMENT_ALLOWED_TYPES.has(file.type) || file.size > APPLICATION_DOCUMENT_MAX_SIZE) {
      failedCount += 1
      continue
    }

    const fileExt = file.name.split(".").pop() || "bin"
    const safeName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""))
    const filePath = `documents/${applicationType}/${applicationId}/document-${index + 1}-${Date.now()}-${safeName}.${fileExt}`

    const { data, error } = await supabaseAdmin.storage
      .from(APPLICATION_DOCUMENT_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      console.error("Document upload error:", error)
      failedCount += 1
      continue
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(APPLICATION_DOCUMENT_BUCKET)
      .getPublicUrl(data.path)

    uploadedDocuments.push({
      url: urlData.publicUrl,
      type: `document-${index + 1}`,
      name: file.name,
      uploadedAt: new Date().toISOString(),
    })
  }

  return { uploadedDocuments, failedCount }
}

async function saveUploadedDocuments(
  tableName: "vendor_applications" | "professional_applications" | "delivery_applications",
  applicationId: string,
  documents: DocumentUpload[],
) {
  if (documents.length === 0) {
    return
  }

  const { error } = await supabaseAdmin
    .from(tableName)
    .update({ documents })
    .eq("id", applicationId)

  if (error) {
    throw new Error(error.message)
  }
}

function buildRegistrationMessage(baseMessage: string, failedCount: number) {
  if (failedCount === 0) {
    return baseMessage
  }

  return `${baseMessage} ${failedCount} document(s) could not be uploaded. You can re-submit them later after logging in or contact support if needed.`
}

async function signUpWithEmailVerification(email: string, password: string, metadata: any) {
  // First, sign up the user with email verification.
  // Uses the server-side implicit-flow client so no PKCE code verifier is
  // needed — browser localStorage is unavailable in server actions.
  const { data: signUpData, error: signUpError } = await supabaseServerAuth.auth.signUp({
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

  // Supabase returns user:null silently when the email already exists
  // (to prevent email enumeration). Surface this as a clear error.
  if (!signUpData?.user) {
    return { success: false, error: "An account with this email may already exist. Please try signing in instead.", data: null }
  }

  // When email is already registered, Supabase returns a fake user object with
  // an empty identities array and a UUID that does NOT exist in auth.users.
  // Inserting with that UUID causes the vendor_applications_user_id_fkey FK to fail.
  if (!signUpData.user.identities || signUpData.user.identities.length === 0) {
    return { success: false, error: "An account with this email already exists. Please sign in instead.", data: null }
  }

  return { success: true, data: signUpData, error: null }
}

export async function registerVendor(formData: FormData) {
  try {
    const authValidation = validateRegistrationAuth(formData)
    if (!authValidation.success) {
      return { success: false, error: authValidation.error }
    }

    const password = authValidation.data.password

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

    const registrationFiles = getRegistrationFiles(formData)

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

    const { uploadedDocuments, failedCount } = await uploadApplicationDocuments(
      "vendor",
      applicationData.id,
      registrationFiles,
    )

    await saveUploadedDocuments("vendor_applications", applicationData.id, uploadedDocuments)

    return {
      success: true,
      message: buildRegistrationMessage(
        "Vendor application submitted successfully! Please check your email and click the verification link before logging in. Once your email is verified and application approved, you'll be able to list products.",
        failedCount,
      ),
      applicationId: applicationData.id,
    }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function registerProfessional(formData: FormData) {
  try {
    const authValidation = validateRegistrationAuth(formData)
    if (!authValidation.success) {
      return { success: false, error: authValidation.error }
    }

    const password = authValidation.data.password

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

    const registrationFiles = getRegistrationFiles(formData)

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

    const { uploadedDocuments, failedCount } = await uploadApplicationDocuments(
      "professional",
      applicationData.id,
      registrationFiles,
    )

    await saveUploadedDocuments("professional_applications", applicationData.id, uploadedDocuments)

    return {
      success: true,
      message: buildRegistrationMessage(
        "Professional application submitted successfully! Please check your email and click the verification link before logging in. Once your email is verified and application approved, you'll have access to professional features.",
        failedCount,
      ),
      applicationId: applicationData.id,
    }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function registerCustomer(formData: FormData) {
  try {
    const authValidation = validateRegistrationAuth(formData)
    if (!authValidation.success) {
      return { success: false, error: authValidation.error }
    }

    const password = authValidation.data.password

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
    const authValidation = validateRegistrationAuth(formData)
    if (!authValidation.success) {
      return { success: false, error: authValidation.error }
    }

    const password = authValidation.data.password

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

    const registrationFiles = getRegistrationFiles(formData)

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

    const { uploadedDocuments, failedCount } = await uploadApplicationDocuments(
      "delivery",
      applicationData.id,
      registrationFiles,
    )

    await saveUploadedDocuments("delivery_applications", applicationData.id, uploadedDocuments)

    return {
      success: true,
      message: buildRegistrationMessage(
        "Delivery application submitted successfully! Please check your email and click the verification link before logging in. Once your email is verified and application approved, you'll be able to receive delivery assignments.",
        failedCount,
      ),
      applicationId: applicationData.id,
    }
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" }
  }
}
