"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getCustomerOrders } from "@/app/actions/orders"
import { Package, Calendar, CreditCard, Truck, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      confirmed: { color: "bg-blue-100 text-blue-800", label: "Confirmed" },
      processing: { color: "bg-purple-100 text-purple-800", label: "Processing" },
      shipped: { color: "bg-indigo-100 text-indigo-800", label: "Shipped" },
      delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      paid: { color: "bg-green-100 text-green-800", label: "Paid" },
      failed: { color: "bg-red-100 text-red-800", label: "Failed" },
      refunded: { color: "bg-gray-100 text-gray-800", label: "Refunded" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Order History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Order History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No orders found</p>
            <p className="text-sm text-gray-400 mt-2">Your order history will appear here once you make a purchase</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{order.order_number}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">KSh {parseFloat(order.total_amount).toLocaleString()}</p>
                    <div className="flex gap-2 mt-1">
                      {getStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.payment_status)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck className="h-4 w-4 mr-1" />
                    {order.shipping_first_name} {order.shipping_last_name} • {order.shipping_city}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CreditCard className="h-4 w-4 mr-1" />
                    {order.payment_method}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    {order.order_items?.length || 0} item(s)
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Order Details - {order.order_number}</DialogTitle>
                      </DialogHeader>
                      {selectedOrder && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Order Information</h4>
                              <div className="space-y-1 text-sm">
                                <p><strong>Order Number:</strong> {selectedOrder.order_number}</p>
                                <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
                                <p><strong>Payment:</strong> {getPaymentStatusBadge(selectedOrder.payment_status)}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Shipping Address</h4>
                              <div className="space-y-1 text-sm">
                                <p>{selectedOrder.shipping_first_name} {selectedOrder.shipping_last_name}</p>
                                <p>{selectedOrder.shipping_address_line1}</p>
                                <p>{selectedOrder.shipping_city}</p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3">Order Items</h4>
                            <div className="space-y-3">
                              {selectedOrder.order_items?.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                                  <div className="flex items-center">
                                    {item.product_image_url && (
                                      <Image
                                        src={item.product_image_url}
                                        alt={item.product_name}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 object-cover rounded mr-3"
                                      />
                                    )}
                                    <div>
                                      <p className="font-medium">{item.product_name}</p>
                                      <p className="text-sm text-gray-600">
                                        Qty: {item.quantity} × KSh {parseFloat(item.unit_price).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="font-semibold">
                                    KSh {parseFloat(item.total_price).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-semibold">Total Amount:</span>
                              <span className="text-xl font-bold">
                                KSh {parseFloat(selectedOrder.total_amount).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}