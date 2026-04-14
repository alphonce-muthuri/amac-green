"use client"

import { usePostHog } from "posthog-js/react"
import { useCallback } from "react"

export interface AnalyticsHook {
  /** Fire a named event with optional properties. */
  trackEvent(name: string, properties?: Record<string, unknown>): void
  /** Manually record a page view (use for virtual pages / modals). */
  trackPageView(path: string, properties?: Record<string, unknown>): void
  /** Associate subsequent events with a known user. */
  identifyUser(userId: string, traits?: Record<string, unknown>): void
  /** Reset identity — call on sign-out. */
  resetUser(): void
}

/**
 * Typed wrapper around PostHog that gives you stable, memoised
 * helper functions so you can safely add them to useEffect deps.
 *
 * All calls are no-ops if PostHog has not yet initialised (e.g.
 * ad-blockers, SSR) so you never need to null-check at the call site.
 */
export function useAnalytics(): AnalyticsHook {
  const ph = usePostHog()

  const trackEvent = useCallback(
    (name: string, properties?: Record<string, unknown>) => {
      ph?.capture(name, properties)
    },
    [ph],
  )

  const trackPageView = useCallback(
    (path: string, properties?: Record<string, unknown>) => {
      ph?.capture("$pageview", {
        $current_url: path,
        ...properties,
      })
    },
    [ph],
  )

  const identifyUser = useCallback(
    (userId: string, traits?: Record<string, unknown>) => {
      ph?.identify(userId, traits)
    },
    [ph],
  )

  const resetUser = useCallback(() => {
    ph?.reset()
  }, [ph])

  return { trackEvent, trackPageView, identifyUser, resetUser }
}
