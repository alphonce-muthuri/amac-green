"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  addPackageItem,
  createProductPackage,
  listVendorPackages,
  listVendorProductsForPicker,
  removePackageItem,
} from "@/app/actions/product-packages"
import { toast } from "@/hooks/use-toast"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  Package, Plus, Trash2, ChevronDown, ChevronUp,
  RefreshCw, Box, Layers, CheckCircle2, FileText,
} from "lucide-react"

/* ─── types ─────────────────────────────────────────────── */
interface PackageItem {
  id: string
  product_id: string
  quantity: number
  products?: { name: string; price: number } | null
}
interface ProductPackage {
  id: string
  name: string
  slug: string
  status: "draft" | "active" | "archived"
  description?: string
  coverage_notes?: string
  product_package_items?: PackageItem[]
}
interface PickerProduct { id: string; name: string; price: number }

/* ─── status meta ────────────────────────────────────────── */
const STATUS_META: Record<string, { badge: string; dot: string }> = {
  active:   { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  draft:    { badge: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-400"   },
  archived: { badge: "bg-gray-100 text-gray-500 border-gray-200",         dot: "bg-gray-400"    },
}

/* ─── small shared components ────────────────────────────── */
function StatTile({
  label, value, icon: Icon, color,
}: { label: string; value: number; icon: React.ElementType; color: "emerald" | "amber" | "gray" | "indigo" }) {
  const iconBg  = { emerald: "bg-emerald-500", amber: "bg-amber-400", gray: "bg-gray-400", indigo: "bg-indigo-500" }[color]
  const valClr  = { emerald: "text-emerald-700", amber: "text-amber-700", gray: "text-gray-700", indigo: "text-indigo-700" }[color]
  const ring    = { emerald: "ring-emerald-100", amber: "ring-amber-100", gray: "ring-gray-100", indigo: "ring-indigo-100" }[color]
  return (
    <div className={cn("rounded-2xl bg-white border border-gray-100 p-4 flex items-center gap-3 ring-1", ring)}>
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", iconBg)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p className={cn("text-xl font-bold tabular-nums tracking-tight leading-none mt-0.5", valClr)}>{value}</p>
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-gray-700">{label}</Label>
        {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

const inputCls = "h-8 rounded-xl border-gray-200 bg-gray-50 text-xs focus-visible:ring-emerald-500"
const textareaCls = "rounded-xl border-gray-200 bg-gray-50 text-xs resize-none focus-visible:ring-emerald-500"

/* ─── inline add-line form ───────────────────────────────── */
function AddLineForm({
  products,
  onAdd,
}: {
  products: PickerProduct[]
  onAdd: (productId: string, qty: number) => Promise<void>
}) {
  const [productId, setProductId] = useState("")
  const [qty, setQty] = useState(1)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId) return
    setSaving(true)
    await onAdd(productId, qty)
    setProductId("")
    setQty(1)
    setSaving(false)
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex items-end gap-2">
      <div className="flex-1 min-w-0">
        <Label className="text-[10px] font-medium text-gray-500 mb-1 block">Product</Label>
        <Select value={productId} onValueChange={setProductId}>
          <SelectTrigger className={cn(inputCls, "w-full")}>
            <SelectValue placeholder="Select a product…" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-xs">
                {p.name} — KES {Number(p.price).toLocaleString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-20 shrink-0">
        <Label className="text-[10px] font-medium text-gray-500 mb-1 block">Qty</Label>
        <Input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
          className={inputCls}
        />
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={!productId || saving}
        className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs shrink-0"
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        Add
      </Button>
    </form>
  )
}

/* ─── package card ───────────────────────────────────────── */
function PackageCard({
  pkg,
  products,
  onAddItem,
  onRemoveItem,
}: {
  pkg: ProductPackage
  products: PickerProduct[]
  onAddItem: (packageId: string, productId: string, qty: number) => Promise<void>
  onRemoveItem: (itemId: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = STATUS_META[pkg.status] ?? STATUS_META.draft
  const itemCount = pkg.product_package_items?.length ?? 0

  const totalValue = (pkg.product_package_items ?? []).reduce(
    (s, item) => s + (item.products?.price ?? 0) * item.quantity, 0
  )

  return (
    <div className={cn("rounded-2xl bg-white border transition-all", expanded ? "border-emerald-200 ring-1 ring-emerald-100" : "border-gray-100")}>
      {/* Card header row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50/60 rounded-2xl transition-colors"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
          <Box className="h-4 w-4 text-emerald-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{pkg.name}</p>
          <p className="text-[10px] text-gray-400">/{pkg.slug}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {totalValue > 0 && (
            <span className="text-xs font-semibold text-gray-700 tabular-nums">
              KES {totalValue.toLocaleString()}
            </span>
          )}
          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", meta.badge)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
            {pkg.status}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
            <Layers className="h-2.5 w-2.5" />
            {itemCount}
          </span>
          {expanded
            ? <ChevronUp className="h-4 w-4 text-gray-400" />
            : <ChevronDown className="h-4 w-4 text-gray-400" />
          }
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
          {/* Description / coverage */}
          {(pkg.description || pkg.coverage_notes) && (
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5 space-y-1">
              {pkg.description && (
                <p className="text-xs text-gray-600">{pkg.description}</p>
              )}
              {pkg.coverage_notes && (
                <p className="text-[10px] text-gray-400 italic">{pkg.coverage_notes}</p>
              )}
            </div>
          )}

          {/* Line items */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 mb-1.5">
              Line Items ({itemCount})
            </p>
            {itemCount === 0 ? (
              <p className="text-xs text-gray-400 py-2 text-center">No items — add one below</p>
            ) : (
              <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {(pkg.product_package_items ?? []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50/60 transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {item.products?.name ?? item.product_id}
                      </p>
                      {item.products?.price != null && (
                        <p className="text-[10px] text-gray-400">
                          KES {item.products.price.toLocaleString()} × {item.quantity}
                          {" = "}
                          <span className="font-semibold text-gray-600">
                            KES {(item.products.price * item.quantity).toLocaleString()}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-gray-700 tabular-nums">×{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => void onRemoveItem(item.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add line form */}
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/40 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 mb-2">Add Product</p>
            <AddLineForm
              products={products}
              onAdd={(pid, q) => onAddItem(pkg.id, pid, q)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── page ───────────────────────────────────────────────── */
export default function VendorPackagesPage() {
  const [loading, setLoading] = useState(true)
  const [packages, setPackages] = useState<ProductPackage[]>([])
  const [products, setProducts] = useState<PickerProduct[]>([])
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    const [pRes, prRes] = await Promise.all([listVendorPackages(), listVendorProductsForPicker()])
    if (pRes.success && pRes.data)   setPackages(pRes.data as ProductPackage[])
    if (prRes.success && prRes.data) setProducts(prRes.data as PickerProduct[])
  }

  useEffect(() => {
    void (async () => { await load(); setLoading(false) })()
  }, [])

  const refresh = async () => { setLoading(true); await load(); setLoading(false) }

  const onCreatePackage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const res = await createProductPackage(fd)
    setSubmitting(false)
    if (res.success) {
      toast({ title: "Package created" })
      ;(e.currentTarget as HTMLFormElement).reset()
      await load()
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" })
    }
  }

  const onAddItem = async (packageId: string, productId: string, qty: number) => {
    const res = await addPackageItem(packageId, productId, qty)
    if (res.success) { toast({ title: "Item added" }); await load() }
    else toast({ title: "Error", description: res.error, variant: "destructive" })
  }

  const onRemoveItem = async (itemId: string) => {
    const res = await removePackageItem(itemId)
    if (res.success) { toast({ title: "Removed" }); await load() }
    else toast({ title: "Error", description: res.error, variant: "destructive" })
  }

  /* stats */
  const stats = {
    total:    packages.length,
    active:   packages.filter((p) => p.status === "active").length,
    draft:    packages.filter((p) => p.status === "draft").length,
    items:    packages.reduce((s, p) => s + (p.product_package_items?.length ?? 0), 0),
  }

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
                <div className="space-y-1.5"><Skeleton className="h-2.5 w-14" /><Skeleton className="h-5 w-8" /></div>
              </div>
            ))}
          </div>
          <div className="grid lg:grid-cols-[1fr_280px] gap-4">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <VendorHeader title="Packages">
        <Image
          src="/images/logo/AMAC-Green-logo.png"
          alt="AMAC Green logo"
          width={140}
          height={30}
          className="h-7 w-auto object-contain"
          priority
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 rounded-xl text-xs"
          onClick={() => void refresh()}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </VendorHeader>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">

        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTile label="Total Packages" value={stats.total}  icon={Package}        color="gray"    />
          <StatTile label="Active"         value={stats.active} icon={CheckCircle2}   color="emerald" />
          <StatTile label="Draft"          value={stats.draft}  icon={FileText}       color="amber"   />
          <StatTile label="Total Items"    value={stats.items}  icon={Layers}         color="indigo"  />
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[1fr_280px] gap-4 items-start">

          {/* Left — package list */}
          <div className="space-y-3">
            {packages.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-100 flex flex-col items-center justify-center py-16 gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">No packages yet</p>
                <p className="text-xs text-gray-400">Create your first bundle using the form →</p>
              </div>
            ) : (
              packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  products={products}
                  onAddItem={onAddItem}
                  onRemoveItem={onRemoveItem}
                />
              ))
            )}
          </div>

          {/* Right — sticky create form */}
          <div className="lg:sticky lg:top-5">
            <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-gray-100">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                  <Plus className="h-3.5 w-3.5 text-emerald-700" />
                </div>
                <p className="text-xs font-semibold text-gray-800">New Package</p>
              </div>

              <form
                onSubmit={(e) => void onCreatePackage(e)}
                className="p-4 space-y-3"
              >
                <Field label="Name" hint="required">
                  <Input
                    name="name"
                    required
                    placeholder="e.g. 5kW Solar + Battery"
                    className={inputCls}
                  />
                </Field>

                <Field label="Slug" hint="auto if empty">
                  <Input
                    name="slug"
                    placeholder="5kw-solar-battery"
                    className={inputCls}
                  />
                </Field>

                <Field label="Status">
                  <select
                    name="status"
                    defaultValue="draft"
                    aria-label="Package status"
                    className="flex h-8 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </Field>

                <Field label="Description">
                  <Textarea
                    name="description"
                    rows={3}
                    placeholder="Bundle description…"
                    className={textareaCls}
                  />
                </Field>

                <Field label="Coverage / Service Terms">
                  <Textarea
                    name="coverage_notes"
                    rows={2}
                    placeholder="Warranty, service area…"
                    className={textareaCls}
                  />
                </Field>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs"
                >
                  {submitting ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Create Package
                    </>
                  )}
                </Button>
              </form>

              {/* hint */}
              <div className="border-t border-gray-100 px-4 py-3">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Set status to <span className="font-medium text-emerald-600">active</span> to show this bundle on the public packages page. Add products by expanding a package card.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
