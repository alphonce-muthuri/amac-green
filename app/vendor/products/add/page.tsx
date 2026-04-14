"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, X, Plus, Minus, Save, Package,
  Tag, DollarSign, Boxes, Truck, Wrench, Image as ImageIcon,
  CheckCircle, AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { createProduct, getProductCategories } from "@/app/actions/products"
import type { ProductCategory } from "@/lib/types/product"
import { ImageUpload } from "@/components/ui/image-upload"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

// ─── section wrapper ──────────────────────────────────────────────────────────
function Section({
  icon: Icon, title, description, children, accent = false,
}: {
  icon: React.ElementType; title: string; description: string
  children: React.ReactNode; accent?: boolean
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
        <div className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg shrink-0",
          accent ? "bg-emerald-50" : "bg-gray-50"
        )}>
          <Icon className={cn("h-3.5 w-3.5", accent ? "text-emerald-600" : "text-gray-400")} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 leading-none">{title}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

// ─── field ────────────────────────────────────────────────────────────────────
function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-gray-700">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </Label>
        {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

// ─── component ────────────────────────────────────────────────────────────────
export default function AddProductPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [message, setMessage]             = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [categories, setCategories]       = useState<ProductCategory[]>([])
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }])
  const [tags, setTags]                   = useState<string[]>([])
  const [tagInput, setTagInput]           = useState("")
  const [trackInventory, setTrackInventory] = useState(true)
  const [formData, setFormData]           = useState({ categoryId: "", status: "draft" })

  // live preview state
  const [preview, setPreview] = useState({ name: "", price: "", category: "", sku: "" })

  useEffect(() => {
    getProductCategories().then(r => { if (r.success) setCategories(r.data || []) })
  }, [])

  const handleSubmit = async (fd: FormData) => {
    setIsSubmitting(true)
    setMessage(null)
    if (!user) {
      setMessage({ type: "error", text: "You must be logged in." })
      setIsSubmitting(false)
      return
    }
    fd.append("userId", user.id)
    fd.append("specifications", JSON.stringify(
      specifications.reduce((acc, s) => { if (s.key && s.value) acc[s.key] = s.value; return acc }, {} as Record<string, string>)
    ))
    fd.append("tags", tags.join(","))
    const result = await createProduct(fd)
    if (result.success) {
      setMessage({ type: "success", text: (result as any).message ?? "Product created." })
      setTimeout(() => router.push("/vendor/products"), 1800)
    } else {
      setMessage({ type: "error", text: result.error ?? "Something went wrong." })
    }
    setIsSubmitting(false)
  }

  const addSpec   = () => setSpecifications(s => [...s, { key: "", value: "" }])
  const removeSpec = (i: number) => setSpecifications(s => s.filter((_, j) => j !== i))
  const updateSpec = (i: number, f: "key" | "value", v: string) =>
    setSpecifications(s => { const n = [...s]; n[i][f] = v; return n })

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) { setTags(prev => [...prev, t]); setTagInput("") }
  }

  const inputCls = "h-8 text-sm rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus-visible:ring-emerald-500 placeholder:text-gray-400"
  const textareaCls = "text-sm rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus-visible:ring-emerald-500 placeholder:text-gray-400 resize-none"

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <VendorHeader title="Add Product">
        <Link
          href="/vendor/products"
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Products
        </Link>
      </VendorHeader>

      <div className="flex-1 p-5 max-w-[1200px] w-full mx-auto">
        <form action={handleSubmit}>
          <div className="grid lg:grid-cols-[1fr_280px] gap-4 items-start">

            {/* ── left: form sections ── */}
            <div className="space-y-4">

              {/* message banner */}
              {message && (
                <div className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium",
                  message.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-700"
                )}>
                  {message.type === "success"
                    ? <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                    : <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />}
                  {message.text}
                </div>
              )}

              {/* Basic Information */}
              <Section icon={Package} title="Basic Information" description="Essential product details" accent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Product Name" required>
                    <Input
                      name="name" required placeholder="e.g., Solar Panel 300W"
                      className={inputCls}
                      onChange={e => setPreview(p => ({ ...p, name: e.target.value }))}
                    />
                  </Field>
                  <Field label="SKU" hint="Optional">
                    <Input
                      name="sku" placeholder="e.g., SP-300W-001"
                      className={inputCls}
                      onChange={e => setPreview(p => ({ ...p, sku: e.target.value }))}
                    />
                  </Field>
                </div>

                <Field label="Short Description" hint="Max 500 chars">
                  <Textarea name="shortDescription" placeholder="Brief product summary…" maxLength={500} rows={2} className={textareaCls} />
                </Field>

                <Field label="Full Description">
                  <Textarea name="description" placeholder="Detailed product description, features and benefits…" rows={4} className={textareaCls} />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Category">
                    <Select name="categoryId" onValueChange={v => {
                      setFormData(f => ({ ...f, categoryId: v }))
                      const cat = categories.find(c => c.id === v)
                      setPreview(p => ({ ...p, category: cat?.name ?? "" }))
                    }}>
                      <SelectTrigger className={cn(inputCls, "w-full")}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="categoryId" value={formData.categoryId} />
                  </Field>

                  <Field label="Status">
                    <Select name="status" defaultValue="draft" onValueChange={v => setFormData(f => ({ ...f, status: v }))}>
                      <SelectTrigger className={cn(inputCls, "w-full")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="status" value={formData.status} />
                  </Field>
                </div>

                {/* Tags */}
                <Field label="Tags" hint="Press Enter to add">
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag() } }}
                      placeholder="Add a tag…"
                      className={cn(inputCls, "flex-1")}
                    />
                    <Button type="button" size="sm" variant="outline" onClick={addTag}
                      className="h-8 px-3 rounded-xl border-gray-200 text-xs">
                      <Tag className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map(t => (
                        <Badge key={t} className="rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-[11px] font-medium hover:bg-gray-100 pr-1">
                          {t}
                          <button type="button" onClick={() => setTags(ts => ts.filter(x => x !== t))} className="ml-1 hover:text-red-500">
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </Field>
              </Section>

              {/* Images */}
              <Section icon={ImageIcon} title="Product Images" description="Upload up to 5 high-quality images">
                <ImageUpload maxImages={5} />
                <p className="text-[11px] text-gray-400 mt-1">The first image will be used as the primary product photo.</p>
              </Section>

              {/* Pricing */}
              <Section icon={DollarSign} title="Pricing" description="Set your selling and cost prices" accent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Selling Price (KES)" required>
                    <Input
                      name="price" type="number" step="0.01" required placeholder="29,999"
                      className={inputCls}
                      onChange={e => setPreview(p => ({ ...p, price: e.target.value }))}
                    />
                  </Field>
                  <Field label="Compare Price (KES)" hint="For strikethrough">
                    <Input name="comparePrice" type="number" step="0.01" placeholder="39,999" className={inputCls} />
                  </Field>
                  <Field label="Cost Price (KES)" hint="Private">
                    <Input name="costPrice" type="number" step="0.01" placeholder="19,999" className={inputCls} />
                  </Field>
                </div>
              </Section>

              {/* Inventory */}
              <Section icon={Boxes} title="Inventory" description="Track stock levels and thresholds">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <Checkbox
                    id="trackInventory"
                    checked={trackInventory}
                    onCheckedChange={v => setTrackInventory(v as boolean)}
                    className="rounded"
                  />
                  <input type="hidden" name="trackInventory" value={trackInventory.toString()} />
                  <span className="text-sm font-medium text-gray-700">Track inventory quantity</span>
                </label>

                {trackInventory && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Current Stock">
                      <Input name="inventoryQuantity" type="number" defaultValue="0" className={inputCls} />
                    </Field>
                    <Field label="Low Stock Alert" hint="Notify when below">
                      <Input name="lowStockThreshold" type="number" defaultValue="5" className={inputCls} />
                    </Field>
                  </div>
                )}
              </Section>

              {/* Shipping */}
              <Section icon={Truck} title="Shipping" description="Weight, dimensions, and delivery notes">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Field label="Weight (kg)">
                    <Input name="weight" type="number" step="0.01" placeholder="25.5" className={inputCls} />
                  </Field>
                  <Field label="Length (cm)">
                    <Input name="dimensionsLength" type="number" step="0.1" placeholder="165" className={inputCls} />
                  </Field>
                  <Field label="Width (cm)">
                    <Input name="dimensionsWidth" type="number" step="0.1" placeholder="99" className={inputCls} />
                  </Field>
                  <Field label="Height (cm)">
                    <Input name="dimensionsHeight" type="number" step="0.1" placeholder="4" className={inputCls} />
                  </Field>
                </div>
                <Field label="Shipping Notes">
                  <Textarea name="shippingInfo" placeholder="Special handling, delivery lead time, restrictions…" rows={2} className={textareaCls} />
                </Field>
              </Section>

              {/* Specifications */}
              <Section icon={Wrench} title="Specifications" description="Technical details and warranty">
                <div className="space-y-2">
                  {specifications.map((spec, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={spec.key}
                        onChange={e => updateSpec(i, "key", e.target.value)}
                        placeholder="Spec name"
                        className={cn(inputCls, "flex-1")}
                      />
                      <Input
                        value={spec.value}
                        onChange={e => updateSpec(i, "value", e.target.value)}
                        placeholder="Value"
                        className={cn(inputCls, "flex-1")}
                      />
                      <button
                        type="button"
                        onClick={() => removeSpec(i)}
                        disabled={specifications.length === 1}
                        className="h-8 w-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSpec}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 mt-1 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />Add specification
                  </button>
                </div>

                <div className="pt-2 border-t border-gray-50">
                  <Field label="Warranty Information">
                    <Textarea name="warrantyInfo" placeholder="Warranty duration, terms, and coverage…" rows={2} className={textareaCls} />
                  </Field>
                </div>
              </Section>

            </div>

            {/* ── right: sticky summary ── */}
            <div className="lg:sticky lg:top-4 space-y-3">

              {/* live preview card */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Preview</p>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {preview.name || <span className="text-gray-300 font-normal">Product name…</span>}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {preview.category || "No category"}
                      {preview.sku ? ` · ${preview.sku}` : ""}
                    </p>
                    <p className="text-lg font-bold text-emerald-700 tabular-nums mt-1">
                      {preview.price ? `KES ${Number(preview.price).toLocaleString()}` : <span className="text-gray-300 font-normal text-sm">No price</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 border",
                    formData.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    "bg-gray-50 text-gray-500 border-gray-200"
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", formData.status === "active" ? "bg-emerald-500" : "bg-gray-300")} />
                    {formData.status}
                  </span>
                  {tags.length > 0 && (
                    <span className="text-[10px] text-gray-400">{tags.length} tag{tags.length > 1 ? "s" : ""}</span>
                  )}
                </div>
              </div>

              {/* checklist */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Checklist</p>
                {[
                  { label: "Product name",  done: !!preview.name },
                  { label: "Category set",  done: !!formData.categoryId },
                  { label: "Price set",     done: !!preview.price },
                  { label: "Specs added",   done: specifications.some(s => s.key && s.value) },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={cn(
                      "h-4 w-4 rounded-full flex items-center justify-center shrink-0",
                      done ? "bg-emerald-100" : "bg-gray-100"
                    )}>
                      {done
                        ? <CheckCircle className="h-3 w-3 text-emerald-600" />
                        : <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />}
                    </div>
                    <span className={cn("text-xs", done ? "text-gray-700 font-medium" : "text-gray-400")}>{label}</span>
                  </div>
                ))}
              </div>

              {/* submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm"
              >
                {isSubmitting ? (
                  <><div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin mr-2" />Creating…</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />Create Product</>
                )}
              </Button>

              <Button
                type="button" variant="ghost" asChild
                className="w-full h-8 rounded-xl text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <Link href="/vendor/products">Cancel</Link>
              </Button>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}
