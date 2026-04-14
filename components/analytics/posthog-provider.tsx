"use client"

import { useEffect, Suspense } from "react"
import Script from "next/script"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { POSTHOG_HOST, POSTHOG_KEY } from "@/lib/posthog"
import { PageViewTracker } from "./page-view-tracker"

/**
 * Initialises PostHog once the CDN array.js has loaded.
 * Runs only in the browser — safe for SSR because Script onLoad
 * is a client-only callback.
 */
function PostHogInit() {
  return (
    <Script
      src={`${POSTHOG_HOST}/static/array.js`}
      strategy="afterInteractive"
      onLoad={() => {
        if (!POSTHOG_KEY) return

        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          // We fire page views manually via PageViewTracker so
          // App Router navigations are captured correctly.
          capture_pageview: false,
          capture_pageleave: true,
          // Respect do-not-track headers.
          respect_dnt: true,
          // Keep session recordings off by default;
          // enable in PostHog project settings when ready.
          disable_session_recording: false,
          loaded(ph) {
            if (process.env.NODE_ENV === "development") {
              ph.debug()
            }
          },
        })
      }}
    />
  )
}

/**
 * Drop this into the root layout.
 * Children are always rendered — analytics is purely additive.
 */
export function PHProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <PostHogInit />
      {/*
       * PageViewTracker uses useSearchParams() which must live inside
       * a Suspense boundary to avoid blocking the page render.
       */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </PostHogProvider>
  )
}
