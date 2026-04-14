import { Suspense } from "react"
import ProfessionalLayoutGuard from "@/components/professional/ProfessionalLayoutGuard"
import { ProfessionalSidebar } from "@/components/professional/professional-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ProfessionalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfessionalLayoutGuard>
      <SidebarProvider
        style={
          {
            "--sidebar-background": "0 0% 100%",
            "--sidebar-foreground": "222 47% 11%",
            "--sidebar-primary": "161 94% 30%",
            "--sidebar-primary-foreground": "0 0% 100%",
            "--sidebar-accent": "210 40% 96%",
            "--sidebar-accent-foreground": "222 47% 11%",
            "--sidebar-border": "214 32% 91%",
            "--sidebar-ring": "161 94% 30%",
          } as React.CSSProperties
        }
      >
        <Suspense fallback={null}>
          <ProfessionalSidebar />
        </Suspense>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ProfessionalLayoutGuard>
  )
}
