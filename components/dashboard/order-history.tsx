"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getCustomerOrders } from "@/app/actions/orders"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PackageIcon,
  EyeIcon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  Clock01Icon,
  DeliveryTruck01Icon,
} from "@hugeicons/core-free-icons"

interface Order {
  id: string
  order_number: string
  status: string
  payment_status: string
  payment_method: string
  total_amount: string
  created_at: string
  shipping_first_name: string
  shipping_last_name: string
  shipping_address_line1: string
  shipping_city: string
  order_items: Array<{
    id: string
    product_name: string
    quantity: number
    unit_price: string
    total_price: string
    product_image_url?: string
  }>
}

interface OrderHistoryProps {
  userId: string
}

export default function OrderHistory({ userId }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const result = await getCustomerOrders(userId)
      if (result.success) {
        setOrders(result.data || [])
      }
    } catch (error) {
      // Error fetching orders
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void fetchOrders()
  }, [fetchOrders])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
      case "processing":
        return (
          <Badge className="bg-gray-100 hover:bg-gray-100 text-gray-700 border border-gray-300 font-semibold text-xs rounded-full">
            <HugeiconsIcon icon={Clock01Icon} size={12} className="mr-1" />
            {status === "confirmed" ? "Confirmed" : "Processing"}
          </Badge>
        )
      case "shipped":
      case "in_transit":
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs rounded-full">
            <HugeiconsIcon icon={DeliveryTruck01Icon} size={12} className="mr-1" />
            {status === "shipped" ? "Shipped" : "In Transit"}
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
        return (
          <Badge className="bg-gray-100 hover:bg-gray-100 text-gray-700 border border-gray-300 font-semibold text-xs rounded-full">
            <HugeiconsIcon icon={Clock01Icon} size={12} className="mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs">
            Paid
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-gray-900 hover:bg-gray-900 text-white border-0 font-semibold text-xs">
            Failed
          </Badge>
        )
      case "refunded":
        return (
          <Badge className="bg-gray-100 hover:bg-gray-100 text-gray-600 border border-gray-200 font-semibold text-xs">
            Refunded
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 hover:bg-gray-100 text-gray-700 border border-gray-300 font-semibold text-xs">
            Pending
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <HugeiconsIcon icon={PackageIcon} size={16} className="text-emerald-600" />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <HugeiconsIcon icon={PackageIcon} size={16} className="text-emerald-600" />
          Order History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {orders.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <HugeiconsIcon icon={PackageIcon} size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">Your order history will appear here once you make a purchase</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-gray-100">
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <TableCell className="font-semibold text-gray-900">{order.order_number}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                  <TableCell className="text-right font-semibold text-gray-900 whitespace-nowrap">
                    KSh {parseFloat(order.total_amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="h-7 px-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs"
                        >
                          <HugeiconsIcon icon={EyeIcon} size={13} className="mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-gray-900">Order Details — {order.order_number}</DialogTitle>
                        </DialogHeader>
                        {selectedOrder && (
                          <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Order Information</h4>
                                <div className="space-y-1.5 text-sm text-gray-600">
                                  <p><span className="font-medium text-gray-900">Number:</span> {selectedOrder.order_number}</p>
                                  <p><span className="font-medium text-gray-900">Date:</span> {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">Status:</span>
                                    {getStatusBadge(selectedOrder.status)}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">Payment:</span>
                                    {getPaymentStatusBadge(selectedOrder.payment_status)}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Shipping Address</h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <p>{selectedOrder.shipping_first_name} {selectedOrder.shipping_last_name}</p>
                                  <p>{selectedOrder.shipping_address_line1}</p>
                                  <p>{selectedOrder.shipping_city}</p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h4>
                              <div className="space-y-2">
                                {selectedOrder.order_items?.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50">
                                    <div className="flex items-center gap-3">
                                      {item.product_image_url && (
                                        <Image
                                          src={item.product_image_url}
                                          alt={item.product_name}
                                          width={40}
                                          height={40}
                                          className="w-10 h-10 object-cover rounded"
                                        />
                                      )}
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                                        <p className="text-xs text-gray-500">
                                          Qty: {item.quantity} × KSh {parseFloat(item.unit_price).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      KSh {parseFloat(item.total_price).toLocaleString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-900">Total Amount</span>
                                <span className="text-xl font-extrabold text-emerald-600">
                                  KSh {parseFloat(selectedOrder.total_amount).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
