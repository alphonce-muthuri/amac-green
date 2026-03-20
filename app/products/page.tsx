import { Suspense } from "react"
import { ProductCatalog } from "@/components/products/product-catalog"
import { ProductFilters } from "@/components/products/product-filters"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getPublicProducts, getProductCategories } from "@/app/actions/products"
import { Zap, Search, Filter, Grid3x3, Sparkles } from "lucide-react"
import Link from "next/link"

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
  const page = Number(searchParams.page) || 1
  const limit = 12

  const [productsResult, categoriesResult] = await Promise.all([
    getPublicProducts({
      category: searchParams.category,
      search: searchParams.search,
      sort: searchParams.sort || "newest",
      page,
      limit,
    }),
    getProductCategories(),
  ])

  const products = productsResult.success ? productsResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data : []
  const totalPages = productsResult.success ? productsResult.totalPages || 1 : 1

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <SiteHeader />

      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 py-16 sm:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium">
              <Grid3x3 className="w-4 h-4" />
              <span>Product Catalog</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Renewable Energy
              <span className="block text-emerald-100">Products</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-emerald-50 max-w-3xl mx-auto leading-relaxed">
              Discover comprehensive renewable energy solutions from verified suppliers. From solar panels to energy storage, find everything for a sustainable future.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
                <Sparkles className="w-4 h-4" />
                <span>1000+ Products</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Verified Suppliers</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Best Prices</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 lg:flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
                  <div className="flex items-center gap-2 text-white">
                    <Filter className="w-5 h-5" />
                    <h2 className="font-bold text-lg">Filter Products</h2>
                  </div>
                </div>
                <div className="p-6">
                  <Suspense fallback={
                    <div className="space-y-4">
                      <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                  }>
                    <ProductFilters categories={categories} />
                  </Suspense>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Need Help?</h3>
                    <p className="text-sm text-gray-600">Our experts are here to assist you</p>
                  </div>
                </div>
                <Link 
                  href="/contact"
                  className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center py-2.5 rounded-lg font-medium transition-colors"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <Suspense fallback={
              <div className="space-y-6">
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-64"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200 animate-pulse">
                      <div className="aspect-square bg-gray-200"></div>
                      <div className="p-5 space-y-3">
                        <div className="h-5 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
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