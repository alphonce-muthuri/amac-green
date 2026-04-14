"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, ShoppingCart, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"

interface ProductImage {
  id: string
  image_url: string
  alt_text?: string
  is_primary?: boolean
}

interface ProductDetailProps {
  product: any
  relatedProducts: any[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const images: ProductImage[] = useMemo(() => {
    if (!product?.product_images?.length) {
      return [{ id: "placeholder", image_url: "/placeholder.svg?height=900&width=900", alt_text: product?.name }]
    }
    return product.product_images
  }, [product])

  const [selectedImage, setSelectedImage] = useState(
    Math.max(
      0,
      images.findIndex((img) => img.is_primary),
    ),
  )
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addToCart } = useCart()
  const { user } = useAuth()

  const inStock = (product.inventory_quantity ?? 0) > 0

  const addToCartHandler = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[selectedImage]?.image_url || images[0]?.image_url,
      quantity,
      stock: product.inventory_quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="space-y-10">
      <Link href="/products" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800">
        <ChevronLeft className="h-4 w-4" />
        Shop everything
      </Link>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-3">
          <div className="relative w-full max-w-[560px] h-[220px] sm:h-[260px] md:h-[300px] lg:h-[320px] bg-neutral-100 rounded-2xl overflow-hidden">
            <Image
              src={images[selectedImage]?.image_url || images[0]?.image_url}
              alt={images[selectedImage]?.alt_text || product.name}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw"
              priority
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 max-w-[360px]">
              {images.slice(0, 4).map((image, index) => (
                <button
                  key={image.id ?? `${image.image_url}-${index}`}
                  className={[
                    "relative h-16 sm:h-20 rounded-xl overflow-hidden bg-neutral-100 border transition-colors",
                    selectedImage === index ? "border-neutral-900" : "border-neutral-200",
                  ].join(" ")}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image src={image.image_url} alt={image.alt_text || product.name} fill className="object-contain" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
              {product.product_categories?.name || "Product"}
            </p>
            <h1 className="text-3xl font-medium text-neutral-900 tracking-tight">{product.name}</h1>
            <p className="text-sm text-neutral-500 mt-2">by {product.vendor_name || "AMAC Green"}</p>
          </div>

          <p className="text-2xl font-medium text-emerald-700">Ksh {Number(product.price || 0).toLocaleString("en-KE")}</p>

          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-900">Why you'll love this</p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {product.short_description || product.description || "A high-quality product built for reliable performance and long-term value."}
            </p>
          </div>

          <div className="pt-1">
            <p className="text-sm text-neutral-500 mb-2">{inStock ? `${product.inventory_quantity} in stock` : "Out of stock"}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="inline-flex items-center rounded-lg bg-neutral-100">
                <button
                  className="h-9 w-9 flex items-center justify-center text-neutral-700 disabled:opacity-40"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-9 text-center text-sm text-neutral-900 tabular-nums">{quantity}</span>
                <button
                  className="h-9 w-9 flex items-center justify-center text-neutral-700 disabled:opacity-40"
                  onClick={() => setQuantity((prev) => Math.min(product.inventory_quantity || prev + 1, prev + 1))}
                  disabled={!inStock || quantity >= (product.inventory_quantity || 1)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <Button
                onClick={addToCartHandler}
                disabled={!inStock}
                className="h-9 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white px-5 text-sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {added ? "Added" : "Add to bag"}
              </Button>

              <Button asChild className="h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 text-sm">
                <Link href={user ? "/checkout" : "/login?redirect=/checkout"}>
                  Proceed to checkout
                </Link>
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 space-y-1.5 text-xs text-neutral-500">
            <p>Free delivery over KES 2,000</p>
            <p>M-Pesa accepted</p>
            <p>Easy returns</p>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-neutral-900">Related products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => {
              const relatedImage =
                relatedProduct.product_images?.find((img: any) => img.is_primary)?.image_url ||
                relatedProduct.product_images?.[0]?.image_url ||
                "/placeholder.svg?height=400&width=400"

              return (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_2px_10px_rgba(0,0,0,0.05)]"
                >
                  <div className="relative aspect-square bg-neutral-100">
                    <Image src={relatedImage} alt={relatedProduct.name} fill className="object-cover group-hover:scale-[1.02] transition-transform" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-neutral-900 line-clamp-1">{relatedProduct.name}</p>
                    <p className="text-sm text-emerald-700 mt-1">Ksh {Number(relatedProduct.price || 0).toLocaleString("en-KE")}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
