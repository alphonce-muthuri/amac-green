"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ShoppingBag02Icon,
  PackageIcon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  AlertCircleIcon,
  ArrowRight01Icon,
  CreditCardIcon,
  UserIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Store01Icon,
  DeliveryTruck01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  orders: { label: "Orders", color: "#059669" },
} satisfies ChartConfig

const trendData = [
  { month: "Nov", orders: 1 },
  { month: "Dec", orders: 3 },
  { month: "Jan", orders: 2 },
  { month: "Feb", orders: 4 },
  { month: "Mar", orders: 3 },
  { month: "Apr", orders: 6 },
]

const recentOrders = [
  { id: "ORD-0041", product: "Solar Panel Kit 5kW", date: "Today, 10:24 AM", amount: 12500, status: "pending" },
  { id: "ORD-0040", product: "LED Flood Light 50W (×4)", date: "Yesterday, 3:15 PM", amount: 8800, status: "delivered" },
  { id: "ORD-0039", product: "Inverter 3kVA", date: "28 Mar 2026", amount: 18200, status: "delivered" },
  { id: "ORD-0038", product: "Battery Deep Cycle 200Ah", date: "21 Mar 2026", amount: 6180, status: "cancelled" },
]

const statusMap: Record<string, { label: string; className: string }> = {
  pending:   { label: "Pending",   className: "bg-amber-50 text-amber-700 border-amber-200" },
  delivered: { label: "Delivered", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-500 border-gray-200" },
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applicationStatus, setApplicationStatus] = useState<any>(null)
  const [stats] = useState({
    totalOrders: 12,
    pendingOrders: 2,
    completedOrders: 10,
    totalSpent: 45680,
  })
  const router = useRouter()

  const checkApplicationStatus = useCallback(async (user: any) => {
    const role = user?.user_metadata?.role
    if (role === "vendor") {
      const { data } = await supabase.from("vendor_applications").select("status, created_at, company_name").eq("user_id", user.id).single()
      setApplicationStatus(data)
    } else if (role === "professional") {
      const { data } = await supabase.from("professional_applications").select("status, created_at, company_name").eq("user_id", user.id).single()
      setApplicationStatus(data)
    } else if (role === "delivery") {
      const { data } = await supabase.from("delivery_applications").select("status, created_at, first_name, last_name").eq("user_id", user.id).single()
      setApplicationStatus(data)
    }
  }, [])

  const checkUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) { router.push("/login"); return }

      const role = user?.user_metadata?.role
      if (role === "vendor") { router.push("/vendor"); return }
      if (role === "professional") { router.push("/professional"); return }
      if (role === "admin") { router.push("/admin"); return }
      if (role === "delivery") { router.push("/delivery"); return }

      setUser(user)
      await checkApplicationStatus(user)
    } catch {
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }, [router, checkApplicationStatus])

  useEffect(() => { void checkUser() }, [checkUser])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!user) return null

  const userRole = user?.user_metadata?.role || "customer"
  const firstName = user?.user_metadata?.first_name || user?.user_metadata?.contact_person || "there"
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1">{today}</p>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Good {getGreeting()}, <span className="text-emerald-600">{firstName}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Here's what's happening with your account.</p>
        </div>
        <Button
          onClick={() => router.push("/products")}
          className="h-8 px-4 text-sm bg-emerald-600 hover:bg-emerald-700 rounded-xl font-medium shrink-0"
        >
          <HugeiconsIcon icon={ShoppingBag02Icon} size={14} className="mr-1.5" />
          Shop Now
        </Button>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Total Orders"
          value={stats.totalOrders}
          sub="All time"
          trend="+12%"
          up
          icon={<HugeiconsIcon icon={PackageIcon} size={16} className="text-emerald-600" />}
          accent="emerald"
        />
        <KpiCard
          label="Pending"
          value={stats.pendingOrders}
          sub="In progress"
          icon={<HugeiconsIcon icon={Clock01Icon} size={16} className="text-amber-500" />}
          accent="amber"
        />
        <KpiCard
          label="Completed"
          value={stats.completedOrders}
          sub="Delivered"
          trend="+8%"
          up
          icon={<HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-600" />}
          accent="emerald"
        />
        <KpiCard
          label="Total Spent"
          value={`KES ${(stats.totalSpent / 1000).toFixed(1)}k`}
          sub="Lifetime value"
          icon={<HugeiconsIcon icon={CreditCardIcon} size={16} className="text-gray-500" />}
          accent="gray"
        />
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left col (2/3): chart + recent orders */}
        <div className="lg:col-span-2 space-y-4">

          {/* Orders trend */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-800">Orders over time</p>
                <p className="text-xs text-gray-400">Last 6 months</p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <HugeiconsIcon icon={ArrowUp01Icon} size={11} className="mr-1" />
                +40% vs last period
              </Badge>
            </div>
            <div className="px-4 py-4 h-[180px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart data={trendData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    dataKey="orders"
                    type="monotone"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={{ fill: "#059669", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </div>

          {/* Recent orders */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">Recent Orders</p>
              <button
                onClick={() => router.push("/dashboard/orders")}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                View all
                <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => {
                const s = statusMap[order.status]
                return (
                  <div key={order.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/60 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <HugeiconsIcon icon={PackageIcon} size={15} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{order.product}</p>
                      <p className="text-xs text-gray-400">{order.id} · {order.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(order.amount)}
                      </p>
                      <Badge className={cn("text-[10px] font-semibold border mt-0.5", s.className)}>
                        {s.label}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right col (1/3): quick actions + account + support */}
        <div className="space-y-4">

          {/* Quick actions */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">Quick Actions</p>
            </div>
            <div className="p-3 space-y-1.5">
              {[
                { label: "Browse Products", sub: "Shop solar & LED", icon: ShoppingBag02Icon, href: "/products", color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "My Orders", sub: "Track deliveries", icon: DeliveryTruck01Icon, href: "/dashboard/orders", color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Installations", sub: "Schedule & manage", icon: Store01Icon, href: "/dashboard/installations", color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Profile", sub: "Update your info", icon: UserIcon, href: "/dashboard/profile", color: "text-gray-600", bg: "bg-gray-100" },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", action.bg)}>
                    <HugeiconsIcon icon={action.icon} size={15} className={action.color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 leading-none">{action.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{action.sub}</p>
                  </div>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="text-gray-300 ml-auto shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Account snapshot */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">Account</p>
            </div>
            <div className="divide-y divide-gray-100">
              <Row label="Email" value={<span className="text-xs text-gray-600 truncate max-w-[150px]">{user?.email}</span>} />
              <Row label="Role" value={<Badge className="bg-gray-900 text-white text-[10px] font-semibold border-0 capitalize">{userRole}</Badge>} />
              <Row label="Status" value={<Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">Active</Badge>} />
              <Row label="Member since" value={<span className="text-xs text-gray-600">{new Date(user?.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>} />
            </div>
          </div>

          {/* Support */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">Support</p>
            </div>
            <div className="px-5 py-4 space-y-2">
              <p className="text-xs text-gray-400">Our team is here to help with any questions.</p>
              <a href="mailto:support@amacgreen.energy" className="flex items-center gap-2 text-xs text-gray-600 hover:text-emerald-600 transition-colors font-medium py-1">
                📧 support@amacgreen.energy
              </a>
              <a href="tel:+254700123456" className="flex items-center gap-2 text-xs text-gray-600 hover:text-emerald-600 transition-colors font-medium py-1">
                📞 +254 700 123 456
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Application status (role-gated) ── */}
      {(userRole === "vendor" || userRole === "professional" || userRole === "delivery") && applicationStatus && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={AlertCircleIcon} size={15} className="text-gray-500" />
              <p className="text-sm font-semibold text-gray-800">Application Status</p>
            </div>
            <StatusBadge status={applicationStatus.status} />
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-sm text-gray-600">
              {applicationStatus.status === "pending" && `Your ${userRole} application is under review. We'll notify you once it's processed.`}
              {applicationStatus.status === "approved" && `Your ${userRole} application has been approved. Welcome aboard!`}
              {applicationStatus.status === "rejected" && `Unfortunately, your ${userRole} application was not approved. Contact support for details.`}
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <span>Submitted: <strong className="text-gray-600">{new Date(applicationStatus.created_at).toLocaleDateString()}</strong></span>
              {applicationStatus.company_name && (
                <span>Company: <strong className="text-gray-600">{applicationStatus.company_name}</strong></span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

/* ── Helpers ── */

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}

function KpiCard({ label, value, sub, trend, up, icon, accent }: {
  label: string; value: string | number; sub: string
  trend?: string; up?: boolean; icon: React.ReactNode; accent: "emerald" | "amber" | "gray"
}) {
  const accentBg = { emerald: "bg-emerald-50", amber: "bg-amber-50", gray: "bg-gray-100" }[accent]
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", accentBg)}>
          {icon}
        </div>
        {trend && (
          <span className={cn("text-[10px] font-semibold flex items-center gap-0.5", up ? "text-emerald-600" : "text-red-500")}>
            <HugeiconsIcon icon={up ? ArrowUp01Icon : ArrowDown01Icon} size={10} />
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mt-1.5">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-2.5">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <div className="flex items-center">{value}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === "pending") return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold"><HugeiconsIcon icon={Clock01Icon} size={11} className="mr-1" />Pending</Badge>
  if (status === "approved") return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold"><HugeiconsIcon icon={CheckmarkCircle02Icon} size={11} className="mr-1" />Approved</Badge>
  if (status === "rejected") return <Badge className="bg-gray-900 text-white border-0 text-xs font-semibold"><HugeiconsIcon icon={CancelCircleIcon} size={11} className="mr-1" />Rejected</Badge>
  return null
}
