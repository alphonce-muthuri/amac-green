import { Suspense } from "react"
import { ProductCatalog } from "@/components/products/product-catalog"
import { ProductFilters } from "@/components/products/product-filters"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getPublicProducts, getProductCategories } from "@/app/actions/products"

export const metadata = {
  title: "Product Catalog | AMAC Green",
  description: "Browse clean energy products from verified AMAC Green suppliers.",
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: {
    category?: string
    search?: string
    sort?: string
    page?: string
  }
}) {
  const requestedPage = Number(searchParams.page) || 1
  const limit = 12

  const [productsResult, categoriesResult] = await Promise.all([
    getPublicProducts({
      category: searchParams.category,
      search: searchParams.search,
      sort: searchParams.sort || "newest",
      page: requestedPage,
      limit,
    }),
    getProductCategories(),
  ])

  const products = productsResult.success ? productsResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data : []
  const totalPages = productsResult.success ? productsResult.totalPages || 1 : 1
  const page = productsResult.success ? productsResult.currentPage || requestedPage : requestedPage

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />

      {/* Page header — only on first page */}
      {page === 1 && (
        <section className="relative bg-[#0b1a10] overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-white/10" />

          {/* Ghost watermark */}
          <div className="absolute inset-0 flex items-center justify-end pointer-events-none select-none overflow-hidden">
            <span className="text-[16rem] font-black text-white/[0.025] tracking-tighter leading-none pr-6 whitespace-nowrap">
              Shop
            </span>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-[0.35em] mb-4">
                  Product Catalog
                </p>
                <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight leading-none">
                  Products.
                </h1>
              </div>
              <p className="text-white/40 text-[14px] max-w-xs sm:text-right leading-relaxed">
                Clean energy products from verified suppliers — solar, storage, accessories, and more.
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 h-px bg-white/10" />
        </section>
      )}

      {/* Catalog layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Sidebar */}
          <aside className="lg:w-60 lg:flex-shrink-0">
            <div className="sticky top-24">
              <Suspense fallback={
                <div className="space-y-6">
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-5 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              }>
                <ProductFilters categories={categories} />
              </Suspense>
            </div>
          </aside>

          {/* Main catalog */}
          <main className="flex-1 min-w-0">
            <Suspense fallback={
              <div className="space-y-6">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-40" />
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                      <div className="aspect-[3/2] bg-gray-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-5 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }>
              <ProductCatalog products={products} currentPage={page} totalPages={totalPages} />
            </Suspense>
          </main>

        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
