"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select as RadixSelect,
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
import { Loader2, Package, Plus, Trash2 } from "lucide-react"

export default function VendorPackagesPage() {
  const [loading, setLoading] = useState(true)
  const [packages, setPackages] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    const [pRes, prRes] = await Promise.all([listVendorPackages(), listVendorProductsForPicker()])
    if (pRes.success && pRes.data) setPackages(pRes.data)
    if (prRes.success && prRes.data) setProducts(prRes.data)
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const onCreatePackage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const res = await createProductPackage(fd)
    setSubmitting(false)
    if (res.success) {
      toast({ title: "Package created" })
      e.currentTarget.reset()
      void load()
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" })
    }
  }

  const onAddItem = async (packageId: string, productId: string, qty: number) => {
    if (!productId) return
    const res = await addPackageItem(packageId, productId, qty)
    if (res.success) {
      toast({ title: "Item added" })
      void load()
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" })
    }
  }

  const onRemoveItem = async (itemId: string) => {
    const res = await removePackageItem(itemId)
    if (res.success) {
      toast({ title: "Removed" })
      void load()
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="h-7 w-7" />
          System packages
        </h1>
        <p className="text-gray-600 mt-1">
          Bundle existing products into financeable packages. Set status to <strong>active</strong> to show on the public
          packages page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New package</CardTitle>
          <CardDescription>Create a package shell, then add products below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreatePackage} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="e.g. 5kW Solar + Battery" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input id="slug" name="slug" placeholder="auto from name if empty" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue="draft"
                aria-label="Status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="archived">archived</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="coverage_notes">Coverage / service terms</Label>
              <Textarea id="coverage_notes" name="coverage_notes" rows={2} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Create package
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {packages.length === 0 && (
          <p className="text-sm text-gray-500">No packages yet. Create one above.</p>
        )}
        {packages.map((pkg) => (
          <Card key={pkg.id}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{pkg.name}</CardTitle>
              <CardDescription>
                slug: {pkg.slug} · status: {pkg.status}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddLineForm
                packageId={pkg.id}
                products={products}
                onAdd={(pid, q) => onAddItem(pkg.id, pid, q)}
              />
              <ul className="divide-y rounded-md border">
                {(pkg.product_package_items || []).length === 0 && (
                  <li className="p-3 text-sm text-gray-500">No line items yet.</li>
                )}
                {(pkg.product_package_items || []).map((item: any) => (
                  <li key={item.id} className="flex items-center justify-between gap-2 p-3 text-sm">
                    <span>
                      {item.products?.name || item.product_id} × {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AddLineForm({
  packageId,
  products,
  onAdd,
}: {
  packageId: string
  products: any[]
  onAdd: (productId: string, qty: number) => void
}) {
  const [productId, setProductId] = useState("")
  const [qty, setQty] = useState(1)

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        onAdd(productId, qty)
        setProductId("")
        setQty(1)
      }}
    >
      <div className="flex-1 min-w-[200px]">
        <Label className="text-xs">Product</Label>
        <RadixSelect value={productId} onValueChange={setProductId}>
          <SelectTrigger>
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} — KES {Number(p.price).toLocaleString()}
              </SelectItem>
            ))}
          </SelectContent>
        </RadixSelect>
      </div>
      <div className="w-24">
        <Label className="text-xs">Qty</Label>
        <Input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
        />
      </div>
      <Button type="submit" size="sm" variant="secondary" disabled={!productId}>
        Add line
      </Button>
    </form>
  )
}
