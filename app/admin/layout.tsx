import { Suspense } from "react"
import AdminAuthGuard from "@/components/admin/AdminAuthGuard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
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
          <AdminSidebar />
        </Suspense>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </AdminAuthGuard>
  )
}
