/** Client-safe flags (NEXT_PUBLIC_*) and server-only helpers. */

export function isFinancingCheckoutEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_FINANCING_CHECKOUT === "true"
}

export function isDemandProfileEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEMAND_PROFILE === "true"
}

/** Category slug/name used for enhanced Kenya location fields at checkout (legacy default: gas-yetu). */
export function getEnhancedLocationCategorySlug(): string {
  return process.env.NEXT_PUBLIC_ENHANCED_LOCATION_CATEGORY_SLUG || "gas-yetu"
}

export function showFinancingSimulationUi(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_FINANCING_SIMULATION_UI === "true"
}

/** Client-only: optional auto-approve delay after financing order (ms). */
export function getFinancingAutoApproveMsClient(): number {
  const n = parseInt(process.env.NEXT_PUBLIC_KCB_FINANCING_AUTO_APPROVE_MS || "0", 10)
  return Number.isFinite(n) ? n : 0
}
