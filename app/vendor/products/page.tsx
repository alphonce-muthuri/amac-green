"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from "recharts"
import {
  Plus,
  Search,
  Edit,
  Eye,
  Package,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  LayoutGrid,
  List,
} from "lucide-react"
import Link from "next/link"
import { getVendorProducts, deleteProduct } from "@/app/actions/products"
import { supabase } from "@/lib/supabase"
import { ProductViewModal } from "@/components/vendor/product-view-modal"
import { cn } from "@/lib/utils"

// ─── types ────────────────────────────────────────────────────────────────────
type Product = {
  id: string
  name: string
  category: string
  price: number
  inventory_quantity: number
  low_stock_threshold: number
  status: string
  sku: string
  product_images?: { image_url: string; is_primary: boolean }[]
  image?: string
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const chartConfig = {
  stock: { label: "Stock", color: "#10b981" },
  value: { label: "Products", color: "#6366f1" },
}

function getStockState(p: Product): "active" | "low" | "out" | "inactive" {
  if (p.inventory_quantity === 0) return "out"
  if (p.inventory_quantity <= (p.low_stock_threshold ?? 5)) return "low"
  if (p.status !== "active") return "inactive"
  return "active"
}

const STATE_META = {
  active:   { label: "Active",       dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  low:      { label: "Low Stock",    dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  out:      { label: "Out of Stock", dot: "bg-red-400",     badge: "bg-red-50 text-red-600 border-red-200" },
  inactive: { label: "Inactive",     dot: "bg-gray-300",    badge: "bg-gray-100 text-gray-500 border-gray-200" },
}

function StatTile({
  label, value, sub, icon: Icon, color = "gray",
}: {
  label: string; value: string | number; sub: string
  icon: React.ElementType; color?: "gray" | "emerald" | "amber" | "red"
}) {
  const iconCls = { gray: "text-gray-400 bg-gray-50", emerald: "text-emerald-600 bg-emerald-50", amber: "text-amber-500 bg-amber-50", red: "text-red-500 bg-red-50" }[color]
  const valCls  = { gray: "text-gray-900", emerald: "text-emerald-700", amber: "text-amber-600", red: "text-red-600" }[color]
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

// ─── component ────────────────────────────────────────────────────────────────
export default function VendorProducts() {
  const [products, setProducts]           = useState<Product[]>([])
  const [loading, setLoading]             = useState(true)
  const [searchTerm, setSearchTerm]       = useState("")
  const [filterState, setFilterState]     = useState<"all" | "active" | "low" | "out" | "inactive">("all")
  const [view, setView]                   = useState<"list" | "grid">("list")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [user, setUser]                   = useState<any>(null)

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      try { setProducts(((await getVendorProducts(user.id)) || []) as unknown as Product[]) }
      catch { setProducts([]) }
    }
    setLoading(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const res = await deleteProduct(id, user?.id)
    if (res.success) loadProducts()
    else alert(res.error)
  }

  // ── derived data ─────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    total:    products.length,
    active:   products.filter(p => getStockState(p) === "active").length,
    low:      products.filter(p => getStockState(p) === "low").length,
    out:      products.filter(p => getStockState(p) === "out").length,
    inactive: products.filter(p => getStockState(p) === "inactive").length,
  }), [products])

  // category bar chart
  const categoryChart = useMemo(() => {
    const map: Record<string, number> = {}
    products.forEach(p => {
      const cat = p.category || "Other"
      map[cat] = (map[cat] ?? 0) + (p.inventory_quantity || 0)
    })
    return Object.entries(map)
      .map(([cat, stock]) => ({ cat: cat.length > 10 ? cat.slice(0, 10) + "…" : cat, stock }))
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 7)
  }, [products])

  // status donut
  const statusChart = useMemo(() => [
    { name: "Active",       value: counts.active,   color: "#10b981" },
    { name: "Low Stock",    value: counts.low,       color: "#f59e0b" },
    { name: "Out of Stock", value: counts.out,       color: "#f87171" },
    { name: "Inactive",     value: counts.inactive,  color: "#e5e7eb" },
  ].filter(s => s.value > 0), [counts])

  const filtered = useMemo(() =>
    products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchFilter = filterState === "all" || getStockState(p) === filterState
      return matchSearch && matchFilter
    }),
  [products, searchTerm, filterState])

  // ── skeleton ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white/80 backdrop-blur px-6">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-4 w-px mx-1" />
          <Skeleton className="h-4 w-20" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-lg" />
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
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-44 w-full rounded-xl" />
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-36 w-36 rounded-full mx-auto" />
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}</div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3.5 w-20 tabular-nums" />
                <Skeleton className="h-3.5 w-14" />
                <Skeleton className="h-7 w-16 rounded-lg" />
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
      <VendorHeader title="Products">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search products…"
              className="h-7 w-48 pl-7 text-xs rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus-visible:ring-emerald-500 placeholder:text-gray-400"
            />
          </div>
          <Button
            asChild size="sm"
            className="h-7 px-3 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
          >
            <Link href="/vendor/products/add">
              <Plus className="h-3.5 w-3.5 mr-1" />Add Product
            </Link>
          </Button>
        </div>
      </VendorHeader>

      <div className="flex-1 p-5 space-y-4 max-w-[1400px] w-full mx-auto">

        {/* ── KPI tiles ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTile label="Total Products"  value={counts.total}    sub="In catalog"        icon={Package}       color="gray"    />
          <StatTile label="Active"          value={counts.active}   sub="In stock & live"   icon={CheckCircle2}  color="emerald" />
          <StatTile label="Low Stock"       value={counts.low}      sub="Below threshold"   icon={AlertTriangle} color="amber"   />
          <StatTile label="Out of Stock"    value={counts.out}      sub="Needs restocking"  icon={AlertCircle}   color="red"     />
        </div>

        {/* ── charts ── */}
        {products.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-3">

            {/* Inventory by category */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-900">Inventory by Category</p>
                <p className="text-xs text-gray-400">Total units in stock per category</p>
              </div>
              <ChartContainer config={chartConfig} className="h-[160px] w-full">
                <BarChart data={categoryChart} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={14}>
                  <XAxis dataKey="cat" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(v) => [v, "units"]} />} />
                  <Bar dataKey="stock" radius={[4, 4, 0, 0]} fill="#10b981" />
                </BarChart>
              </ChartContainer>
            </div>

            {/* Status donut */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-900">Catalog Health</p>
                <p className="text-xs text-gray-400">{counts.total} products total</p>
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
                      <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                      <span className="text-xs text-gray-500">{s.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 tabular-nums">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── filter tabs + view toggle ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1">
            {(["all", "active", "low", "out", "inactive"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterState(f)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition-colors capitalize",
                  filterState === f
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {f === "all" ? `All (${counts.total})` :
                 f === "active" ? `Active (${counts.active})` :
                 f === "low" ? `Low (${counts.low})` :
                 f === "out" ? `Out (${counts.out})` :
                 `Inactive (${counts.inactive})`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1">
            <button
              onClick={() => setView("list")}
              className={cn("p-1.5 rounded-lg transition-colors", view === "list" ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700")}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={cn("p-1.5 rounded-lg transition-colors", view === "grid" ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── empty state ── */}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white flex flex-col items-center justify-center py-16 text-gray-400">
            <Package className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-sm font-semibold text-gray-600">
              {searchTerm || filterState !== "all" ? "No products match your filters" : "No products yet"}
            </p>
            <p className="text-xs mt-1 mb-4">
              {searchTerm || filterState !== "all" ? "Try adjusting the search or filter" : "Add your first product to get started"}
            </p>
            {!searchTerm && filterState === "all" && (
              <Button asChild size="sm" className="h-7 px-3 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                <Link href="/vendor/products/add"><Plus className="h-3.5 w-3.5 mr-1" />Add Product</Link>
              </Button>
            )}
          </div>
        )}

        {/* ── LIST view ── */}
        {filtered.length > 0 && view === "list" && (
          <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
            {/* table header */}
            <div className="grid grid-cols-[2.5rem_1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
              <div />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Product</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 text-right">Price</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 text-right">Stock</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 text-right">Status</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 text-right">Actions</p>
            </div>

            {filtered.map((product, idx) => {
              const state = getStockState(product)
              const meta  = STATE_META[state]
              const imgSrc = product.product_images?.find(i => i.is_primary)?.image_url
                || product.product_images?.[0]?.image_url
                || product.image
                || "/placeholder.svg"

              return (
                <div
                  key={product.id}
                  className={cn(
                    "grid grid-cols-[2.5rem_1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3 hover:bg-gray-50/60 transition-colors",
                    idx < filtered.length - 1 && "border-b border-gray-50"
                  )}
                >
                  {/* image */}
                  <Image
                    src={imgSrc} alt={product.name}
                    width={40} height={40}
                    className="h-10 w-10 rounded-xl object-cover bg-gray-100 shrink-0"
                  />

                  {/* name + category */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{product.category}{product.sku ? ` · ${product.sku}` : ""}</p>
                  </div>

                  {/* price */}
                  <p className="text-sm font-bold text-gray-900 tabular-nums whitespace-nowrap">
                    KES {product.price?.toLocaleString()}
                  </p>

                  {/* stock */}
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-bold tabular-nums",
                      state === "out" ? "text-red-500" : state === "low" ? "text-amber-500" : "text-gray-900"
                    )}>
                      {product.inventory_quantity ?? 0}
                    </p>
                    <p className="text-[10px] text-gray-400">units</p>
                  </div>

                  {/* status badge */}
                  <Badge className={cn("rounded-full border text-[10px] font-semibold px-2 py-0.5 whitespace-nowrap", meta.badge)}>
                    <span className={cn("inline-block h-1.5 w-1.5 rounded-full mr-1", meta.dot)} />
                    {meta.label}
                  </Badge>

                  {/* actions */}
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      title="View"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <Link
                      href={`/vendor/products/edit/${product.id}`}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── GRID view ── */}
        {filtered.length > 0 && view === "grid" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(product => {
              const state = getStockState(product)
              const meta  = STATE_META[state]
              const imgSrc = product.product_images?.find(i => i.is_primary)?.image_url
                || product.product_images?.[0]?.image_url
                || product.image
                || "/placeholder.svg"

              return (
                <div key={product.id} className="rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-md transition-shadow group">
                  {/* image */}
                  <div className="relative h-40 bg-gray-50">
                    <Image src={imgSrc} alt={product.name} fill className="object-cover" />
                    <div className="absolute top-2 right-2">
                      <Badge className={cn("rounded-full border text-[10px] font-semibold px-2 py-0.5", meta.badge)}>
                        <span className={cn("inline-block h-1.5 w-1.5 rounded-full mr-1", meta.dot)} />
                        {meta.label}
                      </Badge>
                    </div>
                  </div>
                  {/* info */}
                  <div className="p-3 space-y-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{product.category}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900 tabular-nums">KES {product.price?.toLocaleString()}</p>
                      <p className={cn("text-xs font-semibold tabular-nums",
                        state === "out" ? "text-red-500" : state === "low" ? "text-amber-500" : "text-gray-500"
                      )}>
                        {product.inventory_quantity ?? 0} units
                      </p>
                    </div>
                    <div className="flex items-center gap-1 pt-1 border-t border-gray-50">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="flex-1 flex items-center justify-center gap-1 h-7 text-[11px] font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />View
                      </button>
                      <Link
                        href={`/vendor/products/edit/${product.id}`}
                        className="flex-1 flex items-center justify-center gap-1 h-7 text-[11px] font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="flex-1 flex items-center justify-center gap-1 h-7 text-[11px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>

      <ProductViewModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  )
}
