"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star, Share2, Truck, Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/lib/cart-context"
import { SiteHeader } from "@/components/site-header"
import { ReviewForm } from "./review-form"
import { ReviewsList } from "./reviews-list"

interface ProductDetailProps {
  product: any
  relatedProducts: any[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0)

  const images = product.product_images || []
  const primaryImage = images.find((img: any) => img.is_primary) || images[0]

  const addToCartHandler = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.product_images?.[0]?.image_url,
      quantity,
      stock: product.inventory_quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.short_description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Product link copied to clipboard!")
    }
  }

  return (
    <div className="space-y-8">
      <SiteHeader />
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/products" className="hover:text-green-600 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Products
        </Link>
        <span>/</span>
        <span>{product.product_categories?.name || "Uncategorized"}</span>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={
                images[selectedImage]?.image_url || primaryImage?.image_url || "/placeholder.svg?height=600&width=600"
              }
              alt={images[selectedImage]?.alt_text || product.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((image: any, index: number) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? "border-green-500" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image.image_url || "/placeholder.svg"}
                    alt={image.alt_text || `${product.name} - Image ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Category */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary">{product.product_categories?.name || "Uncategorized"}</Badge>
              <Button variant="ghost" size="sm" onClick={shareProduct}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-2">by {product.vendor_name}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-gray-300" />
              ))}
            </div>
            <span className="text-sm text-gray-600">(No reviews yet)</span>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">Ksh{product.price.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
              {product.compare_price && product.compare_price > product.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">Ksh{product.compare_price.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                  <Badge className="bg-red-500">
                    {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>
            {product.short_description && <p className="text-gray-600">{product.short_description}</p>}
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            {product.inventory_quantity > 0 ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">In Stock ({product.inventory_quantity} available)</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-600 font-medium">Out of Stock</span>
              </>
            )}
          </div>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="font-medium">Quantity:</label>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.inventory_quantity, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                  disabled={quantity >= product.inventory_quantity}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={addToCartHandler}
                disabled={product.inventory_quantity === 0}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {added ? "Added!" : "Add to Cart"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsFavorite(!isFavorite)}
                className={isFavorite ? "text-red-500 border-red-500" : ""}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-green-600" />
              <span className="text-sm">Free Shipping</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm">Warranty Included</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{product.description || "No description available."}</p>

                {product.warranty_info && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Warranty Information</h4>
                    <p className="text-gray-700">{product.warranty_info}</p>
                  </div>
                )}

                {product.shipping_info && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Shipping Information</h4>
                    <p className="text-gray-700">{product.shipping_info}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <div className="space-y-4">
                {product.specifications ? (
                  Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="font-medium capitalize">{key.replace(/_/g, " ")}</span>
                      <span className="text-gray-700">{String(value)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No specifications available.</p>
                )}

                {/* Basic product specs */}
                <div className="space-y-2 mt-6">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">SKU</span>
                    <span className="text-gray-700">{product.sku || "N/A"}</span>
                  </div>
                  {product.weight && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Weight</span>
                      <span className="text-gray-700">{product.weight} kg</span>
                    </div>
                  )}
                  {(product.dimensions_length || product.dimensions_width || product.dimensions_height) && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Dimensions</span>
                      <span className="text-gray-700">
                        {product.dimensions_length || 0} × {product.dimensions_width || 0} ×{" "}
                        {product.dimensions_height || 0} cm
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                <ReviewForm 
                  productId={product.id} 
                  onReviewSubmitted={() => setReviewsRefreshTrigger(prev => prev + 1)} 
                />
                <ReviewsList 
                  productId={product.id} 
                  refreshTrigger={reviewsRefreshTrigger} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Vendor Information */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Vendor Information</h3>
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold text-xl">{product.vendor_name?.charAt(0) || "V"}</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{product.vendor_name}</h4>
              <p className="text-gray-600 text-sm mt-1">Verified Renewable Energy Vendor</p>
              <div className="flex items-center space-x-4 mt-3">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/products">View All Products</Link>
                </Button>
                <Button variant="outline" size="sm">
                  Contact Customer Support
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <Link href={`/products/${relatedProduct.id}`}>
                    <div className="aspect-square relative overflow-hidden rounded-t-lg">
                      <Image
                        src={
                          relatedProduct.product_images?.find(img => img.is_primary)?.image_url ||
                          relatedProduct.product_images?.[0]?.image_url ||
                          relatedProduct.image ||
                          "/placeholder.svg?height=200&width=200"
                        }
                        alt={
                          relatedProduct.product_images?.find(img => img.is_primary)?.alt_text ||
                          relatedProduct.product_images?.[0]?.alt_text ||
                          relatedProduct.name
                        }
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 line-clamp-2 mb-2">{relatedProduct.name}</h4>
                      <p className="text-lg font-bold text-gray-900">${relatedProduct.price}</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
