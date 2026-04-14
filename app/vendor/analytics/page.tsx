"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { useAnalytics } from "@/hooks/use-analytics"
import {
  TrendingUp, DollarSign, Package, ShoppingCart,
  Star, AlertTriangle, RefreshCw, Award,
} from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts"

interface AnalyticsData {
  totalProducts: number
  activeProducts: number
  totalRevenue: number
  totalOrders: number
  averageRating: number
  lowStockItems: number
  outOfStockItems: number
  topProducts: Array<{ id: string; name: string; price: number; inventory_quantity: number; revenue: number }>
  recentOrders: Array<{ id: string; order_number: string; total_amount: number; status: string; created_at: string }>
  categoryBreakdown: Array<{ category: string; products: number; revenue: number }>
  revenueTrend: Array<{ day: string; revenue: number; orders: number }>
}

const STATUS_COLORS: Record<string, string> = {
  completed: "#10b981",
  pending:   "#f59e0b",
  processing: "#6366f1",
  cancelled:  "#ef4444",
}

const PALETTE = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

async function generateVendorAnalytics(vendorId: string, days: number): Promise<AnalyticsData> {
  const { data: productsData } = await supabase
    .from("products").select("*").eq("vendor_id", vendorId).order("created_at", { ascending: false })
  const products = productsData || []

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: ordersData } = await supabase
    .from("orders").select("*").gte("created_at", startDate.toISOString()).order("created_at", { ascending: false })
  const orders = ordersData || []

  const { data: reviewsData } = await supabase
    .from("product_reviews").select("*").in("product_id", products.map((p) => p.id))
  const reviews = reviewsData || []

  // Revenue trend (last 7 days)
  const today = new Date()
  const revenueTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const dateStr = d.toDateString()
    const dayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === dateStr)
    return {
      day: DAYS[d.getDay()],
      revenue: dayOrders.reduce((s, o) => s + (o.total_amount || 0), 0),
      orders: dayOrders.length,
    }
  })

  const categoryMap: Record<string, { products: number; revenue: number }> = {}
  products.forEach((p) => {
    const cat = p.category || "Uncategorized"
    if (!categoryMap[cat]) categoryMap[cat] = { products: 0, revenue: 0 }
    categoryMap[cat].products++
    categoryMap[cat].revenue += p.price * (p.inventory_quantity || 0)
  })

  return {
    totalProducts: products.length,
    activeProducts: products.filter((p) => p.status === "active").length,
    totalRevenue: orders.reduce((s, o) => s + (o.total_amount || 0), 0),
    totalOrders: orders.length,
    averageRating: reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0,
    lowStockItems: products.filter((p) => (p.inventory_quantity || 0) <= p.low_stock_threshold && (p.inventory_quantity || 0) > 0).length,
    outOfStockItems: products.filter((p) => (p.inventory_quantity || 0) === 0).length,
    topProducts: products
      .map((p) => ({ id: p.id, name: p.name, price: p.price, inventory_quantity: p.inventory_quantity || 0, revenue: p.price * (p.inventory_quantity || 0) }))
      .sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    recentOrders: orders.slice(0, 10).map((o) => ({
      id: o.id, order_number: o.order_number, total_amount: o.total_amount, status: o.status, created_at: o.created_at,
    })),
    categoryBreakdown: Object.entries(categoryMap)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.revenue - a.revenue),
    revenueTrend,
  }
}

function StatTile({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string | number; sub?: string; icon: React.ElementType
  color: "emerald" | "indigo" | "amber" | "gray"
}) {
  const iconBg  = { emerald: "bg-emerald-500", indigo: "bg-indigo-500", amber: "bg-amber-400", gray: "bg-gray-400" }[color]
  const valClr  = { emerald: "text-emerald-700", indigo: "text-indigo-700", amber: "text-amber-700", gray: "text-gray-700" }[color]
  const ring    = { emerald: "ring-emerald-100", indigo: "ring-indigo-100", amber: "ring-amber-100", gray: "ring-gray-100" }[color]
  return (
    <div className={cn("rounded-2xl bg-white border border-gray-100 p-4 flex items-center gap-3 ring-1", ring)}>
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", iconBg)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p className={cn("text-xl font-bold tabular-nums tracking-tight leading-none mt-0.5", valClr)}>{value}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-700">{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

const TABS = ["overview", "products", "orders"] as const
type Tab = typeof TABS[number]

export default function VendorAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")
  const [tab, setTab] = useState<Tab>("overview")
  const { trackEvent, identifyUser } = useAnalytics()

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Associate all subsequent events with this vendor.
        identifyUser(user.id, { role: "vendor", email: user.email })

        const data = await generateVendorAnalytics(user.id, parseInt(timeRange))
        setAnalytics(data)

        // Snapshot KPIs so PostHog can surface them in cohort filters.
        trackEvent("vendor_analytics_viewed", {
          time_range_days:   parseInt(timeRange),
          total_revenue:     data.totalRevenue,
          total_orders:      data.totalOrders,
          active_products:   data.activeProducts,
          avg_rating:        parseFloat(data.averageRating.toFixed(2)),
          low_stock_items:   data.lowStockItems,
          out_of_stock_items: data.outOfStockItems,
        })
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [timeRange, trackEvent, identifyUser])

  useEffect(() => { void loadAnalytics() }, [loadAnalytics])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-6">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-4 w-px mx-1" />
          <Skeleton className="h-4 w-24" />
        </header>
        <div className="flex-1 p-5 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 p-4 flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <div className="space-y-1.5"><Skeleton className="h-2.5 w-16" /><Skeleton className="h-5 w-12" /></div>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-3">
            <Skeleton className="h-44 rounded-2xl" />
            <Skeleton className="h-44 rounded-2xl" />
          </div>
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
        <VendorHeader title="Analytics" />
        <div className="flex-1 flex items-center justify-center p-5">
          <div className="rounded-2xl bg-white border border-gray-100 p-10 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <TrendingUp className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">Unable to load analytics</p>
            <Button size="sm" className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs mt-1" onClick={() => void loadAnalytics()}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" />Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Donut data for order statuses
  const statusCounts: Record<string, number> = {}
  analytics.recentOrders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1 })
  const orderDonut = Object.entries(statusCounts).map(([status, value]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1), value, fill: STATUS_COLORS[status] ?? "#94a3b8",
  }))

  const catChart = analytics.categoryBreakdown.slice(0, 6).map((c) => ({
    cat: c.category.length > 10 ? c.category.slice(0, 10) + "…" : c.category,
    products: c.products,
    revenue: Math.round(c.revenue / 1000),
  }))

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <VendorHeader title="Analytics">
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => {
              setTimeRange(e.target.value)
              trackEvent("vendor_analytics_time_range_changed", { days: parseInt(e.target.value) })
            }}
            className="h-8 px-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 rounded-xl text-xs"
            onClick={() => {
              trackEvent("vendor_analytics_refreshed", { time_range_days: parseInt(timeRange) })
              void loadAnalytics()
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </VendorHeader>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">

        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTile label="Revenue"         value={`${(analytics.totalRevenue / 1000).toFixed(0)}K`} sub="KES total"       icon={DollarSign}  color="emerald" />
          <StatTile label="Total Orders"    value={analytics.totalOrders}                             sub={`last ${timeRange}d`} icon={ShoppingCart} color="indigo" />
          <StatTile label="Active Products" value={analytics.activeProducts}                          sub={`of ${analytics.totalProducts} total`} icon={Package} color="gray" />
          <StatTile label="Avg Rating"      value={analytics.averageRating.toFixed(1)}               sub="from reviews"   icon={Star}         color="amber" />
        </div>

        {/* Inventory alerts */}
        {(analytics.lowStockItems > 0 || analytics.outOfStockItems > 0) && (
          <div
            className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-3"
            ref={(el) => {
              // Fire once when the banner first becomes visible.
              if (!el) return
              const io = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                  trackEvent("vendor_analytics_stock_alert_seen", {
                    low_stock_items:    analytics.lowStockItems,
                    out_of_stock_items: analytics.outOfStockItems,
                  })
                  io.disconnect()
                }
              }, { threshold: 1 })
              io.observe(el)
            }}
          >
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700">
              {analytics.lowStockItems > 0 && <span className="font-semibold">{analytics.lowStockItems} low stock</span>}
              {analytics.lowStockItems > 0 && analytics.outOfStockItems > 0 && " · "}
              {analytics.outOfStockItems > 0 && <span className="font-semibold">{analytics.outOfStockItems} out of stock</span>}
              <span className="font-normal"> — visit Inventory to restock</span>
            </p>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t)
                if (t !== tab) trackEvent("vendor_analytics_tab_changed", { tab: t, previous_tab: tab })
              }}
              className={cn(
                "rounded-xl px-4 py-1.5 text-[11px] font-medium transition-colors capitalize",
                tab === t ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === "overview" && (
          <div className="space-y-4">
            {/* Revenue trend + status donut */}
            <div className="grid lg:grid-cols-[1fr_200px] gap-3">
              <Section title="Revenue Trend (7 days)">
                <ResponsiveContainer width="100%" height={130}>
                  <AreaChart data={analytics.revenueTrend} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}
                      formatter={(val: number) => [`KES ${val.toLocaleString()}`, "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revFill)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Section>

              <Section title="Order Mix">
                {orderDonut.length === 0 ? (
                  <div className="flex h-[130px] items-center justify-center text-xs text-gray-400">No orders yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={orderDonut} cx="50%" cy="50%" innerRadius={32} outerRadius={52} dataKey="value" paddingAngle={2}>
                        {orderDonut.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,.1)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Section>
            </div>

            {/* Daily orders bar */}
            <Section title="Daily Orders (7 days)">
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={analytics.revenueTrend} margin={{ top: 0, right: 4, left: -28, bottom: 0 }} barSize={18}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,.1)" }} />
                  <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                    {analytics.revenueTrend.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Section>
          </div>
        )}

        {/* ── Products ── */}
        {tab === "products" && (
          <div className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-3">
              {/* Top products */}
              <Section title="Top Products by Value">
                <div className="space-y-2">
                  {analytics.topProducts.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">No products yet</p>
                  ) : analytics.topProducts.map((p, i) => (
                    <div
                      key={p.id}
                      onClick={() => trackEvent("vendor_analytics_top_product_clicked", {
                        product_id:   p.id,
                        product_name: p.name,
                        rank:         i + 1,
                        revenue:      p.revenue,
                      })}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5 hover:bg-gray-100/60 transition-colors cursor-pointer"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{p.inventory_quantity} units · KES {p.price.toLocaleString()} each</p>
                      </div>
                      <p className="text-xs font-bold text-emerald-700 tabular-nums whitespace-nowrap">
                        KES {p.revenue.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Category breakdown */}
              <Section title="Category Performance">
                {catChart.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">No categories yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={catChart} layout="vertical" margin={{ top: 0, right: 8, left: 4, bottom: 0 }} barSize={12}>
                      <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="cat" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={72} />
                      <Tooltip
                        contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}
                        formatter={(val: number) => [`${val}K KES`, "Value"]}
                      />
                      <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                        {catChart.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Section>
            </div>

            {/* Product status tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Total Products",  value: analytics.totalProducts,   color: "bg-gray-100 text-gray-700" },
                { label: "Active",          value: analytics.activeProducts,  color: "bg-emerald-50 text-emerald-700" },
                { label: "Low Stock",       value: analytics.lowStockItems,   color: "bg-amber-50 text-amber-700" },
                { label: "Out of Stock",    value: analytics.outOfStockItems, color: "bg-red-50 text-red-700" },
              ].map((tile) => (
                <div key={tile.label} className={cn("rounded-2xl border border-gray-100 px-4 py-3", tile.color)}>
                  <p className="text-xl font-bold tabular-nums">{tile.value}</p>
                  <p className="text-[10px] font-medium mt-0.5 opacity-70">{tile.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Orders ── */}
        {tab === "orders" && (
          <Section title={`Recent Orders (${analytics.recentOrders.length})`}>
            {analytics.recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <ShoppingCart className="h-8 w-8 text-gray-300" />
                <p className="text-xs text-gray-400">No recent orders</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {analytics.recentOrders.map((order) => {
                  const dotColor = STATUS_COLORS[order.status] ?? "#94a3b8"
                  return (
                    <div key={order.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5 hover:bg-gray-100/50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                        <div>
                          <p className="text-xs font-semibold text-gray-900">#{order.order_number}</p>
                          <p className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-bold text-emerald-700 tabular-nums">
                          KES {order.total_amount.toLocaleString()}
                        </p>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize"
                          style={{ color: dotColor, borderColor: dotColor + "40", backgroundColor: dotColor + "15" }}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  )
}
