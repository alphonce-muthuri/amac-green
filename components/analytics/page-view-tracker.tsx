"use client"

/**
 * App Router does not fire route-change events, so posthog's
 * built-in page-view capture misses soft navigations.
 *
 * This component:
 *  1. Fires a $pageview on first mount.
 *  2. Re-fires whenever the pathname or search params change.
 *
 * It must be wrapped in <Suspense> because useSearchParams()
 * opts the subtree into client-side rendering.
 */

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"

export function PageViewTracker() {
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const lastUrl      = useRef<string | null>(null)

  useEffect(() => {
    if (!posthog.__loaded) return

    const search = searchParams?.toString()
    const url    = pathname + (search ? `?${search}` : "")

    // Deduplicate: React can re-run effects without the URL changing.
    if (url === lastUrl.current) return
    lastUrl.current = url

    posthog.capture("$pageview", {
      $current_url: window.location.href,
    })
  }, [pathname, searchParams])

  return null
}
