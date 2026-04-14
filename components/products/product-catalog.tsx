"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, ArrowRight, Check } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useCart } from "@/lib/cart-context"
import { toast } from "@/hooks/use-toast"

interface ProductImage {
  id: string
  image_url: string
  alt_text?: string
  is_primary: boolean
  sort_order: number
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  product_images?: ProductImage[]
  images?: string[]
  category: string
  vendor_name: string
  inventory_quantity?: number
  stock_quantity?: number
  created_at: string
}

interface ProductCatalogProps {
  products: Product[]
  currentPage: number
  totalPages: number
}

export function ProductCatalog({ products = [], currentPage = 1, totalPages = 1 }: ProductCatalogProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const { addToCart } = useCart()
  const [addedId, setAddedId] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const pageHref = (p: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "")
    params.set("page", String(p))
    return `/products?${params.toString()}`
  }

  const toggleFavorite = (productId: string) => {
    const next = new Set(favorites)
    if (next.has(productId)) next.delete(productId)
    else next.add(productId)
    setFavorites(next)
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(price)

  const truncateWords = (text: string, maxWords: number) => {
    const words = text.trim().split(/\s+/)
    if (words.length <= maxWords) return text
    return `${words.slice(0, maxWords).join(" ")}…`
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center mb-6">
          <ShoppingCart className="w-5 h-5 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 tracking-tight mb-2">No products found</h3>
        <p className="text-[14px] text-gray-400 mb-8 max-w-xs leading-relaxed">
          We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
        </p>
        <Button asChild className="bg-[#0b1a10] hover:bg-emerald-800 text-white rounded-full px-8">
          <Link href="/products">
            View all products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.3em]">
          {products.length} product{products.length !== 1 ? "s" : ""}
        </p>
        <p className="text-[11px] text-gray-300 tracking-wide">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
        {products.map((product) => {
          const productHref = product.id ? `/products/${encodeURIComponent(String(product.id))}` : ""
          const primaryImage =
            product.product_images?.find((img) => img.is_primary)?.image_url ||
            product.product_images?.[0]?.image_url ||
            product.images?.[0] ||
            "/placeholder.svg?height=400&width=400"
          const imageAlt =
            product.product_images?.find((img) => img.is_primary)?.alt_text ||
            product.product_images?.[0]?.alt_text ||
            product.name
          const outOfStock = product.inventory_quantity === 0
          const lowStock =
            product.inventory_quantity !== undefined &&
            product.inventory_quantity > 0 &&
            product.inventory_quantity <= 5

          return (
            <div
              key={product.id}
              className="group border border-gray-100 hover:border-emerald-200 rounded-lg overflow-hidden bg-white transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col cursor-pointer"
              onClick={() => { if (productHref) router.push(productHref) }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  if (productHref) router.push(productHref)
                }
              }}
              role="link"
              tabIndex={0}
              aria-label={`Open ${product.name}`}
            >
              {/* Image */}
              <div className="relative aspect-[3/2] overflow-hidden bg-gray-50">
                <Image
                  src={primaryImage}
                  alt={imageAlt}
                  fill
                  className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                />

                {/* Favourite */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id) }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm border border-black/5 flex items-center justify-center hover:bg-white transition-colors"
                  aria-label={favorites.has(product.id) ? "Remove from favourites" : "Add to favourites"}
                >
                  <Heart
                    className={`h-3 w-3 ${favorites.has(product.id) ? "fill-rose-500 text-rose-500" : "text-gray-400"}`}
                  />
                </button>

                {/* Stock badge */}
                {outOfStock && (
                  <span className="absolute top-2 left-2 text-[10px] font-medium text-gray-600 bg-white/90 border border-black/5 rounded-full px-2 py-0.5">
                    Out of stock
                  </span>
                )}
                {lowStock && (
                  <span className="absolute top-2 left-2 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
                    Low stock
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-[13px] font-medium text-gray-900 leading-snug line-clamp-1 flex-1">
                    {product.name}
                  </h3>
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-1 mb-2">
                  {truncateWords(product.description || "", 10)}
                </p>

                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5 uppercase tracking-wide">
                    {product.category}
                  </span>
                  <span className="text-[10px] text-gray-300 truncate">{product.vendor_name}</span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-emerald-700 tabular-nums tracking-tight">
                    {formatPrice(product.price)}
                  </p>

                  <button
                    disabled={outOfStock}
                    className={[
                      "h-7 px-3 rounded-full text-[10px] font-medium transition-all duration-200 inline-flex items-center gap-1 shrink-0",
                      outOfStock
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : addedId === product.id
                          ? "bg-emerald-700 text-white scale-[0.98]"
                          : "bg-[#0b1a10] hover:bg-emerald-800 text-white active:scale-[0.98]",
                    ].join(" ")}
                    onClick={(e) => {
                      e.stopPropagation()
                      addToCart({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        image: primaryImage,
                        quantity: 1,
                        stock: product.inventory_quantity,
                      }, { silent: true })
                      setAddedId(product.id)
                      const t = toast({
                        title: "Added",
                        description: product.name,
                        className: "max-w-[220px] border-gray-200 bg-white/95 shadow-sm",
                      })
                      setTimeout(() => t.dismiss(), 1200)
                      setTimeout(() => setAddedId(null), 1200)
                    }}
                  >
                    {addedId === product.id ? (
                      <Check className="h-3 w-3 animate-in zoom-in-75 duration-200" />
                    ) : (
                      <ShoppingCart className="h-3 w-3" />
                    )}
                    {addedId === product.id ? "Added" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-6 border-t border-gray-100">
          <Pagination>
            <PaginationContent className="gap-1">
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    href={pageHref(currentPage - 1)}
                    className="text-xs rounded-lg border-gray-200"
                  />
                </PaginationItem>
              )}

              {(() => {
                // Show up to 3 page numbers centred around current page
                let start = Math.max(1, currentPage - 1)
                const end = Math.min(totalPages, start + 2)
                start = Math.max(1, end - 2)

                const pages = []
                if (start > 1) {
                  pages.push(
                    <PaginationItem key={1} className="hidden sm:block">
                      <PaginationLink href={pageHref(1)} className="text-xs rounded-lg border-gray-200">1</PaginationLink>
                    </PaginationItem>
                  )
                  if (start > 2) pages.push(<PaginationItem key="start-ellipsis" className="hidden sm:block"><PaginationEllipsis /></PaginationItem>)
                }

                for (let p = start; p <= end; p++) {
                  pages.push(
                    <PaginationItem key={p} className="hidden sm:block">
                      <PaginationLink
                        href={pageHref(p)}
                        isActive={p === currentPage}
                        className="text-xs rounded-lg border-gray-200"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }

                if (end < totalPages) {
                  if (end < totalPages - 1) pages.push(<PaginationItem key="end-ellipsis" className="hidden sm:block"><PaginationEllipsis /></PaginationItem>)
                  pages.push(
                    <PaginationItem key={totalPages} className="hidden sm:block">
                      <PaginationLink href={pageHref(totalPages)} className="text-xs rounded-lg border-gray-200">{totalPages}</PaginationLink>
                    </PaginationItem>
                  )
                }

                return pages
              })()}

              <PaginationItem className="sm:hidden">
                <span className="px-3 py-1.5 text-xs text-gray-400">
                  {currentPage} / {totalPages}
                </span>
              </PaginationItem>

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    href={pageHref(currentPage + 1)}
                    className="text-xs rounded-lg border-gray-200"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
