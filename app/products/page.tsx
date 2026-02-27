import { Suspense } from "react"
import { ProductCatalog } from "@/components/products/product-catalog"
import { ProductFilters } from "@/components/products/product-filters"
import { SiteHeader } from "@/components/site-header"
import { getPublicProducts, getProductCategories } from "@/app/actions/products"
import { Zap, Search, Filter, Grid3x3, Sparkles } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Product Catalog | EVEREADY ICEP",
  description: "Browse renewable energy products from verified vendors",
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

      <footer className="bg-gray-900 text-white py-16 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-2.5 rounded-2xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">EVEREADY ICEP</span>
                  <span className="block text-xs text-gray-400">Clean Energy Platform</span>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Kenya's premier renewable energy marketplace connecting suppliers with customers. Making clean energy accessible and affordable.
              </p>
              <div className="flex space-x-4">
                <a href="https://facebook.com" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://instagram.com" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://tiktok.com" className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <span className="sr-only">TikTok</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/products" className="text-gray-400 hover:text-emerald-400 transition-colors">Products</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-emerald-400 transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-emerald-400 transition-colors">Contact</Link></li>
                <li><Link href="/register" className="text-gray-400 hover:text-emerald-400 transition-colors">Register</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">For Suppliers</h4>
              <ul className="space-y-3 mb-6">
                <li><Link href="/register/vendor" className="text-gray-400 hover:text-emerald-400 transition-colors">Become a Supplier</Link></li>
                <li><Link href="/register/professional" className="text-gray-400 hover:text-emerald-400 transition-colors">Professional Services</Link></li>
              </ul>
              
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>+254 700 123 456</li>
                <li>info@evereadyicep.co.ke</li>
                <li>Nairobi, Kenya</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <p className="text-center text-gray-400 text-sm">
              &copy; 2025 EVEREADY ICEP. All rights reserved. Built with 💚 in Kenya.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}