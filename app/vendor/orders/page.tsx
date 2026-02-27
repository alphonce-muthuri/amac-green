"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle, 
  Eye, 
  MoreHorizontal,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Filter
} from "lucide-react"
import { getVendorOrders, updateOrderStatus } from "@/app/actions/orders"
import { supabase } from "@/lib/supabase"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const result = await getVendorOrders(user.id)
      if (result.success) {
        setOrders(result.data || [])
      }
    }
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300", icon: Clock },
      confirmed: { color: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300", icon: CheckCircle },
      processing: { color: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300", icon: Package },
      shipped: { color: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300", icon: Truck },
      delivered: { color: "bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-700", icon: CheckCircle },
      cancelled: { color: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300", icon: AlertCircle },
      refunded: { color: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300", icon: AlertCircle },
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-2`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const result = await updateOrderStatus(orderId, newStatus)
    if (result.success) {
      alert(result.message)
      loadOrders()
    } else {
      alert(result.error)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getOrderTotal = (order) => {
    return order.order_items?.reduce((sum, item) => sum + item.total_price, 0) || 0
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.reduce((sum, o) => sum + getOrderTotal(o), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <ShoppingCart className="absolute inset-0 m-auto h-8 w-8 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">Loading Orders</p>
          <p className="text-sm text-gray-600 mt-1">Fetching your orders...</p>
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
            <Card className="border-2 border-blue-300 shadow-2xl">
              <div className="h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 animate-gradient-x"></div>
              
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <ShoppingCart className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Orders</h1>
                    <p className="text-lg text-gray-600">
                      Manage your <span className="font-bold text-blue-700">{orders.length}</span> product orders
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Dashboard */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-blue-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-600 text-white">Total</Badge>
                </div>
                <p className="text-3xl font-extrabold text-blue-700 mb-1">{stats.total}</p>
                <p className="text-sm text-gray-600">All Orders</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-yellow-500 to-amber-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600 animate-pulse" />
                  </div>
                  <Badge className="bg-yellow-600 text-white">Pending</Badge>
                </div>
                <p className="text-3xl font-extrabold text-yellow-700 mb-1">{stats.pending}</p>
                <p className="text-sm text-gray-600">Awaiting Action</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-600 text-white">Processing</Badge>
                </div>
                <p className="text-3xl font-extrabold text-purple-700 mb-1">{stats.processing}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-600 text-white">Completed</Badge>
                </div>
                <p className="text-3xl font-extrabold text-green-700 mb-1">{stats.completed}</p>
                <p className="text-sm text-gray-600">Delivered</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-2 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search by order number or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-2 border-indigo-300 focus:border-indigo-500"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 h-12 border-2 border-indigo-300">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <Card className="border-2 border-gray-300">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Orders Found</h3>
                <p className="text-gray-600">
                  {statusFilter === "all" 
                    ? "You haven't received any orders yet" 
                    : `No ${statusFilter} orders found`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="border-2 border-blue-200 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Order #{order.order_number}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()} • Customer: {order.customer_email}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(order.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border-2">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {order.status === "pending" && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "confirmed")}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm Order
                              </DropdownMenuItem>
                            )}
                            {order.status === "confirmed" && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "processing")}>
                                <Package className="h-4 w-4 mr-2" />
                                Start Processing
                              </DropdownMenuItem>
                            )}
                            {order.status === "processing" && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "shipped")}>
                                <Truck className="h-4 w-4 mr-2" />
                                Mark as Shipped
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3 mb-4">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                          <img
                            src={item.product_image_url || "/placeholder.svg"}
                            alt={item.product_name}
                            className="h-16 w-16 rounded-lg object-cover border-2 border-blue-300"
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{item.product_name}</h4>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} × ${item.unit_price} = ${item.total_price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="pt-4 border-t-2 border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          {order.order_items?.length || 0} item(s)
                        </div>
                        <div className="text-xl font-extrabold text-green-700">
                          Total: KSH {getOrderTotal(order).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

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