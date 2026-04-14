"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getVendorProducts, updateInventoryQuantity } from "@/app/actions/products"
import { cn } from "@/lib/utils"
import { useAnalytics } from "@/hooks/use-analytics"
import {
  Package, Search, Plus, Minus, AlertTriangle,
  TrendingDown, Edit, RefreshCw, DollarSign,
} from "lucide-react"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts"

interface InventoryItem {
  id: string
  name: string
  sku: string
  price: number
  inventory_quantity: number
  low_stock_threshold: number
  status: string
  category: string
  product_images?: Array<{ image_url: string; alt_text: string; is_primary: boolean }>
}

type StockState = "in" | "low" | "out"
const STOCK_META: Record<StockState, { label: string; dot: string; badge: string; ring: string }> = {
  in:  { label: "In Stock",     dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", ring: "ring-emerald-100" },
  low: { label: "Low Stock",    dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200",       ring: "ring-amber-100"   },
  out: { label: "Out of Stock", dot: "bg-red-400",     badge: "bg-red-50 text-red-700 border-red-200",             ring: "ring-red-100"     },
}

function getStockState(qty: number, threshold: number): StockState {
  if (qty === 0) return "out"
  if (qty <= threshold) return "low"
  return "in"
}

function StatTile({
  label, value, sub, icon: Icon, color,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: "gray" | "emerald" | "amber" | "red"
}) {
  const iconBg = { gray: "bg-gray-400", emerald: "bg-emerald-500", amber: "bg-amber-400", red: "bg-red-500" }[color]
  const valueColor = { gray: "text-gray-700", emerald: "text-emerald-700", amber: "text-amber-700", red: "text-red-700" }[color]
  const ring = { gray: "ring-gray-100", emerald: "ring-emerald-100", amber: "ring-amber-100", red: "ring-red-100" }[color]

  return (
    <div className={cn("rounded-2xl bg-white border border-gray-100 p-4 flex items-center gap-3 ring-1", ring)}>
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", iconBg)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p className={cn("text-xl font-bold tabular-nums tracking-tight leading-none mt-0.5", valueColor)}>{value}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  )
}

function StockBadge({ state }: { state: StockState }) {
  const meta = STOCK_META[state]
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", meta.badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  )
}

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "in",  label: "In Stock" },
  { key: "low", label: "Low Stock" },
  { key: "out", label: "Out of Stock" },
]

export default function VendorInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterTab, setFilterTab] = useState("all")
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [adjustType, setAdjustType] = useState<"add" | "subtract">("add")
  const [adjustAmount, setAdjustAmount] = useState("")
  const [adjustReason, setAdjustReason] = useState("")
  const [adjusting, setAdjusting] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const { trackEvent, identifyUser } = useAnalytics()
  const chartRef = useRef<HTMLDivElement>(null)
  const chartTracked = useRef(false)

  const loadInventory = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserId(user.id)
      identifyUser(user.id, { role: "vendor", email: user.email })
      try {
        const products = await getVendorProducts(user.id)
        const items = (products as unknown as InventoryItem[]) || []
        setInventory(items)
        trackEvent("vendor_inventory_viewed", {
          total_items:    items.length,
          in_stock:       items.filter((i) => getStockState(i.inventory_quantity ?? 0, i.low_stock_threshold) === "in").length,
          low_stock:      items.filter((i) => getStockState(i.inventory_quantity ?? 0, i.low_stock_threshold) === "low").length,
          out_of_stock:   items.filter((i) => getStockState(i.inventory_quantity ?? 0, i.low_stock_threshold) === "out").length,
          total_value_kes: items.reduce((s, i) => s + i.price * (i.inventory_quantity ?? 0), 0),
        })
      } catch (e) {
        console.error(e)
        setInventory([])
      }
    }
    setLoading(false)
  }, [trackEvent, identifyUser])

  useEffect(() => { void loadInventory() }, [loadInventory])

  // Derive chart data early so the IntersectionObserver effect below can read it.
  const stats = {
    total: inventory.length,
    inStock:    inventory.filter((i) => getStockState(i.inventory_quantity ?? 0, i.low_stock_threshold) === "in").length,
    lowStock:   inventory.filter((i) => getStockState(i.inventory_quantity ?? 0, i.low_stock_threshold) === "low").length,
    outOfStock: inventory.filter((i) => getStockState(i.inventory_quantity ?? 0, i.low_stock_threshold) === "out").length,
    totalValue: inventory.reduce((s, i) => s + i.price * (i.inventory_quantity ?? 0), 0),
  }

  // Category breakdown for chart
  const catMap: Record<string, number> = {}
  inventory.forEach((i) => {
    const cat = i.category || "Other"
    catMap[cat] = (catMap[cat] || 0) + (i.inventory_quantity ?? 0)
  })
  const catChart = Object.entries(catMap)
    .map(([cat, units]) => ({ cat: cat.length > 10 ? cat.slice(0, 10) + "…" : cat, units }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 6)

  // Fire once when the chart scrolls fully into view.
  useEffect(() => {
    const el = chartRef.current
    if (!el || catChart.length === 0 || chartTracked.current) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          chartTracked.current = true
          trackEvent("vendor_inventory_chart_viewed", {
            categories:  catChart.map((c) => c.cat),
            total_units: catChart.reduce((s, c) => s + c.units, 0),
            bar_count:   catChart.length,
          })
          io.disconnect()
        }
      },
      { threshold: 0.8 },
    )
    io.observe(el)
    return () => io.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catChart.length, trackEvent])

  const filtered = inventory.filter((item) => {
    const state = getStockState(item.inventory_quantity ?? 0, item.low_stock_threshold)
    const matchesTab = filterTab === "all" || state === filterTab
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const openAdjust = (item: InventoryItem, type: "add" | "subtract") => {
    setSelectedItem(item)
    setAdjustType(type)
    setAdjustAmount("")
    setAdjustReason("")
  }

  const handleAdjustment = async () => {
    if (!selectedItem || !adjustAmount || !adjustReason) return
    setAdjusting(true)
    try {
      const current = selectedItem.inventory_quantity ?? 0
      const delta = parseInt(adjustAmount)
      const newQty = adjustType === "add" ? current + delta : current - delta
      if (newQty < 0) { alert("Cannot reduce stock below 0"); setAdjusting(false); return }
      const result = await updateInventoryQuantity(selectedItem.id, newQty, userId)
      if (result.success) {
        await supabase.from("inventory_adjustments").insert({
          product_id: selectedItem.id,
          adjustment_type: adjustType,
          quantity: delta,
          reason: adjustReason,
          adjusted_by: userId,
          adjusted_at: new Date().toISOString(),
        })
        trackEvent("vendor_inventory_stock_adjusted", {
          product_id:   selectedItem.id,
          product_name: selectedItem.name,
          adjustment:   adjustType,
          delta,
          prev_qty:     current,
          new_qty:      newQty,
          category:     selectedItem.category,
        })
        setSelectedItem(null)
        void loadInventory()
      } else {
        alert(result.error || "Failed to update inventory")
      }
    } catch (e) {
      console.error(e)
      alert("An error occurred while updating inventory")
    }
    setAdjusting(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-6">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-4 w-px mx-1" />
          <Skeleton className="h-4 w-20" />
        </header>
        <div className="flex-1 p-5 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 p-4 flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-2.5 w-14" />
                  <Skeleton className="h-5 w-8" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-40 rounded-2xl" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <VendorHeader title="Inventory">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 rounded-xl text-xs"
          onClick={() => {
            trackEvent("vendor_inventory_refreshed")
            void loadInventory()
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </VendorHeader>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">

        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatTile label="Total Items"   value={stats.total}      sub="in catalog"        icon={Package}       color="gray"    />
          <StatTile label="In Stock"      value={stats.inStock}    sub="good levels"        icon={Package}       color="emerald" />
          <StatTile label="Low Stock"     value={stats.lowStock}   sub="below threshold"    icon={AlertTriangle} color="amber"   />
          <StatTile label="Out of Stock"  value={stats.outOfStock} sub="zero units"         icon={TrendingDown}  color="red"     />
          <StatTile
            label="Total Value"
            value={`${(stats.totalValue / 1000).toFixed(0)}K`}
            sub="KES estimated"
            icon={DollarSign}
            color="emerald"
          />
        </div>

        {/* Category bar chart */}
        {catChart.length > 0 && (
          <div ref={chartRef} className="rounded-2xl bg-white border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-700 mb-3">Stock by Category (units)</p>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart
                data={catChart}
                margin={{ top: 0, right: 4, left: -28, bottom: 0 }}
                barSize={18}
                onClick={(data) => {
                  if (!data?.activePayload?.[0]) return
                  const { cat, units } = data.activePayload[0].payload as { cat: string; units: number }
                  trackEvent("vendor_inventory_chart_bar_clicked", {
                    category:    cat,
                    units,
                    rank:        catChart.findIndex((c) => c.cat === cat) + 1,
                    pct_of_total: catChart.reduce((s, c) => s + c.units, 0) > 0
                      ? Math.round((units / catChart.reduce((s, c) => s + c.units, 0)) * 100)
                      : 0,
                  })
                }}
              >
                <XAxis dataKey="cat" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,.1)" }} />
                <Bar dataKey="units" radius={[4, 4, 0, 0]} cursor="pointer">
                  {catChart.map((_, i) => (
                    <Cell key={i} fill={["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"][i % 6]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search by name or SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 rounded-xl border-gray-200 bg-white text-xs"
            />
          </div>
          <div className="flex items-center gap-1">
            {FILTER_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setFilterTab(t.key)
                  if (t.key !== filterTab)
                    trackEvent("vendor_inventory_filter_changed", {
                      filter:        t.key,
                      previous_filter: filterTab,
                      visible_items: filtered.length,
                    })
                }}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap",
                  filterTab === t.key
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory rows */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 flex flex-col items-center justify-center py-16 gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              {inventory.length === 0 ? "No inventory items" : "No items match your search"}
            </p>
            {inventory.length === 0 && (
              <Button asChild size="sm" className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs mt-1">
                <Link href="/vendor/products/add">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Product
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[2.5rem_1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
              <div />
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Product</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 text-right">Stock</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 text-right">Value</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Status</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Actions</p>
            </div>

            {filtered.map((item) => {
              const state = getStockState(item.inventory_quantity ?? 0, item.low_stock_threshold)
              const imgSrc =
                item.product_images?.find((i) => i.is_primary)?.image_url ||
                item.product_images?.[0]?.image_url ||
                "/placeholder.svg"
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[2.5rem_1fr_auto_auto_auto_auto] items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="h-9 w-9 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative shrink-0">
                    <Image src={imgSrc} alt={item.name} fill className="object-cover" />
                  </div>

                  {/* Name/SKU */}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-400">{item.sku} · {item.category}</p>
                  </div>

                  {/* Stock count */}
                  <div className="text-right">
                    <p className={cn(
                      "text-xs font-bold tabular-nums",
                      state === "out" ? "text-red-600" : state === "low" ? "text-amber-600" : "text-gray-800"
                    )}>
                      {item.inventory_quantity ?? 0}
                    </p>
                    <p className="text-[10px] text-gray-400">/ {item.low_stock_threshold} min</p>
                  </div>

                  {/* Value */}
                  <p className="text-xs font-medium text-gray-700 tabular-nums text-right whitespace-nowrap">
                    KES {((item.price ?? 0) * (item.inventory_quantity ?? 0)).toLocaleString()}
                  </p>

                  {/* Status badge */}
                  <StockBadge state={state} />

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openAdjust(item, "add")}
                      className="flex h-6 w-6 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                      title="Add stock"
                    >
                      <Plus className="h-3 w-3 text-emerald-700" />
                    </button>
                    <button
                      onClick={() => openAdjust(item, "subtract")}
                      className="flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                      title="Remove stock"
                    >
                      <Minus className="h-3 w-3 text-gray-600" />
                    </button>
                    <Link
                      href={`/vendor/products/edit/${item.id}`}
                      className="flex h-6 w-6 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                      title="Edit product"
                    >
                      <Edit className="h-3 w-3 text-gray-600" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Adjustment Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => { if (!open) setSelectedItem(null) }}>
        <DialogContent className="rounded-2xl border-gray-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              {adjustType === "add" ? "Add Stock" : "Remove Stock"}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                <p className="text-xs font-semibold text-gray-900">{selectedItem.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Current stock: <span className="font-bold text-gray-700">{selectedItem.inventory_quantity ?? 0} units</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adj-qty" className="text-xs font-medium">Quantity</Label>
                <Input
                  id="adj-qty"
                  type="number"
                  min="1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="Enter quantity"
                  className="h-8 rounded-xl border-gray-200 bg-gray-50 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adj-reason" className="text-xs font-medium">Reason</Label>
                <Textarea
                  id="adj-reason"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received shipment, Damaged items…"
                  rows={3}
                  className="rounded-xl border-gray-200 bg-gray-50 text-xs resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 h-8 rounded-xl border-gray-200 text-xs"
                  onClick={() => setSelectedItem(null)}
                >
                  Cancel
                </Button>
                <Button
                  className={cn(
                    "flex-1 h-8 rounded-xl text-xs",
                    adjustType === "add"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-gray-800 hover:bg-gray-900"
                  )}
                  disabled={adjusting || !adjustAmount || !adjustReason}
                  onClick={() => void handleAdjustment()}
                >
                  {adjusting ? "Updating…" : adjustType === "add" ? "Add Stock" : "Remove Stock"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
