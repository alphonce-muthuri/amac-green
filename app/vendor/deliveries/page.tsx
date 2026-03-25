"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, Clock, CheckCircle, Truck, Phone, MapPin, User } from "lucide-react"
import { VendorDeliveryLiveMap } from "@/components/vendor/vendor-delivery-live-map"
import { getVendorDeliveries } from "@/app/actions/vendor-deliveries"

interface VendorDelivery {
  id: string
  order_id: string
  delivery_status: string
  delivery_address_line1: string
  delivery_city: string
  delivery_country: string
  delivery_fee: number
  estimated_delivery_time: string
  actual_delivery_time?: string
  created_at: string
  orders: {
    order_number: string
    customer_email: string
    shipping_first_name: string
    shipping_last_name: string
    order_items: Array<{
      product_name: string
      quantity: number
      total_price: string
      products: {
        name: string
        sku: string
      } | null
    }>
    vendor_total: number
  }
  delivery_applications: {
    first_name: string
    last_name: string
    phone: string
    vehicle_type: string
    vehicle_registration: string
  } | null
}

export default function VendorDeliveriesPage() {
  const [user, setUser] = useState<any>(null)
  const [deliveries, setDeliveries] = useState<VendorDelivery[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadDeliveries = useCallback(async () => {
    try {
      const result = await getVendorDeliveries()
      if (result.success) {
        setDeliveries(result.data || [])
      }
    } catch (error) {
      console.error("Error loading deliveries:", error)
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

      const userRole = user.user_metadata?.role
      if (userRole !== "vendor") {
        router.push("/dashboard")
        return
      }

      setUser(user)
      await loadDeliveries()
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }, [router, loadDeliveries])

  useEffect(() => {
    void checkUser()
  }, [checkUser])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      assigned: { color: "bg-blue-50 text-blue-800 border-blue-300", icon: Clock, label: "Assigned" },
      picked_up: { color: "bg-purple-50 text-purple-800 border-purple-300", icon: Package, label: "Picked Up" },
      in_transit: { color: "bg-amber-50 text-amber-800 border-amber-300", icon: Truck, label: "In Transit" },
      delivered: { color: "bg-emerald-600 hover:bg-emerald-700 text-white border-green-700", icon: CheckCircle, label: "Delivered" },
      failed: { color: "bg-red-50 text-red-800 border-red-300", icon: Clock, label: "Failed" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.assigned
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-teal-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <Truck className="absolute inset-0 m-auto h-8 w-8 text-teal-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">Loading Deliveries</p>
          <p className="text-sm text-gray-600 mt-1">Fetching delivery data...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const stats = {
    total: deliveries.length,
    inTransit: deliveries.filter(d => d.delivery_status === 'in_transit').length,
    delivered: deliveries.filter(d => d.delivery_status === 'delivered').length,
    pending: deliveries.filter(d => ['assigned', 'picked_up'].includes(d.delivery_status)).length
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            <Card className="border border-teal-300 shadow-md overflow-hidden">
              <div className="h-2 bg-blue-500/30" />
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-16 h-16 bg-teal-700 border border-teal-800 rounded-xl flex items-center justify-center shadow-md">
                    <Truck className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Deliveries</h1>
                    <p className="text-lg text-gray-600">Track your product deliveries in real-time</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push("/vendor")}
                  className="border"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats Dashboard */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-teal-200 hover:shadow-sm transition-shadow">
              <div className="h-2 bg-teal-500/30" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center">
                    <Package className="h-5 w-5 text-teal-600" />
                  </div>
                  <Badge className="rounded-full bg-teal-600 text-white">Total</Badge>
                </div>
                <p className="text-xl font-semibold text-teal-700 mb-1">{stats.total}</p>
                <p className="text-sm text-gray-600">All Deliveries</p>
              </CardContent>
            </Card>

            <Card className="border border-blue-200 hover:shadow-sm transition-shadow">
              <div className="h-2 bg-blue-500/30" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <Badge className="rounded-full bg-blue-600 text-white">Pending</Badge>
                </div>
                <p className="text-xl font-semibold text-blue-700 mb-1">{stats.pending}</p>
                <p className="text-sm text-gray-600">Awaiting Pickup</p>
              </CardContent>
            </Card>

            <Card className="border border-amber-200 hover:shadow-sm transition-shadow">
              <div className="h-2 bg-amber-500/30" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center">
                    <Truck className="h-5 w-5 text-amber-600 animate-pulse" />
                  </div>
                  <Badge className="rounded-full bg-amber-600 text-white">Transit</Badge>
                </div>
                <p className="text-xl font-semibold text-amber-700 mb-1">{stats.inTransit}</p>
                <p className="text-sm text-gray-600">On The Way</p>
              </CardContent>
            </Card>

            <Card className="border border-green-200 hover:shadow-sm transition-shadow">
              <div className="h-2 bg-emerald-500/30" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <Badge className="rounded-full bg-green-600 text-white">Complete</Badge>
                </div>
                <p className="text-xl font-semibold text-green-700 mb-1">{stats.delivered}</p>
                <p className="text-sm text-gray-600">Delivered</p>
              </CardContent>
            </Card>
          </div>

          {/* Live Map */}
          <Card className="border border-indigo-200">
            <div className="h-2 bg-indigo-500/30"></div>
            <CardHeader className="bg-white border-b border-indigo-200">
              <CardTitle className="text-xl">Live Tracking Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <VendorDeliveryLiveMap />
            </CardContent>
          </Card>

          {/* Deliveries List */}
          <Card className="border border-purple-200">
            <div className="h-2 bg-purple-500/30" />
            <CardHeader className="bg-white border-b border-purple-200">
              <CardTitle className="flex items-center gap-3">
                <Package className="h-5 w-5" />
                All Deliveries
                <Badge className="rounded-full bg-purple-600 text-white">{deliveries.length} total</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {deliveries.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Deliveries Found</h3>
                  <p className="text-gray-600">
                    Deliveries of your products will appear here once customers place orders
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveries.map((delivery) => (
                    <div key={delivery.id} className="border border-indigo-200 rounded-xl p-6 hover:shadow-sm hover:scale-[1.01] transition-all duration-300 bg-white">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-xl flex items-center gap-3 mb-2">
                            Order #{delivery.orders.order_number}
                            {getStatusBadge(delivery.delivery_status)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Created: {new Date(delivery.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-2xl text-purple-700">
                            KSH {delivery.orders.vendor_total.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">Your Products</p>
                        </div>
                      </div>

                      {/* Customer & Driver Info */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Customer
                          </h4>
                          <p className="text-sm font-semibold">
                            {delivery.orders.shipping_first_name} {delivery.orders.shipping_last_name}
                          </p>
                          <p className="text-sm text-gray-600">{delivery.orders.customer_email}</p>
                          <div className="flex items-center text-sm text-gray-600 mt-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {delivery.delivery_address_line1}, {delivery.delivery_city}
                          </div>
                        </div>
                        
                        {delivery.delivery_applications && (
                          <div className="bg-emerald-50 p-4 rounded-xl border border-green-200">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <Truck className="h-4 w-4" />
                              Delivery Driver
                            </h4>
                            <p className="text-sm font-semibold">
                              {delivery.delivery_applications.first_name} {delivery.delivery_applications.last_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {delivery.delivery_applications.vehicle_type} - {delivery.delivery_applications.vehicle_registration}
                            </p>
                            <Button
                              size="sm"
                              className="mt-3 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => window.open(`tel:${delivery.delivery_applications?.phone}`, '_self')}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              Call Driver
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Products */}
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                        <h4 className="font-bold text-gray-900 mb-3">Your Products in This Delivery</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {delivery.orders.order_items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                              <div>
                                <p className="font-semibold text-sm">{item.product_name}</p>
                                <p className="text-xs text-gray-600">
                                  {item.products?.sku && `SKU: ${item.products.sku} • `}
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <p className="font-bold text-sm">
                                KSH {parseFloat(item.total_price).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estimated Delivery:</span>
                            <span className="font-semibold">{new Date(delivery.estimated_delivery_time).toLocaleString()}</span>
                          </div>
                          {delivery.actual_delivery_time && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Actual Delivery:</span>
                              <span className="text-green-600 font-bold">
                                {new Date(delivery.actual_delivery_time).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
</div>
  )
}


