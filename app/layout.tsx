import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { CartProvider } from "@/lib/cart-context"
import { Toaster } from "@/components/ui/toaster"
import { PHProvider } from "@/components/analytics/posthog-provider"

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
  preload: false,
})

export const metadata: Metadata = {
  title: "AMAC Green & Renewable Energy",
  description: "Official AMAC Green & Renewable Energy marketplace for clean, reliable power solutions.",
  generator: 'marabytes',
  icons: {
    icon: [
      { url: '/images/logo/AMAC-Green-logo.png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/images/logo/AMAC-Green-logo.png',
    apple: '/images/logo/AMAC-Green-logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/images/logo/AMAC-Green-logo.png" />
        <link rel="shortcut icon" href="/images/logo/AMAC-Green-logo.png" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body className={dmSans.className}>
        <PHProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </PHProvider>
      </body>
    </html>
  )
}
