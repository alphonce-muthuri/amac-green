"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AppShellSkeleton } from "@/components/loaders/page-skeletons"
import { ProfessionalPageShell } from "@/components/professional/professional-page-shell"
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Calculator,
  Download,
  Send
} from "lucide-react"

export default function BulkOrdersPage() {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading products
    setProducts([
      {
        id: 1,
        name: "Solar Panel 300W Monocrystalline",
        sku: "SP-300W-MC",
        regularPrice: 25000,
        professionalPrice: 18750,
        discount: 25,
        stock: 50,
        category: "Solar Panels"
      },
      {
        id: 2,
        name: "Lithium Battery 100Ah 12V",
        sku: "LB-100Ah-12V",
        regularPrice: 45000,
        professionalPrice: 33750,
        discount: 25,
        stock: 30,
        category: "Batteries"
      },
      {
        id: 3,
        name: "Inverter 2kW Pure Sine Wave",
        sku: "INV-2kW-PSW",
        regularPrice: 35000,
        professionalPrice: 26250,
        discount: 25,
        stock: 20,
        category: "Inverters"
      }
    ])
    setLoading(false)
  }, [])

  const addToCart = (product: any) => {
    const existingItem = cartItems.find(item => item.id === product.id)
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }])
    }
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id))
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      ))
    }
  }

  const removeFromCart = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const getTotalSavings = () => {
    return cartItems.reduce((total, item) => {
      const savings = (item.regularPrice - item.professionalPrice) * item.quantity
      return total + savings
    }, 0)
  }

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.professionalPrice * item.quantity)
    }, 0)
  }

  if (loading) {
    return <AppShellSkeleton />
  }

  return (
    <ProfessionalPageShell title="Bulk Orders">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-xl font-bold tracking-tight tracking-tight text-gray-900">Bulk Orders</h1>
          <p className="text-gray-600 mt-2">
            Access professional pricing and place bulk orders for your projects
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Products</CardTitle>
                <CardDescription>Products with professional pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                          <p className="text-sm text-gray-600">Category: {product.category}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 line-through">
                                KSH {product.regularPrice.toLocaleString()}
                              </span>
                              <span className="font-semibold text-green-600">
                                KSH {product.professionalPrice.toLocaleString()}
                              </span>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {product.discount}% OFF
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Stock: {product.stock} units
                          </p>
                        </div>
                        <Button
                          onClick={() => addToCart(product)}
                          size="sm"
                          className="ml-4"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Bulk Order Cart
                </CardTitle>
                <CardDescription>
                  {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Your cart is empty</p>
                    <p className="text-sm">Add products to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="border rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <p className="text-xs text-gray-600">SKU: {item.sku}</p>
                              <p className="text-sm font-semibold text-green-600">
                                KSH {item.professionalPrice.toLocaleString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <span className="text-sm font-semibold">
                              KSH {(item.professionalPrice * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>KSH {getTotalAmount().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Professional Savings:</span>
                        <span>-KSH {getTotalSavings().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>KSH {getTotalAmount().toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full">
                        <Send className="h-4 w-4 mr-2" />
                        Place Bulk Order
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Quote
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProfessionalPageShell>
  )
}
