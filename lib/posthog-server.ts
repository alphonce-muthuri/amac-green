/**
 * Server-side PostHog client.
 *
 * Use this in:
 *  - Server Components  (import and call directly)
 *  - Route Handlers     (import and call directly)
 *  - Server Actions     (import and call directly)
 *
 * IMPORTANT — always call flushAnalytics() before returning from a
 * serverless function. Vercel/Edge functions terminate immediately
 * after the response, so unflushed events would be lost.
 *
 * Example:
 *   import { serverPostHog, flushAnalytics } from "@/lib/posthog-server"
 *
 *   export async function POST(req: Request) {
 *     serverPostHog.capture({ distinctId: "user_123", event: "checkout_started" })
 *     await flushAnalytics()
 *     return Response.json({ ok: true })
 *   }
 */

import { PostHog } from "posthog-node"
import { POSTHOG_HOST, POSTHOG_KEY } from "@/lib/posthog"

function makeClient() {
  if (!POSTHOG_KEY) {
    // Return a dummy client so callers never have to null-check.
    return new PostHog("__no_key__", {
      host: POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    })
  }

  return new PostHog(POSTHOG_KEY, {
    host: POSTHOG_HOST,
    // In serverless we flush manually, so disable automatic batching.
    flushAt: 1,
    flushInterval: 0,
  })
}

// Module-level singleton — reused across invocations in the same
// Lambda/Edge container (warm starts), created fresh otherwise.
export const serverPostHog = makeClient()

/**
 * Flush all queued events and wait for the network call to complete.
 * Call this as the LAST thing before returning from any serverless handler.
 */
export async function flushAnalytics(): Promise<void> {
  if (!POSTHOG_KEY) return
  await serverPostHog.flush()
}

/**
 * Convenience: capture a single server-side event and flush immediately.
 */
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  if (!POSTHOG_KEY) return
  serverPostHog.capture({ distinctId, event, properties })
  await flushAnalytics()
}
