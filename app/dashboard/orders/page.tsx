"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getCustomerOrders } from "@/app/actions/orders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PackageIcon,
  Clock01Icon,
  DeliveryTruck01Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  EyeIcon,
  Download01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"

interface Order {
  id: string
  order_number: string
  created_at: string
  status: string
  total_amount: number | string
  items: any[]
}

export default function OrdersPage() {
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const loadOrders = useCallback(async (userId: string) => {
    try {
      const result = await getCustomerOrders(userId)
      if (!result.success || !result.data) {
        setOrders([])
        return
      }

      const normalizedOrders: Order[] = result.data.map((order: any) => ({
        id: order.id,
        order_number: order.order_number,
        created_at: order.created_at,
        status: order.status,
        total_amount: order.total_amount,
        items: order.order_items || [],
      }))

      setOrders(normalizedOrders)
    } catch (error) {
      console.error("Error loading orders:", error)
      setOrders([])
    }
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
    try {
      setRefreshing(true)
      await loadOrders(user.id)
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-gray-100 hover:bg-gray-100 text-gray-700 border border-gray-300 font-semibold text-xs rounded-full">
            <HugeiconsIcon icon={Clock01Icon} size={12} className="mr-1" />
            Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-gray-100 hover:bg-gray-100 text-gray-700 border border-gray-300 font-semibold text-xs rounded-full">
            <HugeiconsIcon icon={PackageIcon} size={12} className="mr-1" />
            Processing
          </Badge>
        )
      case "in_transit":
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs rounded-full">
            <HugeiconsIcon icon={DeliveryTruck01Icon} size={12} className="mr-1" />
            In Transit
          </Badge>
        )
      case "delivered":
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs rounded-full">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} className="mr-1" />
            Delivered
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-gray-900 hover:bg-gray-900 text-white border-0 font-semibold text-xs rounded-full">
            <HugeiconsIcon icon={CancelCircleIcon} size={12} className="mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        <Card className="border border-gray-200">
          <CardHeader className="py-3 px-5 border-b border-gray-100">
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tighter text-gray-900">Order History</h1>
          <p className="text-gray-500 text-sm mt-0.5">View and track all your orders</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          <HugeiconsIcon icon={RefreshIcon} size={15} className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Orders", value: orders.length, icon: PackageIcon, accent: true },
          { label: "Pending", value: orders.filter(o => o.status === "pending").length, icon: Clock01Icon, accent: false },
          { label: "In Transit", value: orders.filter(o => o.status === "in_transit").length, icon: DeliveryTruck01Icon, accent: true },
          { label: "Delivered", value: orders.filter(o => o.status === "delivered").length, icon: CheckmarkCircle02Icon, accent: true },
        ].map(({ label, value, icon, accent }) => (
          <Card key={label} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent ? "bg-emerald-50" : "bg-gray-100"}`}>
                  <HugeiconsIcon icon={icon} size={16} className={accent ? "text-emerald-600" : "text-gray-600"} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HugeiconsIcon icon={PackageIcon} size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No orders yet</h3>
            <p className="text-gray-500 text-sm mb-4">Start shopping to see your orders here</p>
            <Button onClick={() => router.push("/products")} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-gray-200">
          <CardHeader className="py-3 px-5 border-b border-gray-100">
            <CardTitle className="text-sm font-bold text-gray-900">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <TableCell className="font-semibold text-gray-900 whitespace-nowrap">
                      {order.order_number}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(Number(order.total_amount))}
                    </TableCell>
                    <TableCell className="text-right text-sm text-gray-500">
                      {order.items.length}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs"
                        >
                          <HugeiconsIcon icon={EyeIcon} size={13} className="mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs"
                        >
                          <HugeiconsIcon icon={Download01Icon} size={13} className="mr-1" />
                          <span className="hidden sm:inline">Invoice</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
