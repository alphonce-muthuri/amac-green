"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Package,
  ShoppingCart,
  DollarSign,
  Plus,
  Clock,
  CheckCircle,
  Truck,
  Store,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  TrendingUp,
  Circle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getVendorOrders } from "@/app/actions/orders"
import Link from "next/link"
import { cn } from "@/lib/utils"

// ─── types ──────────────────────────────────────────────────────────────────
interface DayPoint { day: string; revenue: number; orders: number }
interface StatusSlice { name: string; value: number; color: string }

interface VendorStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  deliveredOrders: number
  revenueChart: DayPoint[]
  statusBreakdown: StatusSlice[]
  recentOrders: any[]
}

// ─── helpers ─────────────────────────────────────────────────────────────────
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function buildChartData(orders: any[]): { revenueChart: DayPoint[]; statusBreakdown: StatusSlice[] } {
  // last 7 days bucketed by day-of-week
  const now = new Date()
  const buckets: Record<string, DayPoint> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const label = DAY_LABELS[d.getDay()]
    buckets[d.toDateString()] = { day: label, revenue: 0, orders: 0 }
  }

  const statusCount: Record<string, number> = { pending: 0, processing: 0, delivered: 0, other: 0 }

  orders.forEach((order: any) => {
    const key = new Date(order.created_at).toDateString()
    if (buckets[key]) {
      const rev = order.order_items?.reduce((s: number, i: any) => s + parseFloat(i.total_price || 0), 0) ?? 0
      buckets[key].revenue += rev
      buckets[key].orders += 1
    }
    const s = order.status
    if (s === "pending" || s === "confirmed") statusCount.pending++
    else if (s === "processing" || s === "shipped") statusCount.processing++
    else if (s === "delivered") statusCount.delivered++
    else statusCount.other++
  })

  const statusBreakdown: StatusSlice[] = [
    { name: "Delivered", value: statusCount.delivered, color: "#10b981" },
    { name: "Processing", value: statusCount.processing, color: "#6366f1" },
    { name: "Pending", value: statusCount.pending, color: "#f59e0b" },
    { name: "Other", value: statusCount.other, color: "#e5e7eb" },
  ].filter(s => s.value > 0)

  return { revenueChart: Object.values(buckets), statusBreakdown }
}

const chartConfig = {
  revenue: { label: "Revenue", color: "#10b981" },
  orders: { label: "Orders", color: "#6366f1" },
}

// ─── StatTile ────────────────────────────────────────────────────────────────
function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
  trend,
}: {
  label: string
  value: string | number
  sub: string
  icon: React.ElementType
  accent?: boolean
  trend?: "up" | "down" | "neutral"
}) {
  return (
    <div className={cn(
      "relative flex flex-col gap-3 rounded-2xl border p-4 bg-white transition-shadow hover:shadow-md",
      accent ? "border-emerald-200/60" : "border-gray-100"
    )}>
      <div className="flex items-start justify-between">
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-xl",
          accent ? "bg-emerald-50" : "bg-gray-50"
        )}>
          <Icon className={cn("h-4 w-4", accent ? "text-emerald-600" : "text-gray-500")} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
            trend === "up" ? "bg-emerald-50 text-emerald-700" :
            trend === "down" ? "bg-red-50 text-red-600" :
            "bg-gray-50 text-gray-500"
          )}>
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
          </div>
        )}
      </div>
      <div>
        <p className={cn("text-2xl font-bold tabular-nums tracking-tight", accent ? "text-emerald-700" : "text-gray-900")}>
          {value}
        </p>
        <p className="mt-0.5 text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

// ─── component ───────────────────────────────────────────────────────────────
export default function VendorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<any>(null)
  const [stats, setStats] = useState<VendorStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    revenueChart: [],
    statusBreakdown: [],
    recentOrders: [],
  })
  const router = useRouter()

  const fetchData = useCallback(async (u: any) => {
    try {
      const [appRes, ordersResult, productRes] = await Promise.all([
        supabase.from("vendor_applications").select("*").eq("user_id", u.id).single(),
        getVendorOrders(u.id),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("vendor_id", u.id).eq("status", "active"),
      ])

      if (appRes.data) setApplicationStatus(appRes.data)

      const orders = (ordersResult.success && ordersResult.data) ? ordersResult.data : []
      const { revenueChart, statusBreakdown } = buildChartData(orders)

      let totalRevenue = 0
      let pendingOrders = 0
      let deliveredOrders = 0

      orders.forEach((order: any) => {
        const rev = order.order_items?.reduce((s: number, i: any) => s + parseFloat(i.total_price || 0), 0) ?? 0
        totalRevenue += rev
        if (order.status === "pending" || order.status === "confirmed" || order.payment_status === "pending") pendingOrders++
        if (order.status === "delivered") deliveredOrders++
      })

      setStats({
        totalProducts: productRes.count ?? 0,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        revenueChart,
        statusBreakdown,
        recentOrders: orders.slice(0, 5),
      })
    } catch (e) {
      console.error(e)
    }
  }, [])

  const checkUser = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) { router.push("/login"); return }
      const role = user.user_metadata?.role
      if (role !== "vendor") {
        const redirects: Record<string, string> = { admin: "/admin", professional: "/professional" }
      router.push(redirects[role] ?? "/dashboard")
        return
      }
      setUser(user)
      await fetchData(user)
    } catch { router.push("/login") }
    finally { setLoading(false) }
  }, [router, fetchData])

  useEffect(() => {
    void checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) router.push("/login")
      else if (event === "SIGNED_IN") await checkUser()
    })
    return () => subscription.unsubscribe()
  }, [router, checkUser])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData(user)
    setTimeout(() => setRefreshing(false), 400)
  }

  const isApproved = applicationStatus?.status === "approved"
  const revenueK = (stats.totalRevenue / 1000).toFixed(1)
  const fulfillRate = stats.totalOrders > 0
    ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100)
    : 0

  // ── loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur px-6">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-4 w-px mx-1" />
          <Skeleton className="h-4 w-28" />
          <div className="ml-auto"><Skeleton className="h-7 w-20 rounded-lg" /></div>
        </header>
        <div className="flex-1 p-5 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
                <Skeleton className="h-8 w-8 rounded-xl" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-40 w-40 rounded-full mx-auto" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
              <Skeleton className="h-4 w-28" />
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  // ── pending / unapproved state ────────────────────────────────────────────
  if (!isApproved) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
        <VendorHeader title="Dashboard" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-4">
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Application Under Review</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your supplier application is being reviewed by our team. This typically takes 1–3 business days.
              You'll be notified once approved.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6 text-left">
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Company</p>
                <p className="text-sm font-semibold text-gray-900">{applicationStatus?.company_name || "—"}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Status</p>
                <p className="text-sm font-semibold text-amber-600 capitalize">{applicationStatus?.status || "pending"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── main dashboard ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <VendorHeader title="Dashboard">
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          size="sm"
          variant="ghost"
          className="h-7 px-2.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </VendorHeader>

      <div className="flex-1 p-5 space-y-4 max-w-[1400px] w-full mx-auto">

        {/* ── identity strip ── */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
            <Store className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">
              {applicationStatus?.company_name || user?.user_metadata?.company_name || "Your Store"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {user?.user_metadata?.contact_person || user?.email}
            </p>
          </div>
          <Badge className="ml-auto rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold hover:bg-emerald-50">
            <CheckCircle className="h-2.5 w-2.5 mr-1" />Verified
          </Badge>
        </div>

        {/* ── KPI row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTile
            label="Active Products"
            value={stats.totalProducts}
            sub="Listed in catalog"
            icon={Package}
            trend={stats.totalProducts > 0 ? "up" : "neutral"}
          />
          <StatTile
            label="Total Orders"
            value={stats.totalOrders}
            sub="All time"
            icon={ShoppingCart}
            accent
            trend={stats.totalOrders > 0 ? "up" : "neutral"}
          />
          <StatTile
            label="Revenue"
            value={`KES ${revenueK}K`}
            sub="Lifetime earnings"
            icon={DollarSign}
            accent
            trend={stats.totalRevenue > 0 ? "up" : "neutral"}
          />
          <StatTile
            label="Pending"
            value={stats.pendingOrders}
            sub="Need attention"
            icon={Clock}
            trend={stats.pendingOrders > 2 ? "down" : "neutral"}
          />
        </div>

        {/* ── charts row ── */}
        <div className="grid lg:grid-cols-3 gap-3">

          {/* Revenue area chart */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Revenue</p>
                <p className="text-xs text-gray-400">Last 7 days</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 rounded-lg px-2 py-1">
                <TrendingUp className="h-3 w-3" />
                <span className="text-[11px] font-semibold">KES {revenueK}K total</span>
              </div>
            </div>
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <AreaChart data={stats.revenueChart} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <ChartTooltip
                  content={<ChartTooltipContent
                    formatter={(v) => [`KES ${Number(v).toLocaleString()}`, "Revenue"]}
                  />}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#10b981" }}
                />
              </AreaChart>
            </ChartContainer>
          </div>

          {/* Order status donut */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-900">Order Status</p>
              <p className="text-xs text-gray-400">{stats.totalOrders} orders total</p>
            </div>
            {stats.statusBreakdown.length > 0 ? (
              <>
                <ChartContainer config={chartConfig} className="h-[130px] w-full">
                  <PieChart>
                    <Pie
                      data={stats.statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={56}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {stats.statusBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  </PieChart>
                </ChartContainer>
                <div className="mt-3 space-y-1.5">
                  {stats.statusBreakdown.map((s) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                        <span className="text-xs text-gray-500">{s.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700 tabular-nums">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[160px] text-gray-400">
                <Circle className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-xs">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ── bottom row ── */}
        <div className="grid lg:grid-cols-5 gap-3">

          {/* Recent orders */}
          <div className="lg:col-span-3 rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">Recent Orders</p>
              <Button asChild variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg">
                <Link href="/vendor/orders">View all →</Link>
              </Button>
            </div>
            {stats.recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <ShoppingCart className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-xs">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {stats.recentOrders.map((order: any) => {
                  const total = order.order_items?.reduce((s: number, i: any) => s + parseFloat(i.total_price || 0), 0) ?? 0
                  const statusColors: Record<string, string> = {
                    pending: "text-amber-600 bg-amber-50",
                    confirmed: "text-indigo-600 bg-indigo-50",
                    processing: "text-blue-600 bg-blue-50",
                    shipped: "text-purple-600 bg-purple-50",
                    delivered: "text-emerald-600 bg-emerald-50",
                    cancelled: "text-red-500 bg-red-50",
                  }
                  const sc = statusColors[order.status] ?? "text-gray-500 bg-gray-50"
                  return (
                    <div key={order.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                        <ShoppingCart className="h-3.5 w-3.5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 tabular-nums truncate">#{order.order_number}</p>
                        <p className="text-[10px] text-gray-400 truncate">{order.customer_email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-gray-900 tabular-nums">KES {total.toLocaleString()}</p>
                        <span className={cn("text-[9px] font-semibold rounded-full px-1.5 py-0.5 capitalize", sc)}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right column: weekly bar + quick actions */}
          <div className="lg:col-span-2 flex flex-col gap-3">

            {/* Weekly orders bar */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 flex-1">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-900">Weekly Orders</p>
                <span className="text-[11px] font-semibold text-indigo-500 bg-indigo-50 rounded-lg px-2 py-0.5">
                  {stats.revenueChart.reduce((s, d) => s + d.orders, 0)} this week
                </span>
              </div>
              <ChartContainer config={chartConfig} className="h-[110px] w-full">
                <BarChart data={stats.revenueChart} margin={{ top: 4, right: 0, left: -28, bottom: 0 }} barSize={10}>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(v) => [v, "Orders"]} />} />
                  <Bar dataKey="orders" radius={[4, 4, 0, 0]} fill="#6366f1" />
                </BarChart>
              </ChartContainer>
            </div>

            {/* Fulfillment rate tile */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Truck className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Fulfillment Rate</p>
                <p className="text-2xl font-bold text-emerald-700 tabular-nums leading-none mt-0.5">{fulfillRate}%</p>
              </div>
              <div className="w-12 h-12 relative shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#d1fae5" strokeWidth="4" />
                  <circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke="#10b981" strokeWidth="4"
                    strokeDasharray={`${(fulfillRate / 100) * 87.96} 87.96`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── quick actions ── */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/vendor/products/add", label: "Add Product", icon: Plus, primary: true },
              { href: "/vendor/products", label: "Products", icon: Package },
              { href: "/vendor/orders", label: "Orders", icon: ShoppingCart },
              { href: "/vendor/deliveries", label: "Deliveries", icon: Truck },
            ].map(({ href, label, icon: Icon, primary }) => (
              <Button
                key={href}
                asChild
                size="sm"
                variant={primary ? "default" : "outline"}
                className={cn(
                  "h-8 rounded-xl text-xs font-semibold gap-1.5",
                  primary
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Link href={href}>
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
