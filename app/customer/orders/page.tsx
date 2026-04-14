"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Package, Clock, CheckCircle, Truck, AlertCircle, Eye, Download } from "lucide-react"
import { getCustomerOrders } from "@/app/actions/orders"
import { supabase } from "@/lib/supabase"

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    const result = await getCustomerOrders()
    if (result.success) {
      setOrders(result.data || [])
    }
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-gray-100 text-gray-700", icon: Clock },
      confirmed: { color: "bg-emerald-600 text-emerald-700", icon: CheckCircle },
      processing: { color: "bg-gray-100 text-gray-700", icon: Package },
      shipped: { color: "bg-green-100 text-green-800", icon: Truck },
      delivered: { color: "bg-green-600 text-white", icon: CheckCircle },
      cancelled: { color: "bg-gray-900 text-gray-700", icon: AlertCircle },
      refunded: { color: "bg-gray-100 text-gray-800", icon: AlertCircle },
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredOrders = orders.filter((order) => order.order_number.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-8">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-2">Track and manage your orders</p>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">You haven't placed any orders yet</p>
                <Button className="mt-4">Start Shopping</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Order #{order.order_number}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Placed on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <p className="text-lg font-semibold text-gray-900 mt-2">${order.total_amount.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4 mb-6">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <Image
                            src={item.product_image_url || "/placeholder.svg"}
                            alt={item.product_name}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                            <p className="text-sm text-gray-600">SKU: {item.product_sku}</p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} × ${item.unit_price.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">${item.total_price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Subtotal:</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                      </div>
                      {order.tax_amount > 0 && (
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Tax:</span>
                          <span>${order.tax_amount.toFixed(2)}</span>
                        </div>
                      )}
                      {order.shipping_amount > 0 && (
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Shipping:</span>
                          <span>${order.shipping_amount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                        <span>Total:</span>
                        <span>${order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Shipping Info */}
                    {order.shipping_address_line1 && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                        <div className="text-sm text-gray-600">
                          <p>
                            {order.shipping_first_name} {order.shipping_last_name}
                          </p>
                          {order.shipping_company && <p>{order.shipping_company}</p>}
                          <p>{order.shipping_address_line1}</p>
                          {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                          <p>
                            {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                          </p>
                          <p>{order.shipping_country}</p>
                        </div>
                      </div>
                    )}

                    {/* Tracking Info */}
                    {order.tracking_number && (
                      <div className="mt-4 p-4 bg-emerald-600 rounded-lg">
                        <h4 className="font-medium text-emerald-700 mb-2">Tracking Information</h4>
                        <p className="text-sm text-emerald-700">
                          Tracking Number: <span className="font-mono">{order.tracking_number}</span>
                        </p>
                        {order.tracking_url && (
                          <Button variant="outline" size="sm" className="mt-2 bg-transparent" asChild>
                            <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                              Track Package
                            </a>
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 mt-6">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
