"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, Truck, RotateCcw, ShoppingBag, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, isLoading } = useCart()
  const { user } = useAuth()
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(productId))
    await updateQuantity(productId, newQuantity)
    setUpdatingItems((prev) => {
      const next = new Set(prev)
      next.delete(productId)
      return next
    })
  }

  const handleRemoveItem = async (productId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(productId))
    await removeFromCart(productId)
    setUpdatingItems((prev) => {
      const next = new Set(prev)
      next.delete(productId)
      return next
    })
  }

  const subtotal = getTotalPrice()
  const shipping = subtotal > 5000 ? 0 : 500
  const tax = Math.round(subtotal * 0.16)
  const total = subtotal + shipping + tax

  const fmt = (n: number) => `KES ${n.toLocaleString()}`

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <SiteHeader />
        <main className="flex-1 pt-10 pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-10" />
            <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-5">
                    <div className="w-24 h-24 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                      <div className="h-8 bg-gray-200 rounded-lg w-28 animate-pulse mt-4" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  /* ── Empty cart ── */
  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-9 h-9 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">Your cart is empty</h1>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              Browse our renewable energy products and find the right solution for your home or business.
            </p>
            <Button asChild className="bg-emerald-700 hover:bg-emerald-600 text-white rounded-full px-8 h-11 text-sm font-medium shadow-sm">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  /* ── Cart with items ── */
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SiteHeader />

      <main className="flex-1 pt-10 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-gray-600 transition-colors">Products</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-700 font-medium">Cart</span>
          </nav>

          <div className="flex items-baseline justify-between mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Shopping Cart</h1>
            <span className="text-sm text-gray-500">{getTotalItems()} {getTotalItems() === 1 ? "item" : "items"}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px]">

            {/* ── Items ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
              {items.map((item) => {
                const isUpdating = updatingItems.has(item.productId)
                return (
                  <div key={item.productId} className={`p-5 sm:p-6 transition-opacity duration-200 ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}>
                    <div className="flex gap-4">
                      {/* Product image */}
                      <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                          <Image
                            src={item.image || "/placeholder.svg?height=96&width=96"}
                            alt={item.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-3">
                          <Link href={`/products/${item.productId}`} className="group">
                            <h3 className="font-medium text-gray-900 text-sm leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="font-semibold text-gray-900 text-sm tabular-nums flex-shrink-0">
                            {fmt(item.price * item.quantity)}
                          </p>
                        </div>

                        <p className="text-xs text-gray-400 mt-1">{fmt(item.price)} each</p>

                        {item.stock !== undefined && item.stock <= 10 && (
                          <p className="text-xs text-amber-600 mt-1 font-medium">Only {item.stock} left in stock</p>
                        )}

                        {/* Qty controls + remove */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium text-gray-900 tabular-nums select-none">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                disabled={item.quantity >= (item.stock ?? 99)}
                                className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item.productId)}
                              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Continue shopping */}
              <div className="px-6 py-4 bg-gray-50/60">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-700 transition-colors font-medium"
                >
                  ← Continue shopping
                </Link>
              </div>
            </div>

            {/* ── Order Summary ── */}
            <div>
              <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-5">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span className="tabular-nums font-medium text-gray-800">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={`tabular-nums font-medium ${shipping === 0 ? "text-emerald-600" : "text-gray-800"}`}>
                      {shipping === 0 ? "Free" : fmt(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>VAT (16%)</span>
                    <span className="tabular-nums font-medium text-gray-800">{fmt(tax)}</span>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="mt-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
                    <p className="text-xs text-amber-700">
                      Add <span className="font-semibold">{fmt(5000 - subtotal)}</span> more to qualify for free shipping
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900 text-lg tabular-nums">{fmt(total)}</span>
                </div>

                <div className="mt-5">
                  {user ? (
                    <Button
                      asChild
                      className="w-full bg-emerald-700 hover:bg-emerald-600 text-white rounded-full h-12 text-sm font-semibold shadow-sm transition-all"
                      size="lg"
                    >
                      <Link href="/checkout">
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        asChild
                        className="w-full bg-emerald-700 hover:bg-emerald-600 text-white rounded-full h-12 text-sm font-semibold shadow-sm"
                        size="lg"
                      >
                        <Link href="/login?redirect=/checkout">
                          Sign in to Checkout
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        New here?{" "}
                        <Link href="/register" className="text-emerald-700 hover:underline font-medium">
                          Create a free account
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust badges */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3.5">
                <div className="flex items-center gap-3 text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs">SSL encrypted & secure checkout</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs">Real-time delivery tracking across Kenya</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <RotateCcw className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs">30-day hassle-free returns</span>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
