"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Clock, CheckCircle, Truck, XCircle, Eye, Download, RefreshCw } from "lucide-react"

interface Order {
  id: string
  order_number: string
  created_at: string
  status: string
  total_amount: number
  items: any[]
}

export default function OrdersPage() {
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const loadOrders = useCallback(async (_userId: string) => {
    // Mock orders for now - replace with actual data fetch
    const mockOrders: Order[] = [
      {
        id: "1",
        order_number: "ORD-2024-001",
        created_at: new Date().toISOString(),
        status: "delivered",
        total_amount: 15000,
        items: []
      },
      {
        id: "2",
        order_number: "ORD-2024-002",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        status: "in_transit",
        total_amount: 8500,
        items: []
      },
      {
        id: "3",
        order_number: "ORD-2024-003",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        status: "pending",
        total_amount: 22000,
        items: []
      },
    ]
    setOrders(mockOrders)
  }, [])

  const checkUser = useCallback(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        router.push("/login")
        return
      }

      setUser(user)
      await loadOrders(user.id)
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }, [router, loadOrders])

  useEffect(() => {
    void checkUser()
  }, [checkUser])

  const handleRefresh = async () => {
    if (!user) return
    setRefreshing(true)
    await loadOrders(user.id)
    setRefreshing(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-700 border border-emerald-200/60 hover:border-emerald-200/60 font-bold rounded-full">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-700 border border-emerald-200/60 hover:border-emerald-200/60 font-bold rounded-full">
            <Package className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        )
      case "in_transit":
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-700 border border-emerald-200/60 hover:border-emerald-200/60 font-bold rounded-full">
            <Truck className="h-3 w-3 mr-1" />
            In Transit
          </Badge>
        )
      case "delivered":
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-700 border border-emerald-200/60 hover:border-emerald-200/60 font-bold rounded-full">
            <CheckCircle className="h-3 w-3 mr-1" />
            Delivered
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-rose-50 hover:bg-rose-50 text-rose-700 hover:text-rose-700 border border-rose-200/70 hover:border-rose-200/70 font-bold rounded-full">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-gray-900">Order History</h1>
          <p className="text-gray-600 mt-1">View and track all your orders</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-emerald-200/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-200/60 rounded-full flex items-center justify-center">
                <Package className="h-4 w-4 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Total Orders</p>
                <p className="text-xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-emerald-200/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-200/60 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Pending</p>
                <p className="text-xl font-bold text-gray-900">
                  {orders.filter(o => o.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-emerald-200/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-200/60 rounded-full flex items-center justify-center">
                <Truck className="h-4 w-4 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">In Transit</p>
                <p className="text-xl font-bold text-gray-900">
                  {orders.filter(o => o.status === "in_transit").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-emerald-200/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-200/60 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Delivered</p>
                <p className="text-xl font-bold text-gray-900">
                  {orders.filter(o => o.status === "delivered").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="border border-emerald-200/60">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-emerald-50 rounded-full border border-emerald-200/60 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
            <Button 
              onClick={() => router.push("/products")}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="border border-emerald-200/60 transition-all duration-300">
              <CardHeader className="bg-emerald-50/40 border-b border-emerald-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">
                      Order {order.order_number}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Placed on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {new Intl.NumberFormat('en-KE', {
                        style: 'currency',
                        currency: 'KES',
                        minimumFractionDigits: 0,
                      }).format(order.total_amount)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Total amount</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300">
                      <Download className="h-4 w-4 mr-1" />
                      Invoice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}