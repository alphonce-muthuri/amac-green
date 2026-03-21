import { supabaseAdmin } from "@/lib/supabase-server"

export type FinancingStatus = "none" | "pending" | "approved" | "declined" | "cancelled"

export function isKcbFinancingSimulationEnabled(): boolean {
  return process.env.KCB_FINANCING_SIMULATION === "true"
}

export function getKcbFinancingSimulateSecret(): string | undefined {
  return process.env.KCB_FINANCING_SIMULATE_SECRET
}

export function getKcbFinancingAutoApproveMs(): number {
  const n = parseInt(process.env.KCB_FINANCING_AUTO_APPROVE_MS || "0", 10)
  return Number.isFinite(n) ? n : 0
}

export interface ApplyFinancingOutcomeParams {
  orderId: string
  outcome: "approved" | "declined"
  mockReference?: string
}

/**
 * Updates order financing fields after simulated (or future real) KCB decision.
 */
export async function applyFinancingOutcome(params: ApplyFinancingOutcomeParams): Promise<{
  success: boolean
  error?: string
}> {
  const { orderId, outcome, mockReference } = params
  const now = new Date().toISOString()
  const ref =
    mockReference ||
    `KCB-SIM-${outcome.toUpperCase()}-${Date.now().toString(36)}`

  const financing_status: FinancingStatus = outcome === "approved" ? "approved" : "declined"

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      financing_status,
      financing_reference: ref,
      financing_decided_at: now,
      financing_payload: {
        source: "simulation",
        outcome,
        decided_at: now,
      },
      updated_at: now,
    })
    .eq("id", orderId)

  if (error) {
    console.error("[FINANCING] applyFinancingOutcome:", error)
    return { success: false, error: error.message }
  }

  const { error: histErr } = await supabaseAdmin.from("order_status_history").insert({
    order_id: orderId,
    status: outcome === "approved" ? "fin_appr" : "fin_decl",
    notes: `KCB financing ${outcome}: ${ref}`,
  })
  if (histErr) {
    console.warn("[FINANCING] order_status_history:", histErr.message)
  }

  return { success: true }
}
