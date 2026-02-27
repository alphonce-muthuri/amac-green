"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, MoreHorizontal, Edit, Eye, Package, X, Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { getVendorProducts, deleteProduct } from "@/app/actions/products"
import { supabase } from "@/lib/supabase"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProductViewModal } from "@/components/vendor/product-view-modal"

export default function VendorProducts() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      try {
        const products = await getVendorProducts(user.id)
        setProducts(products || [])
      } catch (error) {
        console.error('Error loading products:', error)
        setProducts([])
      }
    }
    setLoading(false)
  }

  const getStatusBadge = (status: string, inventoryQuantity: number) => {
    if (status === "active" && inventoryQuantity > 0) {
      return <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">Active</Badge>
    } else if (inventoryQuantity === 0) {
      return <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white">Out of Stock</Badge>
    } else {
      return <Badge className="bg-gray-500 text-white">Inactive</Badge>
    }
  }

  const handleDelete = async (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      const result = await deleteProduct(productId, user?.id)
      if (result.success) {
        alert(result.message)
        loadProducts()
      } else {
        alert(result.error)
      }
    }
  }

  const handleView = (product: any) => {
    setSelectedProduct(product)
    setShowViewModal(true)
  }

  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <Package className="absolute inset-0 m-auto h-8 w-8 text-purple-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">Loading Products</p>
          <p className="text-sm text-gray-600 mt-1">Fetching your catalog...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            <Card className="border-2 border-purple-300 shadow-2xl">
              <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-gradient-x"></div>
              
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
              
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Package className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Products</h1>
                      <p className="text-lg text-gray-600">
                        Manage your <span className="font-bold text-purple-700">{products.length}</span> product catalog
                      </p>
                    </div>
                  </div>
                  <Button asChild className="h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg">
                    <Link href="/vendor/products/add">
                      <Plus className="h-5 w-5 mr-2" />
                      Add Product
                      <Sparkles className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-6">
            <Card className="border-2 border-purple-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-600 text-white">Total</Badge>
                </div>
                <p className="text-3xl font-extrabold text-purple-700 mb-1">{products.length}</p>
                <p className="text-sm text-gray-600">Total Products</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-600 text-white">Active</Badge>
                </div>
                <p className="text-3xl font-extrabold text-green-700 mb-1">
                  {products.filter((p: any) => p.status === "active" && p.inventory_quantity > 0).length}
                </p>
                <p className="text-sm text-gray-600">Active Products</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-red-500 to-rose-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <Badge className="bg-red-600 text-white">Alert</Badge>
                </div>
                <p className="text-3xl font-extrabold text-red-700 mb-1">
                  {products.filter((p: any) => p.inventory_quantity === 0).length}
                </p>
                <p className="text-sm text-gray-600">Out of Stock</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="border-2 border-indigo-200">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search products by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-2 border-indigo-300 focus:border-indigo-500 text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Products List */}
          {filteredProducts.length === 0 ? (
            <Card className="border-2 border-gray-300">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchTerm ? "No products found" : "No products yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? "Try adjusting your search terms" 
                    : "Start building your catalog by adding your first product"}
                </p>
                <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Link href="/vendor/products/add">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product: any) => (
                <Card key={product.id} className="border-2 border-indigo-200 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
                  <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          product.product_images?.find((img: any) => img.is_primary)?.image_url ||
                          product.product_images?.[0]?.image_url ||
                          product.image ||
                          "/placeholder.svg"
                        }
                        alt={product.name}
                        className="h-20 w-20 rounded-xl object-cover bg-gray-100 border-2 border-indigo-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 truncate">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.category}</p>
                          </div>
                          {getStatusBadge(product.status, product.inventory_quantity || 0)}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 mt-3">
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                            <p className="text-xs text-gray-600 mb-1">Price</p>
                            <p className="text-lg font-bold text-green-700">KSH {product.price?.toLocaleString()}</p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200">
                            <p className="text-xs text-gray-600 mb-1">Stock</p>
                            <p className="text-lg font-bold text-blue-700">{product.inventory_quantity || 0} units</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleView(product)} className="border-2">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" asChild className="border-2">
                          <Link href={`/vendor/products/edit/${product.id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(product.id, product.name)}
                          className="border-2 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProductViewModal product={selectedProduct} isOpen={showViewModal} onClose={() => setShowViewModal(false)} />

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  )
}