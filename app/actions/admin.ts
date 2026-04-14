"use server"

import { supabaseAdmin } from "@/lib/supabase-server"
import { requireAdmin, ADMIN_EMAILS } from "@/lib/require-admin"

export async function getVendorApplications() {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("vendor_applications")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Failed to fetch vendor applications" }
  }
}

export async function getProfessionalApplications() {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("professional_applications")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Failed to fetch professional applications" }
  }
}

export async function getCustomerProfiles() {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("customer_profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Failed to fetch customer profiles" }
  }
}

export async function updateVendorStatus(applicationId: string, status: "approved" | "rejected") {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    // First get the application details for email
    const { data: application, error: fetchError } = await supabaseAdmin
      .from("vendor_applications")
      .select("email, contact_person, company_name")
      .eq("id", applicationId)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    // Update the status
    const { error } = await supabaseAdmin
      .from("vendor_applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", applicationId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Send approval email if approved
    if (status === "approved" && application) {
      try {
        const { sendVendorApprovalEmail } = await import("@/lib/email-service")
        const emailResult = await sendVendorApprovalEmail(
          application.email,
          application.contact_person || "Vendor",
          application.company_name || "Your Company"
        )
        
        if (emailResult.success) {
          console.log('[ADMIN] Vendor approval email sent successfully')
        } else {
          console.error('[ADMIN] Failed to send vendor approval email:', emailResult.error)
        }
      } catch (emailError) {
        console.error('[ADMIN] Error sending vendor approval email:', emailError)
        // Don't fail the approval if email fails
      }
    }

    return { success: true, message: `Vendor application ${status} successfully` }
  } catch (error) {
    return { success: false, error: "Failed to update vendor status" }
  }
}

export async function updateProfessionalStatus(applicationId: string, status: "approved" | "rejected") {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    // First get the application details for email
    const { data: application, error: fetchError } = await supabaseAdmin
      .from("professional_applications")
      .select("email, contact_person, company_name")
      .eq("id", applicationId)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    // Update the status
    const { error } = await supabaseAdmin
      .from("professional_applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", applicationId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Send approval email if approved
    if (status === "approved" && application) {
      try {
        const { sendProfessionalApprovalEmail } = await import("@/lib/email-service")
        const emailResult = await sendProfessionalApprovalEmail(
          application.email,
          application.contact_person || "Professional",
          application.company_name || "Your Company"
        )
        
        if (emailResult.success) {
          console.log('[ADMIN] Professional approval email sent successfully')
        } else {
          console.error('[ADMIN] Failed to send professional approval email:', emailResult.error)
        }
      } catch (emailError) {
        console.error('[ADMIN] Error sending professional approval email:', emailError)
        // Don't fail the approval if email fails
      }
    }

    return { success: true, message: `Professional application ${status} successfully` }
  } catch (error) {
    return { success: false, error: "Failed to update professional status" }
  }
}

export async function getDeliveryApplications() {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("delivery_applications")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Failed to fetch delivery applications" }
  }
}

export async function updateDeliveryStatus(applicationId: string, status: "approved" | "rejected") {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    // First get the application details for email
    const { data: application, error: fetchError } = await supabaseAdmin
      .from("delivery_applications")
      .select("email, first_name, last_name")
      .eq("id", applicationId)
      .single()

    if (fetchError) {
      return { success: false, error: fetchError.message }
    }

    // Update the status
    const { error } = await supabaseAdmin
      .from("delivery_applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", applicationId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Send approval email if approved
    if (status === "approved" && application) {
      try {
        const { sendDeliveryApprovalEmail } = await import("@/lib/email-service")
        const fullName = `${application.first_name || ""} ${application.last_name || ""}`.trim() || "Delivery Partner"
        const emailResult = await sendDeliveryApprovalEmail(
          application.email,
          fullName
        )
        
        if (emailResult.success) {
          console.log('[ADMIN] Delivery approval email sent successfully')
        } else {
          console.error('[ADMIN] Failed to send delivery approval email:', emailResult.error)
        }
      } catch (emailError) {
        console.error('[ADMIN] Error sending delivery approval email:', emailError)
        // Don't fail the approval if email fails
      }
    }

    return { success: true, message: `Delivery application ${status} successfully` }
  } catch (error) {
    return { success: false, error: "Failed to update delivery status" }
  }
}

export async function getDashboardStats() {
  if (!await requireAdmin()) {
    return { success: false, error: "Unauthorized" }
  }
  try {
    const [vendorResult, professionalResult, deliveryResult, customerResult] = await Promise.all([
      supabaseAdmin.from("vendor_applications").select("status", { count: "exact" }),
      supabaseAdmin.from("professional_applications").select("status", { count: "exact" }),
      supabaseAdmin.from("delivery_applications").select("status", { count: "exact" }),
      supabaseAdmin.from("customer_profiles").select("id", { count: "exact" }),
    ])

    const vendorStats = {
      total: vendorResult.count || 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    }

    const professionalStats = {
      total: professionalResult.count || 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    }

    const deliveryStats = {
      total: deliveryResult.count || 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    }

    if (vendorResult.data) {
      vendorResult.data.forEach((app: any) => {
        vendorStats[app.status as keyof typeof vendorStats]++
      })
    }

    if (professionalResult.data) {
      professionalResult.data.forEach((app: any) => {
        professionalStats[app.status as keyof typeof professionalStats]++
      })
    }

    if (deliveryResult.data) {
      deliveryResult.data.forEach((app: any) => {
        deliveryStats[app.status as keyof typeof deliveryStats]++
      })
    }

    return {
      success: true,
      data: {
        vendors: vendorStats,
        professionals: professionalStats,
        delivery: deliveryStats,
        customers: customerResult.count || 0,
      },
    }
  } catch (error) {
    return { success: false, error: "Failed to fetch dashboard stats" }
  }
}

export async function checkAdminAccess(email: string) {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
