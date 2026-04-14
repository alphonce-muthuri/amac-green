"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { VendorDeliveryLiveMap } from "@/components/vendor/vendor-delivery-live-map"
import { getVendorDeliveries } from "@/app/actions/vendor-deliveries"
import { cn } from "@/lib/utils"
import {
  Package, Clock, CheckCircle, Truck, Phone, MapPin, User,
  TrendingUp, X, Map,
} from "lucide-react"
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell,
} from "recharts"

interface VendorDelivery {
  id: string
  order_id: string
  delivery_status: string
  delivery_address_line1: string
  delivery_city: string
  delivery_country: string
  delivery_fee: number
  estimated_delivery_time: string
  actual_delivery_time?: string
  created_at: string
  orders: {
    order_number: string
    customer_email: string
    shipping_first_name: string
    shipping_last_name: string
    order_items: Array<{
      product_name: string
      quantity: number
      total_price: string
      products: { name: string; sku: string } | null
    }>
    vendor_total: number
  }
  delivery_applications: {
    first_name: string
    last_name: string
    phone: string
    vehicle_type: string
    vehicle_registration: string
  } | null
}

const STATUS_META: Record<string, { label: string; dot: string; badge: string; bg: string }> = {
  assigned:   { label: "Assigned",   dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200",   bg: "bg-amber-50"   },
  picked_up:  { label: "Picked Up",  dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200",      bg: "bg-blue-50"    },
  in_transit: { label: "In Transit", dot: "bg-indigo-400",  badge: "bg-indigo-50 text-indigo-700 border-indigo-200",bg: "bg-indigo-50"  },
  delivered:  { label: "Delivered",  dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bg: "bg-emerald-50" },
  failed:     { label: "Failed",     dot: "bg-red-400",     badge: "bg-red-50 text-red-700 border-red-200",         bg: "bg-red-50"     },
}

const STATUS_TABS = ["all", "assigned", "picked_up", "in_transit", "delivered", "failed"]
const CHART_COLORS = ["#f59e0b", "#6366f1", "#10b981", "#ef4444", "#3b82f6"]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function buildChartData(deliveries: VendorDelivery[]) {
  const today = new Date()
  const trend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    return { day: DAYS[d.getDay()], count: 0, date: d.toDateString() }
  })
  deliveries.forEach((del) => {
    const d = new Date(del.created_at).toDateString()
    const slot = trend.find((t) => t.date === d)
    if (slot) slot.count++
  })

  const statusCounts: Record<string, number> = {}
  deliveries.forEach((del) => {
    statusCounts[del.delivery_status] = (statusCounts[del.delivery_status] || 0) + 1
  })
  const donut = Object.entries(statusCounts).map(([status, value]) => ({
    name: STATUS_META[status]?.label ?? status,
    value,
  }))

  return { trend, donut }
}

function StatTile({
  label, value, sub, color,
}: { label: string; value: string | number; sub?: string; color: "emerald" | "amber" | "indigo" | "red" }) {
  const ring = {
    emerald: "ring-emerald-100",
    amber:   "ring-amber-100",
    indigo:  "ring-indigo-100",
    red:     "ring-red-100",
  }[color]
  const iconBg = {
    emerald: "bg-emerald-500",
    amber:   "bg-amber-400",
    indigo:  "bg-indigo-500",
    red:     "bg-red-500",
  }[color]
  const valueColor = {
    emerald: "text-emerald-700",
    amber:   "text-amber-700",
    indigo:  "text-indigo-700",
    red:     "text-red-700",
  }[color]

  return (
    <div className={cn("rounded-2xl bg-white border border-gray-100 p-4 flex items-center gap-3 ring-1", ring)}>
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", iconBg)}>
        <Truck className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p className={cn("text-xl font-bold tabular-nums tracking-tight leading-none mt-0.5", valueColor)}>{value}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.assigned
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", meta.badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  )
}

function DeliveryPanel({
  delivery,
  onClose,
}: {
  delivery: VendorDelivery
  onClose: () => void
}) {
  const meta = STATUS_META[delivery.delivery_status] ?? STATUS_META.assigned
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-400">Order</p>
          <p className="text-sm font-bold text-gray-900">#{delivery.orders.order_number}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={delivery.delivery_status} />
          <button onClick={onClose} className="ml-1 rounded-lg p-1 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-4 text-sm">
        {/* Customer */}
        <div className={cn("rounded-xl p-3 border", meta.bg, "border-gray-100")}>
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 mb-2 flex items-center gap-1">
            <User className="h-3 w-3" /> Customer
          </p>
          <p className="font-semibold text-gray-900">
            {delivery.orders.shipping_first_name} {delivery.orders.shipping_last_name}
          </p>
          <p className="text-xs text-gray-500">{delivery.orders.customer_email}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3" />
            {delivery.delivery_address_line1}, {delivery.delivery_city}
          </p>
        </div>

        {/* Driver */}
        {delivery.delivery_applications && (
          <div className="rounded-xl p-3 border border-gray-100 bg-gray-50">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 mb-2 flex items-center gap-1">
              <Truck className="h-3 w-3" /> Driver
            </p>
            <p className="font-semibold text-gray-900">
              {delivery.delivery_applications.first_name} {delivery.delivery_applications.last_name}
            </p>
            <p className="text-xs text-gray-500">
              {delivery.delivery_applications.vehicle_type} · {delivery.delivery_applications.vehicle_registration}
            </p>
            <Button
              size="sm"
              className="mt-2 h-7 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs"
              onClick={() => window.open(`tel:${delivery.delivery_applications?.phone}`, "_self")}
            >
              <Phone className="h-3 w-3 mr-1" />
              Call Driver
            </Button>
          </div>
        )}

        {/* Items */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 mb-2">
            Products ({delivery.orders.order_items.length})
          </p>
          <div className="space-y-1.5">
            {delivery.orders.order_items.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                <div>
                  <p className="text-xs font-medium text-gray-900">{item.product_name}</p>
                  {item.products?.sku && (
                    <p className="text-[10px] text-gray-400">SKU: {item.products.sku}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-800">
                    KES {parseFloat(item.total_price).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400">×{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl border border-gray-100 bg-white p-3 space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Timeline</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Created</span>
            <span className="font-medium tabular-nums">
              {new Date(delivery.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Est. Delivery</span>
            <span className="font-medium tabular-nums">
              {new Date(delivery.estimated_delivery_time).toLocaleString()}
            </span>
          </div>
          {delivery.actual_delivery_time && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Delivered</span>
              <span className="font-semibold text-emerald-600 tabular-nums">
                {new Date(delivery.actual_delivery_time).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Delivery Fee</span>
            <span className="font-medium">KES {delivery.delivery_fee?.toLocaleString() ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-1.5">
            <span className="text-xs font-semibold text-gray-700">Your Total</span>
            <span className="text-sm font-bold text-emerald-700 tabular-nums">
              KES {delivery.orders.vendor_total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VendorDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<VendorDelivery[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState("all")
  const [selected, setSelected] = useState<VendorDelivery | null>(null)
  const [showMap, setShowMap] = useState(false)
  const router = useRouter()

  const loadDeliveries = useCallback(async () => {
    try {
      const result = await getVendorDeliveries()
      if (result.success) setDeliveries(result.data || [])
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) { router.push("/login"); return }
      if (user.user_metadata?.role !== "vendor") { router.push("/dashboard"); return }
      await loadDeliveries()
      setLoading(false)
    })()
  }, [router, loadDeliveries])

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
                <div className="space-y-1.5">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-5 w-10" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-3">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const stats = {
    total:     deliveries.length,
    pending:   deliveries.filter((d) => ["assigned", "picked_up"].includes(d.delivery_status)).length,
    inTransit: deliveries.filter((d) => d.delivery_status === "in_transit").length,
    delivered: deliveries.filter((d) => d.delivery_status === "delivered").length,
  }

  const { trend, donut } = buildChartData(deliveries)

  const tabCounts: Record<string, number> = { all: deliveries.length }
  deliveries.forEach((d) => {
    tabCounts[d.delivery_status] = (tabCounts[d.delivery_status] || 0) + 1
  })

  const filtered = tab === "all" ? deliveries : deliveries.filter((d) => d.delivery_status === tab)

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <VendorHeader title="Deliveries">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 rounded-xl text-xs"
          onClick={() => setShowMap((v) => !v)}
        >
          <Map className="h-3.5 w-3.5" />
          {showMap ? "Hide Map" : "Live Map"}
        </Button>
      </VendorHeader>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className={cn("flex flex-col flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4 transition-all", selected ? "lg:mr-0" : "")}>

          {/* KPI tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile label="Total"     value={stats.total}     sub="all deliveries"   color="emerald" />
            <StatTile label="Pending"   value={stats.pending}   sub="assigned / pickup" color="amber"   />
            <StatTile label="In Transit" value={stats.inTransit} sub="on the way"       color="indigo"  />
            <StatTile label="Delivered" value={stats.delivered} sub="completed"         color="emerald" />
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-[1fr_200px] gap-3">
            {/* Trend chart */}
            <div className="rounded-2xl bg-white border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-700">7-Day Delivery Trend</p>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <ResponsiveContainer width="100%" height={110}>
                <AreaChart data={trend} margin={{ top: 2, right: 2, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="delFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,.1)" }} />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fill="url(#delFill)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Donut */}
            <div className="rounded-2xl bg-white border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">Status Breakdown</p>
              {donut.length === 0 ? (
                <div className="flex h-[110px] items-center justify-center text-xs text-gray-400">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={110}>
                  <PieChart>
                    <Pie data={donut} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="value" paddingAngle={2}>
                      {donut.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,.1)" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Live map (toggleable) */}
          {showMap && (
            <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <Map className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-semibold text-gray-700">Live Tracking Map</p>
              </div>
              <VendorDeliveryLiveMap />
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {STATUS_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap",
                  tab === t
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {t === "all" ? "All" : (STATUS_META[t]?.label ?? t)}
                {tabCounts[t] != null && (
                  <span className={cn("ml-1 text-[10px]", tab === t ? "text-gray-300" : "text-gray-400")}>
                    {tabCounts[t] ?? 0}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Deliveries list */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 flex flex-col items-center justify-center py-16 gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">No deliveries found</p>
              <p className="text-xs text-gray-400">Deliveries will appear once customers place orders</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Order</p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Customer</p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 text-right">Fee</p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Status</p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Est.</p>
              </div>

              {filtered.map((del, i) => (
                <div
                  key={del.id}
                  onClick={() => setSelected(selected?.id === del.id ? null : del)}
                  className={cn(
                    "grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-0 hover:bg-gray-50/70",
                    selected?.id === del.id && "bg-emerald-50/60"
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 tabular-nums">
                      #{del.orders.order_number}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(del.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-700 truncate">
                      {del.orders.shipping_first_name} {del.orders.shipping_last_name}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">{del.orders.customer_email}</p>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 tabular-nums text-right whitespace-nowrap">
                    KES {del.delivery_fee?.toLocaleString() ?? "—"}
                  </p>
                  <StatusBadge status={del.delivery_status} />
                  <p className="text-[10px] text-gray-400 tabular-nums whitespace-nowrap">
                    {new Date(del.estimated_delivery_time).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop detail panel */}
        {selected && (
          <div className="hidden lg:flex flex-col w-80 shrink-0 border-l border-gray-200 bg-white overflow-hidden">
            <DeliveryPanel delivery={selected} onClose={() => setSelected(null)} />
          </div>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {selected && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setSelected(null)}
          />
          <div className="relative bg-white rounded-t-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="mx-auto mt-2.5 h-1 w-8 rounded-full bg-gray-300" />
            <DeliveryPanel delivery={selected} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}
    </div>
  )
}
