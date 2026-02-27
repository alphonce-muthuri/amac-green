"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, ShoppingCart, Trash2, ArrowRight, Package, Sparkles, Shield, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { SiteHeader } from "@/components/site-header"

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, isLoading } = useCart()
  const { user } = useAuth()
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(productId))
    await updateQuantity(productId, newQuantity)
    setUpdatingItems((prev) => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      return newSet
    })
  }

  const handleRemoveItem = async (productId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(productId))
    await removeFromCart(productId)
    setUpdatingItems((prev) => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      return newSet
    })
  }

  const subtotal = getTotalPrice()
  const shipping = subtotal > 5000 ? 0 : 1
  const tax = subtotal * 0.16
  const total = subtotal + shipping + tax

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <SiteHeader />
        <main className="flex-1 py-20">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white rounded-3xl shadow-xl p-12 border-2 border-gray-100">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
              <p className="text-gray-600 mb-8 text-lg">Start adding items to get the best renewable energy products!</p>
              <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-6 text-lg shadow-lg">
                <Link href="/products">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Start Shopping
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SiteHeader />
      
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-4">
              <ShoppingCart className="w-4 h-4" />
              <span>Shopping Cart</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">Your Cart</h1>
            <p className="text-emerald-100 text-lg">
              {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"} ready for checkout
            </p>
          </div>
        </div>
      </div>

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <Card key={item.productId} className="group hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-emerald-200 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                        <Image
                          src={item.image || "/placeholder.svg?height=96&width=96"}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                            <p className="text-2xl font-bold text-emerald-600">
                              KES {item.price.toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.productId)}
                            disabled={updatingItems.has(item.productId)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updatingItems.has(item.productId)}
                              className="h-10 w-10 p-0 rounded-lg border-2"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-16 text-center font-bold text-lg">
                              {updatingItems.has(item.productId) ? "..." : item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= (item.stock ?? 99) || updatingItems.has(item.productId)}
                              className="h-10 w-10 p-0 rounded-lg border-2"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-xl text-gray-900">
                              KES {(item.price * item.quantity).toLocaleString()}
                            </p>
                            {item.stock !== undefined && item.stock <= 10 && (
                              <Badge variant="destructive" className="mt-1">
                                Only {item.stock} left
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="border-2 border-emerald-200 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
                  <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span className="font-semibold">KES {subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Shipping</span>
                        <span className="font-semibold">
                          {shipping === 0 ? (
                            <span className="text-emerald-600">Free</span>
                          ) : (
                            `KES ${shipping.toLocaleString()}`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>VAT (16%)</span>
                        <span className="font-semibold">KES {tax.toLocaleString()}</span>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex justify-between font-bold text-xl text-gray-900">
                        <span>Total</span>
                        <span className="text-emerald-600">KES {total.toLocaleString()}</span>
                      </div>
                    </div>

                    {shipping > 0 && (
                      <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
                        <p className="text-sm text-blue-700 font-medium">
                          💡 Add KES {(5000 - subtotal).toLocaleString()} more for free shipping!
                        </p>
                      </div>
                    )}

                    <div className="space-y-3 pt-4">
                      {user ? (
                        <Button asChild className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 text-lg shadow-lg" size="lg">
                          <Link href="/checkout">
                            Proceed to Checkout
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <Button asChild className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 text-lg shadow-lg" size="lg">
                            <Link href="/login?redirect=/checkout">
                              Sign In to Checkout
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                          </Button>
                          <p className="text-sm text-gray-600 text-center">
                            Or{" "}
                            <Link href="/register" className="text-emerald-600 hover:underline font-semibold">
                              create an account
                            </Link>
                          </p>
                        </div>
                      )}

                      <Button variant="outline" asChild className="w-full border-2 py-6 text-base">
                        <Link href="/products">Continue Shopping</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-200">
                  <CardContent className="p-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">Secure Checkout</p>
                          <p className="text-gray-600">SSL encrypted payment</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">Fast Delivery</p>
                          <p className="text-gray-600">Track your order in real-time</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">30-Day Returns</p>
                          <p className="text-gray-600">Money-back guarantee</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}