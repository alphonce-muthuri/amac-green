"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, PieChart, Pie, Cell } from "recharts"
import {
  Search, Package, Clock, CheckCircle, Truck,
  AlertCircle, Eye, ShoppingCart, X, DollarSign,
  ChevronRight, ArrowRight,
} from "lucide-react"
import {
  getVendorOrders,
  updateOrderStatus,
  updateOrderFulfillmentStage,
  type FulfillmentStage,
} from "@/app/actions/orders"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

// ─── constants ────────────────────────────────────────────────────────────────
const FULFILLMENT: { value: FulfillmentStage; label: string }[] = [
  { value: "order_received",        label: "Order received" },
  { value: "installation_in_progress", label: "Installing" },
  { value: "commissioned",          label: "Commissioned" },
  { value: "completed",             label: "Completed" },
]

const STATUS_META: Record<string, { label: string; dot: string; badge: string; bg: string }> = {
  pending:    { label: "Pending",    dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200",    bg: "bg-amber-50" },
  confirmed:  { label: "Confirmed",  dot: "bg-indigo-400",  badge: "bg-indigo-50 text-indigo-700 border-indigo-200", bg: "bg-indigo-50" },
  processing: { label: "Processing", dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200",       bg: "bg-blue-50" },
  shipped:    { label: "Shipped",    dot: "bg-purple-400",  badge: "bg-purple-50 text-purple-700 border-purple-200", bg: "bg-purple-50" },
  delivered:  { label: "Delivered",  dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bg: "bg-emerald-50" },
  cancelled:  { label: "Cancelled",  dot: "bg-red-400",     badge: "bg-red-50 text-red-600 border-red-200",          bg: "bg-red-50" },
  refunded:   { label: "Refunded",   dot: "bg-gray-400",    badge: "bg-gray-100 text-gray-500 border-gray-200",      bg: "bg-gray-50" },
}

const NEXT_STATUS: Record<string, { status: string; label: string } | null> = {
  pending:    { status: "confirmed",  label: "Confirm" },
  confirmed:  { status: "processing", label: "Process" },
  processing: { status: "shipped",    label: "Ship" },
  shipped:    null,
  delivered:  null,
  cancelled:  null,
}

const chartConfig = { orders: { label: "Orders", color: "#10b981" }, value: { label: "Orders", color: "#10b981" } }
const DAY_LABELS  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// ─── helpers ──────────────────────────────────────────────────────────────────
function orderTotal(order: any) {
  return order.order_items?.reduce((s: number, i: any) => s + parseFloat(i.total_price ?? 0), 0) ?? 0
}

function StatTile({ label, value, sub, icon: Icon, color = "gray" }: {
  label: string; value: string | number; sub: string
  icon: React.ElementType; color?: "gray" | "emerald" | "amber" | "indigo"
}) {
  const iconCls = { gray: "text-gray-400 bg-gray-50", emerald: "text-emerald-600 bg-emerald-50", amber: "text-amber-500 bg-amber-50", indigo: "text-indigo-500 bg-indigo-50" }[color]
  const valCls  = { gray: "text-gray-900", emerald: "text-emerald-700", amber: "text-amber-600", indigo: "text-indigo-600" }[color]
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", iconCls)}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className={cn("text-2xl font-bold tabular-nums tracking-tight", valCls)}>{value}</p>
        <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

// ─── order detail panel ───────────────────────────────────────────────────────
function OrderPanel({ order, onClose, onStatusUpdate, onFulfillmentChange }: {
  order: any; onClose: () => void
  onStatusUpdate: (id: string, status: string) => void
  onFulfillmentChange: (id: string, stage: FulfillmentStage) => void
}) {
  const meta   = STATUS_META[order.status] ?? STATUS_META.pending
  const total  = orderTotal(order)
  const next   = NEXT_STATUS[order.status]

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <p className="text-sm font-bold text-gray-900">#{order.order_number}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn("rounded-full border text-[10px] font-semibold px-2 py-0.5", meta.badge)}>
            <span className={cn("inline-block h-1.5 w-1.5 rounded-full mr-1", meta.dot)} />
            {meta.label}
          </Badge>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-5">
        {/* customer */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Customer</p>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-1">
            <p className="text-xs font-semibold text-gray-900">{order.shipping_first_name} {order.shipping_last_name}</p>
            <p className="text-[11px] text-gray-500">{order.customer_email}</p>
            {order.shipping_phone && <p className="text-[11px] text-gray-500">{order.shipping_phone}</p>}
            {order.shipping_address_line1 && (
              <p className="text-[11px] text-gray-400 mt-1">{order.shipping_address_line1}, {order.shipping_city}</p>
            )}
          </div>
        </div>

        {/* items */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Items ({order.order_items?.length ?? 0})
          </p>
          <div className="space-y-1.5">
            {order.order_items?.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{item.product_name ?? item.products?.name}</p>
                  <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-xs font-bold text-gray-900 tabular-nums ml-3 shrink-0">
                  KES {parseFloat(item.total_price ?? 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* totals */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal</span>
            <span className="tabular-nums font-medium text-gray-700">KES {total.toLocaleString()}</span>
          </div>
          {order.delivery_fee > 0 && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>Delivery</span>
              <span className="tabular-nums font-medium text-gray-700">KES {order.delivery_fee?.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200">
            <span>Total</span>
            <span className="tabular-nums text-emerald-700">KES {total.toLocaleString()}</span>
          </div>
        </div>

        {/* fulfillment */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Fulfillment Stage</p>
          <Select
            value={order.fulfillment_stage ?? "order_received"}
            onValueChange={v => onFulfillmentChange(order.id, v as FulfillmentStage)}
          >
            <SelectTrigger className="h-8 text-xs rounded-xl border-gray-200 bg-gray-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FULFILLMENT.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* action footer */}
      {next && (
        <div className="px-5 py-4 border-t border-gray-100">
          <Button
            onClick={() => onStatusUpdate(order.id, next.status)}
            className="w-full h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
          >
            <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
            {next.label} Order
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export default function VendorOrdersPage() {
  const [orders, setOrders]           = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [searchTerm, setSearchTerm]   = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    const result = await getVendorOrders()
    if (result.success) setOrders(result.data ?? [])
    setLoading(false)
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    await updateOrderStatus(id, status)
    loadOrders()
    if (selectedOrder?.id === id) setSelectedOrder((o: any) => ({ ...o, status }))
  }

  const handleFulfillmentChange = async (id: string, stage: FulfillmentStage) => {
    await updateOrderFulfillmentStage(id, stage)
    loadOrders()
    if (selectedOrder?.id === id) setSelectedOrder((o: any) => ({ ...o, fulfillment_stage: stage }))
  }

  // ── derived ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     orders.length,
    pending:   orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => ["confirmed", "processing"].includes(o.status)).length,
    delivered: orders.filter(o => o.status === "delivered").length,
    revenue:   orders.reduce((s, o) => s + orderTotal(o), 0),
  }), [orders])

  // 7-day trend
  const trendChart = useMemo(() => {
    const now = new Date()
    const buckets: Record<string, { day: string; orders: number }> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i)
      buckets[d.toDateString()] = { day: DAY_LABELS[d.getDay()], orders: 0 }
    }
    orders.forEach(o => {
      const k = new Date(o.created_at).toDateString()
      if (buckets[k]) buckets[k].orders++
    })
    return Object.values(buckets)
  }, [orders])

  // status donut
  const statusChart = useMemo(() => [
    { name: "Delivered",  value: stats.delivered,                                                  color: "#10b981" },
    { name: "Processing", value: stats.processing,                                                 color: "#6366f1" },
    { name: "Pending",    value: stats.pending,                                                    color: "#f59e0b" },
    { name: "Other",      value: stats.total - stats.delivered - stats.processing - stats.pending, color: "#e5e7eb" },
  ].filter(s => s.value > 0), [stats])

  const filtered = useMemo(() =>
    orders.filter(o => {
      const q = searchTerm.toLowerCase()
      const matchSearch = o.order_number?.toLowerCase().includes(q) || o.customer_email?.toLowerCase().includes(q)
      const matchStatus = statusFilter === "all" || o.status === statusFilter
      return matchSearch && matchStatus
    }),
  [orders, searchTerm, statusFilter])

  // ── skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur px-6">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-4 w-px mx-1" />
          <Skeleton className="h-4 w-16" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="h-7 w-48 rounded-lg" />
          </div>
        </header>
        <div className="flex-1 p-5 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
                <Skeleton className="h-8 w-8 rounded-xl" />
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
              <Skeleton className="h-4 w-28" /><Skeleton className="h-44 w-full rounded-xl" />
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
              <Skeleton className="h-4 w-24" /><Skeleton className="h-36 w-36 rounded-full mx-auto" />
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}</div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <VendorHeader title="Orders">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Order # or customer…"
            className="h-7 w-52 pl-7 text-xs rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus-visible:ring-emerald-500 placeholder:text-gray-400"
          />
        </div>
      </VendorHeader>

      {/* layout: content + detail panel */}
      <div className={cn("flex flex-1 overflow-hidden", selectedOrder ? "lg:grid lg:grid-cols-[1fr_320px]" : "")}>

        {/* ── main scroll area ── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-5 space-y-4 max-w-[1200px] w-full mx-auto">

            {/* KPI tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatTile label="Total Orders"  value={stats.total}      sub="All time"        icon={ShoppingCart} color="emerald" />
              <StatTile label="Pending"       value={stats.pending}    sub="Need action"     icon={Clock}        color="amber"   />
              <StatTile label="Processing"    value={stats.processing} sub="In progress"     icon={Package}      color="indigo"  />
              <StatTile label="Revenue"       value={`KES ${(stats.revenue / 1000).toFixed(1)}K`} sub="Lifetime"  icon={DollarSign} color="emerald" />
            </div>

            {/* charts */}
            {orders.length > 0 && (
              <div className="grid lg:grid-cols-3 gap-3">
                {/* trend */}
                <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Order Trend</p>
                      <p className="text-xs text-gray-400">Last 7 days</p>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 rounded-lg px-2 py-1">
                      {trendChart.reduce((s, d) => s + d.orders, 0)} this week
                    </span>
                  </div>
                  <ChartContainer config={chartConfig} className="h-[160px] w-full">
                    <AreaChart data={trendChart} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent formatter={v => [v, "Orders"]} />} />
                      <Area type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2}
                        fill="url(#ordGrad)" dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ChartContainer>
                </div>

                {/* status donut */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-900">Status Breakdown</p>
                    <p className="text-xs text-gray-400">{stats.total} orders total</p>
                  </div>
                  <ChartContainer config={chartConfig} className="h-[120px] w-full">
                    <PieChart>
                      <Pie data={statusChart} cx="50%" cy="50%" innerRadius={34} outerRadius={52} paddingAngle={3} dataKey="value">
                        {statusChart.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="mt-3 space-y-1.5">
                    {statusChart.map(s => (
                      <div key={s.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full inline-block" style={{ background: s.color }} />
                          <span className="text-xs text-gray-500">{s.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-700 tabular-nums">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* filter tabs */}
            <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit">
              {(["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const).map(f => {
                const count = f === "all" ? stats.total : orders.filter(o => o.status === f).length
                return (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-semibold transition-colors capitalize whitespace-nowrap",
                      statusFilter === f ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {f === "all" ? `All (${count})` : `${STATUS_META[f]?.label ?? f} (${count})`}
                  </button>
                )
              })}
            </div>

            {/* orders table */}
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white flex flex-col items-center justify-center py-16 text-gray-400">
                <ShoppingCart className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm font-semibold text-gray-600">No orders found</p>
                <p className="text-xs mt-1">
                  {statusFilter !== "all" ? "Try switching the filter" : "Orders will appear here once customers purchase"}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                {/* col headers */}
                <div className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Order</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Customer</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 text-right">Items</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 text-right">Total</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Stage</p>
                </div>

                {filtered.map((order, idx) => {
                  const meta  = STATUS_META[order.status] ?? STATUS_META.pending
                  const total = orderTotal(order)
                  const isSelected = selectedOrder?.id === order.id

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(isSelected ? null : order)}
                      className={cn(
                        "grid grid-cols-[1fr_1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3 cursor-pointer transition-colors",
                        idx < filtered.length - 1 && "border-b border-gray-50",
                        isSelected ? "bg-emerald-50/60" : "hover:bg-gray-50/60"
                      )}
                    >
                      {/* order # + date */}
                      <div>
                        <p className="text-xs font-bold text-gray-900 tabular-nums">#{order.order_number}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </p>
                      </div>

                      {/* customer */}
                      <p className="text-xs text-gray-500 truncate">{order.customer_email}</p>

                      {/* items */}
                      <p className="text-xs font-semibold text-gray-700 tabular-nums text-right">
                        {order.order_items?.length ?? 0}
                      </p>

                      {/* total */}
                      <p className="text-xs font-bold text-gray-900 tabular-nums text-right whitespace-nowrap">
                        KES {total.toLocaleString()}
                      </p>

                      {/* status */}
                      <Badge className={cn("rounded-full border text-[10px] font-semibold px-2 py-0.5 whitespace-nowrap", meta.badge)}>
                        <span className={cn("inline-block h-1.5 w-1.5 rounded-full mr-1", meta.dot)} />
                        {meta.label}
                      </Badge>

                      {/* fulfillment inline */}
                      <div onClick={e => e.stopPropagation()}>
                        <Select
                          value={order.fulfillment_stage ?? "order_received"}
                          onValueChange={v => handleFulfillmentChange(order.id, v as FulfillmentStage)}
                        >
                          <SelectTrigger className="h-7 w-[130px] text-[11px] rounded-lg border-gray-200 bg-gray-50 focus:ring-emerald-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FULFILLMENT.map(o => (
                              <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── detail panel ── */}
        {selectedOrder && (
          <div className="hidden lg:flex flex-col border-l border-gray-100 bg-white w-[320px] shrink-0 overflow-hidden">
            <OrderPanel
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onStatusUpdate={handleStatusUpdate}
              onFulfillmentChange={handleFulfillmentChange}
            />
          </div>
        )}
      </div>

      {/* mobile detail drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-xl">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1 shrink-0" />
            <OrderPanel
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onStatusUpdate={handleStatusUpdate}
              onFulfillmentChange={handleFulfillmentChange}
            />
          </div>
        </div>
      )}
    </div>
  )
}
