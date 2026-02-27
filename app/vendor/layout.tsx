import type React from "react"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { VendorSidebar } from "@/components/vendor/vendor-sidebar"
import VendorAuthGuard from "@/components/vendor/VendorAuthGuard"

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <VendorAuthGuard>
      <div className="flex h-screen bg-gray-50">
        <VendorSidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </VendorAuthGuard>
  )
}
