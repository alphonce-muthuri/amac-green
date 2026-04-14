import { notFound } from "next/navigation"
import { getProductById, getPublicProducts } from "@/app/actions/products"
import { ProductDetail } from "@/components/products/product-detail"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

export default async function ProductPage({ params }: { params?: { id?: string } }) {
  const resolvedParams = await Promise.resolve(params)
  const rawId = resolvedParams?.id

  if (!rawId) {
    notFound()
  }

  let product = await getProductById(rawId)

  // Fallback: allow slug-style product URLs (e.g. /products/my-product-name)
  if (!product && typeof rawId === "string") {
    const searchTerm = rawId.replace(/-/g, " ")
    const fallbackResult = await getPublicProducts({ search: searchTerm, limit: 50 })
    if (fallbackResult.success) {
      product = (fallbackResult.data || []).find((p: any) => toSlug(p.name || "") === rawId) || null
    }
  }

  if (!product) {
    notFound()
  }

  const allProductsResult = await getPublicProducts({ limit: 12 })
  const relatedProducts = allProductsResult.success
    ? (allProductsResult.data || []).filter((p: any) => p.id !== rawId).slice(0, 4)
    : []

  return (
    <div className="min-h-screen bg-[#fbfbfd] flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <ProductDetail product={product} relatedProducts={relatedProducts} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
