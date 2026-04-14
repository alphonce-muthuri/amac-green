import { Suspense } from "react"
import type React from "react"
import VendorAuthGuard from "@/components/vendor/VendorAuthGuard"
import { VendorSidebar } from "@/components/vendor/vendor-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <VendorAuthGuard>
      <SidebarProvider
        style={
          {
            "--sidebar-background": "221 39% 11%",
            "--sidebar-foreground": "0 0% 95%",
            "--sidebar-primary": "161 94% 30%",
            "--sidebar-primary-foreground": "0 0% 100%",
            "--sidebar-accent": "215 28% 17%",
            "--sidebar-accent-foreground": "0 0% 95%",
            "--sidebar-border": "215 28% 17%",
            "--sidebar-ring": "161 94% 30%",
          } as React.CSSProperties
        }
      >
        <Suspense fallback={null}>
          <VendorSidebar />
        </Suspense>
        <SidebarInset className="overflow-y-auto scrollbar-thin">{children}</SidebarInset>
      </SidebarProvider>
    </VendorAuthGuard>
  )
}
