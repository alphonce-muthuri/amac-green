"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { listActivePackages } from "@/app/actions/product-packages"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"
import { Loader2, ShoppingCart } from "lucide-react"

export default function PackagesPage() {
  const [loading, setLoading] = useState(true)
  const [packages, setPackages] = useState<any[]>([])
  const { addToCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    void (async () => {
      const res = await listActivePackages()
      if (res.success && res.data) setPackages(res.data)
      setLoading(false)
    })()
  }, [])

  const addPackageToCart = async (pkg: any) => {
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" })
      return
    }
    const items = pkg.product_package_items || []
    for (const line of items) {
      const p = line.products
      if (!p || p.status !== "active") continue
      const img =
        p.product_images?.find((im: any) => im.is_primary)?.image_url || p.product_images?.[0]?.image_url
      await addToCart({
        productId: p.id,
        name: p.name,
        price: Number(p.price),
        quantity: (line.quantity || 1) as number,
        image: img,
        stock: undefined,
        sku: p.sku,
      })
    }
    toast({ title: "Added to cart", description: `Package “${pkg.name}” lines were added as separate items.` })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50/30">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">System packages</h1>
        <p className="text-gray-600 mt-2 mb-8">
          Ready-to-deploy bundles from suppliers. Cart adds each product line separately for checkout.
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          </div>
        ) : packages.length === 0 ? (
          <p className="text-gray-500">No active packages yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="border-emerald-100">
                <CardHeader>
                  <CardTitle>{pkg.name}</CardTitle>
                  {pkg.description && <CardDescription>{pkg.description}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                  {pkg.coverage_notes && (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{pkg.coverage_notes}</p>
                  )}
                  <ul className="text-sm text-gray-700 space-y-1">
                    {(pkg.product_package_items || []).map((line: any) => (
                      <li key={line.product_id}>
                        {line.products?.name || "Product"} × {line.quantity}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => addPackageToCart(pkg)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add package to cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-sm text-gray-500">
          <Link href="/products" className="text-emerald-700 font-medium hover:underline">
            Browse individual products
          </Link>
        </p>
      </main>
    </div>
  )
}
