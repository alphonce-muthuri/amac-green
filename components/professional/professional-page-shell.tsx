"use client"

import type { ReactNode } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

interface ProfessionalPageShellProps {
  title: string
  children: ReactNode
  contentClassName?: string
}

export function ProfessionalPageShell({ title, children, contentClassName }: ProfessionalPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex h-14 items-center gap-4 border-b bg-white px-6">
        <SidebarTrigger className="-ml-1" />
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </header>
      <div className={cn("p-6", contentClassName)}>
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>
    </div>
  )
}
