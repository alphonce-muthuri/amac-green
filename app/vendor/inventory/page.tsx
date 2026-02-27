"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  Search, 
  Plus, 
  Minus, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Edit,
  RefreshCw,
  DollarSign
} from "lucide-react"
import Link from "next/link"
import { getVendorProducts, updateInventoryQuantity } from "@/app/actions/products"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface InventoryItem {
  id: string
  name: string
  sku: string
  price: number
  inventory_quantity: number
  low_stock_threshold: number
  status: string
  category: string
  product_images?: Array<{
    image_url: string
    alt_text: string
    is_primary: boolean
  }>
}

export default function VendorInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [adjustmentDialog, setAdjustmentDialog] = useState(false)
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add")
  const [adjustmentAmount, setAdjustmentAmount] = useState("")
  const [adjustmentReason, setAdjustmentReason] = useState("")
  const [adjusting, setAdjusting] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      try {
        const products = await getVendorProducts(user.id)
        setInventory(products || [])
      } catch (error) {
        console.error('Error loading inventory:', error)
        setInventory([])
      }
    }
    setLoading(false)
  }

  const getStockStatus = (inventory_quantity: number, threshold: number) => {
    if (inventory_quantity === 0) {
      return { 
        badge: <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white border-2 border-red-700">Out of Stock</Badge>, 
        color: "text-red-600" 
      }
    } else if (inventory_quantity <= threshold) {
      return { 
        badge: <Badge className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-2 border-orange-300">Low Stock</Badge>, 
        color: "text-orange-600" 
      }
    } else {
      return { 
        badge: <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-2 border-green-700">In Stock</Badge>, 
        color: "text-green-600" 
      }
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "low" && item.inventory_quantity <= item.low_stock_threshold) ||
                         (filterStatus === "out" && item.inventory_quantity === 0) ||
                         (filterStatus === "in" && item.inventory_quantity > item.low_stock_threshold)
    return matchesSearch && matchesStatus
  })

  const handleAdjustment = async () => {
    if (!selectedItem || !adjustmentAmount || !adjustmentReason) return

    setAdjusting(true)
    try {
      const currentStock = selectedItem.inventory_quantity || 0
      const adjustment = parseInt(adjustmentAmount)
      const newStock = adjustmentType === "add" ? currentStock + adjustment : currentStock - adjustment

      if (newStock < 0) {
        alert("Cannot reduce stock below 0")
        setAdjusting(false)
        return
      }

      const result = await updateInventoryQuantity(selectedItem.id, newStock, user?.id)
      
      if (result.success) {
        await logInventoryAdjustment(selectedItem.id, adjustmentType, adjustment, adjustmentReason, user?.id)
        alert("Inventory updated successfully!")
        setAdjustmentDialog(false)
        setAdjustmentAmount("")
        setAdjustmentReason("")
        setSelectedItem(null)
        loadInventory()
      } else {
        alert(result.error || "Failed to update inventory")
      }
    } catch (error) {
      console.error("Error adjusting inventory:", error)
      alert("An error occurred while updating inventory")
    }
    setAdjusting(false)
  }

  const logInventoryAdjustment = async (
    productId: string, 
    type: string, 
    amount: number, 
    reason: string, 
    userId: string
  ) => {
    try {
      await supabase
        .from("inventory_adjustments")
        .insert({
          product_id: productId,
          adjustment_type: type,
          quantity: amount,
          reason: reason,
          adjusted_by: userId,
          adjusted_at: new Date().toISOString()
        })
    } catch (error) {
      console.error("Error logging inventory adjustment:", error)
    }
  }

  const stats = {
    totalItems: inventory.length,
    inStock: inventory.filter(item => (item.inventory_quantity || 0) > item.low_stock_threshold).length,
    lowStock: inventory.filter(item => (item.inventory_quantity || 0) <= item.low_stock_threshold && (item.inventory_quantity || 0) > 0).length,
    outOfStock: inventory.filter(item => (item.inventory_quantity || 0) === 0).length,
    totalValue: inventory.reduce((sum, item) => sum + (item.price * (item.inventory_quantity || 0)), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <Package className="absolute inset-0 m-auto h-8 w-8 text-orange-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">Loading Inventory</p>
          <p className="text-sm text-gray-600 mt-1">Fetching stock levels...</p>
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
            <Card className="border-2 border-orange-300 shadow-2xl">
              <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 animate-gradient-x"></div>
              
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex items-center md:items-start justify-between gap-6 flex-col md:flex-row">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Package className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Inventory</h1>
                      <p className="text-lg text-gray-600">Track and manage your stock levels</p>
                    </div>
                  </div>
                  <Button onClick={loadInventory} variant="outline" className="border-2 h-12">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Dashboard */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="border-2 border-purple-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-600 text-white">Total</Badge>
                </div>
                <p className="text-3xl font-extrabold text-purple-700 mb-1">{stats.totalItems}</p>
                <p className="text-sm text-gray-600">Total Items</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-600 text-white">In Stock</Badge>
                </div>
                <p className="text-3xl font-extrabold text-green-700 mb-1">{stats.inStock}</p>
                <p className="text-sm text-gray-600">Good Levels</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <Badge className="bg-orange-600 text-white">Low</Badge>
                </div>
                <p className="text-3xl font-extrabold text-orange-700 mb-1">{stats.lowStock}</p>
                <p className="text-sm text-gray-600">Below Threshold</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-red-500 to-rose-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                  <Badge className="bg-red-600 text-white animate-pulse">Out</Badge>
                </div>
                <p className="text-3xl font-extrabold text-red-700 mb-1">{stats.outOfStock}</p>
                <p className="text-sm text-gray-600">Zero Stock</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-600 text-white">Value</Badge>
                </div>
                <p className="text-2xl font-extrabold text-blue-700 mb-1">
                  {(stats.totalValue / 1000).toFixed(0)}K
                </p>
                <p className="text-sm text-gray-600">Total Value (KSH)</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="border-2 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search by product name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-2 border-indigo-300 focus:border-indigo-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-12 px-4 border-2 border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="all">All Items</option>
                  <option value="in">In Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Inventory List */}
          {filteredInventory.length === 0 ? (
            <Card className="border-2 border-gray-300">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Inventory Items</h3>
                <p className="text-gray-600 mb-6">
                  {inventory.length === 0 
                    ? "Start by adding products to your catalog" 
                    : "No items match your search"}
                </p>
                {inventory.length === 0 && (
                  <Button asChild className="bg-gradient-to-r from-orange-600 to-amber-600">
                    <Link href="/vendor/products/add">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item.inventory_quantity || 0, item.low_stock_threshold)
                return (
                  <Card key={item.id} className="border-2 border-indigo-200 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
                    <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            item.product_images?.find(img => img.is_primary)?.image_url ||
                            item.product_images?.[0]?.image_url ||
                            "/placeholder.svg"
                          }
                          alt={item.name}
                          className="h-20 w-20 rounded-xl object-cover bg-gray-100 border-2 border-indigo-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 truncate">{item.name}</h3>
                              <p className="text-sm text-gray-600">SKU: {item.sku} • {item.category}</p>
                            </div>
                            {stockStatus.badge}
                          </div>
                          <div className="grid sm:grid-cols-4 gap-3 mt-3">
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                              <p className="text-xs text-gray-600 mb-1">Stock</p>
                              <p className={`text-lg font-bold ${stockStatus.color}`}>
                                {item.inventory_quantity || 0} units
                              </p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200">
                              <p className="text-xs text-gray-600 mb-1">Price</p>
                              <p className="text-lg font-bold text-blue-700">KSH {item.price?.toLocaleString()}</p>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-3 rounded-lg border border-orange-200">
                              <p className="text-xs text-gray-600 mb-1">Threshold</p>
                              <p className="text-lg font-bold text-orange-700">{item.low_stock_threshold}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                              <p className="text-xs text-gray-600 mb-1">Value</p>
                              <p className="text-lg font-bold text-green-700">
                                KSH {((item.price || 0) * (item.inventory_quantity || 0)).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedItem(item)
                              setAdjustmentType("add")
                              setAdjustmentDialog(true)
                            }}
                            className="border-2 border-green-300 hover:bg-green-50"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedItem(item)
                              setAdjustmentType("subtract")
                              setAdjustmentDialog(true)
                            }}
                            className="border-2 border-orange-300 hover:bg-orange-50"
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                          <Button variant="outline" size="sm" asChild className="border-2">
                            <Link href={`/vendor/products/edit/${item.id}`}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Adjustment Dialog */}
      <Dialog open={adjustmentDialog} onOpenChange={setAdjustmentDialog}>
        <DialogContent className="border-2 border-indigo-300">
          <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 absolute top-0 left-0 right-0"></div>
          <DialogHeader className="mt-2">
            <DialogTitle className="text-2xl font-bold">
              {adjustmentType === "add" ? "Add Stock" : "Remove Stock"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem && (
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                <h4 className="font-bold text-lg">{selectedItem.name}</h4>
                <p className="text-sm text-gray-600">Current Stock: <span className="font-bold">{selectedItem.inventory_quantity || 0}</span> units</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-bold">Quantity</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                placeholder="Enter quantity"
                className="border-2 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-bold">Reason</Label>
              <Textarea
                id="reason"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Enter reason (e.g., 'Received shipment', 'Damaged items')"
                rows={3}
                className="border-2"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setAdjustmentDialog(false)}
                className="flex-1 border-2 h-11"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAdjustment}
                disabled={adjusting || !adjustmentAmount || !adjustmentReason}
                className={`flex-1 h-11 ${
                  adjustmentType === "add" 
                    ? "bg-gradient-to-r from-green-600 to-emerald-600" 
                    : "bg-gradient-to-r from-orange-600 to-amber-600"
                }`}
              >
                {adjusting ? "Updating..." : adjustmentType === "add" ? "Add Stock" : "Remove Stock"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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