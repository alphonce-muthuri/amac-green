"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface VendorHeaderProps {
  title: string
  children?: React.ReactNode
}

export function VendorHeader({ title, children }: VendorHeaderProps) {
  return (
    <header className="flex h-14 min-w-0 shrink-0 items-center gap-2 border-b bg-white px-4">
      <SidebarTrigger className="-ml-1 shrink-0" />
      <Separator orientation="vertical" className="h-4 shrink-0" />
      <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{title}</h1>
      {children && (
        <div className="ml-2 flex min-w-0 max-w-[60%] items-center justify-end gap-2 overflow-hidden">
          {children}
        </div>
      )}
    </header>
  )
}
