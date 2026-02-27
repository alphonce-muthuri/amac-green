"use server"

import { supabaseAdmin } from "@/lib/supabase-server"
import type { InstallationJob, InstallationBid } from "@/lib/supabase"

export async function getAvailableJobs() {
  try {
    const { data, error } = await supabaseAdmin
      .from("installation_jobs")
      .select(`
        *,
        installation_job_items (
          id,
          product_name,
          product_price,
          quantity
        )
      `)
      .in("status", ["open", "bidding"])
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Failed to fetch available jobs" }
  }
}

export async function getProfessionalBids(professionalId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("installation_bids")
      .select(`
        *,
        installation_jobs (
          id,
          title,
          location_city,
          status,
          total_product_cost
        )
      `)
      .eq("professional_id", professionalId)
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Failed to fetch professional bids" }
  }
}

export async function getAssignedJobs(professionalId: string) {
  try {
    // First get the professional's accepted bids
    const { data: acceptedBids, error: bidsError } = await supabaseAdmin
      .from("installation_bids")
      .select("id")
      .eq("professional_id", professionalId)
      .eq("status", "accepted")

    if (bidsError) {
      return { success: false, error: bidsError.message }
    }

    if (!acceptedBids || acceptedBids.length === 0) {
      return { success: true, data: [] }
    }

    const bidIds = acceptedBids.map(bid => bid.id)

    // Get jobs where this professional's bid was selected
    const { data, error } = await supabaseAdmin
      .from("installation_jobs")
      .select(`
        *,
        installation_job_items (
          id,
          product_name,
          product_price,
          quantity
        ),
        installation_bids!installation_jobs_selected_bid_id_fkey (
          id,
          total_bid_amount,
          labor_cost
        )
      `)
      .in("selected_bid_id", bidIds)
      .in("status", ["assigned", "in_progress"])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: "Failed to fetch assigned jobs" }
  }
}

export async function submitBid(bidData: {
  jobId: string
  professionalId: string
  laborCost: number
  materialCost: number
  additionalCosts: number
  estimatedHours?: number
  proposalNotes?: string
}) {
  try {
    const totalBidAmount = bidData.laborCost + bidData.materialCost + bidData.additionalCosts

    const { error } = await supabaseAdmin
      .from("installation_bids")
      .insert({
        job_id: bidData.jobId,
        professional_id: bidData.professionalId,
        labor_cost: bidData.laborCost,
        material_cost: bidData.materialCost,
        additional_costs: bidData.additionalCosts,
        total_bid_amount: totalBidAmount,
        estimated_duration_hours: bidData.estimatedHours,
        proposal_notes: bidData.proposalNotes,
      })

    if (error) {
      return { success: false, error: error.message }
    }

    // Update job status to 'bidding' if it was 'open'
    await supabaseAdmin
      .from("installation_jobs")
      .update({ status: "bidding" })
      .eq("id", bidData.jobId)
      .eq("status", "open")

    return { success: true, message: "Bid submitted successfully" }
  } catch (error) {
    return { success: false, error: "Failed to submit bid" }
  }
}

export async function updateBidStatus(bidId: string, status: 'accepted' | 'rejected' | 'withdrawn') {
  try {
    const { error } = await supabaseAdmin
      .from("installation_bids")
      .update({ status })
      .eq("id", bidId)

    if (error) {
      return { success: false, error: error.message }
    }

    // If bid is accepted, update the job
    if (status === 'accepted') {
      const { data: bid } = await supabaseAdmin
        .from("installation_bids")
        .select("job_id")
        .eq("id", bidId)
        .single()

      if (bid) {
        await supabaseAdmin
          .from("installation_jobs")
          .update({ 
            status: "assigned",
            selected_bid_id: bidId
          })
          .eq("id", bid.job_id)

        // Reject all other bids for this job
        await supabaseAdmin
          .from("installation_bids")
          .update({ status: "rejected" })
          .eq("job_id", bid.job_id)
          .neq("id", bidId)
          .eq("status", "pending")
      }
    }

    return { success: true, message: `Bid ${status} successfully` }
  } catch (error) {
    return { success: false, error: `Failed to ${status} bid` }
  }
}