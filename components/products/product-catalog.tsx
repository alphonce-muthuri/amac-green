"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Eye, Star } from "lucide-react"
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
  images?: string[] // Keep for backward compatibility
  category: string
  vendor_name: string
  inventory_quantity?: number
  stock_quantity?: number // Keep for backward compatibility
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

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId)
    } else {
      newFavorites.add(productId)
    }
    setFavorites(newFavorites)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(price)
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
          </p>
          <Button asChild>
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          Showing {products.length} product{products.length !== 1 ? "s" : ""}
        </p>
        <div className="text-xs text-gray-500 sm:text-right">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={
                    // Try to get primary image first, then first image, then fallback
                    product.product_images?.find(img => img.is_primary)?.image_url ||
                    product.product_images?.[0]?.image_url ||
                    product.images?.[0] ||
                    "/placeholder.svg?height=300&width=300"
                  }
                  alt={
                    product.product_images?.find(img => img.is_primary)?.alt_text ||
                    product.product_images?.[0]?.alt_text ||
                    product.name
                  }
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-sm"
                    onClick={() => toggleFavorite(product.id)}
                  >
                    <Heart
                      className={`h-4 w-4 ${favorites.has(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                    />
                  </Button>
                </div>
                {product.inventory_quantity !== undefined && product.inventory_quantity <= 5 && (
                  <Badge className="absolute top-2 left-2 text-xs">
                    {product.inventory_quantity === 0 ? "Out of Stock" : "Low Stock"}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm sm:text-base lg:text-lg line-clamp-2 group-hover:text-green-600 transition-colors">
                    {product.name}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">4.5</span>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">by {product.vendor_name}</p>
                  </div>
                  {product.inventory_quantity !== undefined && (
                    <div className="text-right">
                      <p className="text-xs text-gray-600">{product.inventory_quantity} in stock</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-3 sm:p-4 pt-0">
              <div className="flex gap-2 w-full">
                <Button asChild className="flex-1" size="sm">
                  <Link href={`/products/${product.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">View</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={product.inventory_quantity === 0}
                  className="flex-1 sm:flex-none sm:px-3 bg-transparent"
                  onClick={() => {
                    addToCart({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      image: 
                        product.product_images?.find(img => img.is_primary)?.image_url ||
                        product.product_images?.[0]?.image_url ||
                        product.images?.[0],
                      quantity: 1,
                      stock: product.inventory_quantity,
                    })
                    setAddedId(product.id)
                    setTimeout(() => setAddedId(null), 1200)
                  }}
                >
                  <ShoppingCart className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{addedId === product.id ? "Added!" : "Add to Cart"}</span>
                  <span className="sm:hidden">{addedId === product.id ? "✓" : "Add"}</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent className="flex-wrap gap-1">
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious href={`/products?page=${currentPage - 1}`} className="text-sm" />
                </PaginationItem>
              )}

              {/* Show fewer pages on mobile */}
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <PaginationItem key={page} className="hidden sm:block">
                    <PaginationLink href={`/products?page=${page}`} isActive={page === currentPage} className="text-sm">
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              {/* Mobile: Show current page */}
              <PaginationItem className="sm:hidden">
                <span className="px-3 py-2 text-sm">
                  {currentPage} / {totalPages}
                </span>
              </PaginationItem>

              {totalPages > 3 && (
                <PaginationItem className="hidden sm:block">
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext href={`/products?page=${currentPage + 1}`} className="text-sm" />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
