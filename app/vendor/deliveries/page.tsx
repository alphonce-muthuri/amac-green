"use client"

import { useEffect, useState } from "react"
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

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
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
  }

  const loadDeliveries = async () => {
    try {
      const result = await getVendorDeliveries()
      if (result.success) {
        setDeliveries(result.data || [])
      }
    } catch (error) {
      console.error("Error loading deliveries:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      assigned: { color: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300", icon: Clock, label: "Assigned" },
      picked_up: { color: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300", icon: Package, label: "Picked Up" },
      in_transit: { color: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300", icon: Truck, label: "In Transit" },
      delivered: { color: "bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-700", icon: CheckCircle, label: "Delivered" },
      failed: { color: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300", icon: Clock, label: "Failed" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.assigned
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-2`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-6">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            <Card className="border-2 border-teal-300 shadow-2xl">
              <div className="h-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 animate-gradient-x"></div>
              
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Truck className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Deliveries</h1>
                    <p className="text-lg text-gray-600">Track your product deliveries in real-time</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push("/vendor")}
                  className="border-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats Dashboard */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-teal-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-teal-600" />
                  </div>
                  <Badge className="bg-teal-600 text-white">Total</Badge>
                </div>
                <p className="text-3xl font-extrabold text-teal-700 mb-1">{stats.total}</p>
                <p className="text-sm text-gray-600">All Deliveries</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-600 text-white">Pending</Badge>
                </div>
                <p className="text-3xl font-extrabold text-blue-700 mb-1">{stats.pending}</p>
                <p className="text-sm text-gray-600">Awaiting Pickup</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-amber-500 to-yellow-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl flex items-center justify-center">
                    <Truck className="h-6 w-6 text-amber-600 animate-pulse" />
                  </div>
                  <Badge className="bg-amber-600 text-white">Transit</Badge>
                </div>
                <p className="text-3xl font-extrabold text-amber-700 mb-1">{stats.inTransit}</p>
                <p className="text-sm text-gray-600">On The Way</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:shadow-xl transition-shadow">
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-600 text-white">Complete</Badge>
                </div>
                <p className="text-3xl font-extrabold text-green-700 mb-1">{stats.delivered}</p>
                <p className="text-sm text-gray-600">Delivered</p>
              </CardContent>
            </Card>
          </div>

          {/* Live Map */}
          <Card className="border-2 border-indigo-200">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <CardHeader className="bg-gradient-to-br from-indigo-50 to-purple-50 border-b-2">
              <CardTitle className="text-xl">Live Tracking Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <VendorDeliveryLiveMap />
            </CardContent>
          </Card>

          {/* Deliveries List */}
          <Card className="border-2 border-purple-200">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50 border-b-2">
              <CardTitle className="flex items-center gap-3">
                <Package className="h-5 w-5" />
                All Deliveries
                <Badge className="bg-purple-600 text-white">{deliveries.length} total</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {deliveries.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Deliveries Found</h3>
                  <p className="text-gray-600">
                    Deliveries of your products will appear here once customers place orders
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveries.map((delivery) => (
                    <div key={delivery.id} className="border-2 border-indigo-200 rounded-xl p-6 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 bg-white">
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
                          <p className="font-extrabold text-2xl text-purple-700">
                            KSH {delivery.orders.vendor_total.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">Your Products</p>
                        </div>
                      </div>

                      {/* Customer & Driver Info */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
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
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
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
                              className="mt-3 bg-gradient-to-r from-green-600 to-emerald-600"
                              onClick={() => window.open(`tel:${delivery.delivery_applications?.phone}`, '_self')}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              Call Driver
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Products */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
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
                      <div className="mt-4 pt-4 border-t-2 border-gray-200">
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