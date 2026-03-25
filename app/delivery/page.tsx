"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  User,
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  MapPin,
  DollarSign,
  Package,
  Phone,
  Navigation,
  RefreshCw,
  Zap,
  TrendingUp,
  Activity,
  Calendar,
  Map,
  Target,
  Award,
  Star,
  Radio,
  Bell
} from "lucide-react"
import { DeliveryLocationTracker } from "@/components/delivery/location-tracker"
import {
  getDeliveryPersonDeliveries,
  updateDeliveryStatus,
  acceptDelivery,
  getDeliveryStats,
} from "@/app/actions/delivery"
import { toast } from "@/hooks/use-toast"

export default function DeliveryDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applicationStatus, setApplicationStatus] = useState<any>(null)
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [deliveryStats, setDeliveryStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalEarnings: 0,
    todayDeliveries: 0,
  })
  const [updatingDelivery, setUpdatingDelivery] = useState<string | null>(null)
  const [lastDeliveryCount, setLastDeliveryCount] = useState(0)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          toast({
            title: "Notifications Enabled",
            description: "You'll receive notifications for new delivery assignments.",
          })
        }
      })
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login")
      } else if (event === "SIGNED_IN" && session) {
        await checkUser()
      }
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- checkUser is intentionally omitted; adding it would re-run auth subscription when delivery polling state updates
  }, [router])

  const checkUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("Auth error:", error)
        router.push("/login")
        return
      }

      if (!user) {
        router.push("/login")
        return
      }

      const userRole = user?.user_metadata?.role
      if (userRole !== "delivery") {
        router.push("/dashboard")
        return
      }

      setUser(user)
      await checkApplicationStatus(user)
      await loadDeliveriesForUser(user.id)
      await loadDeliveryStatsForUser(user.id)

      const deliveryPolling = setInterval(async () => {
        await loadDeliveriesForUser(user.id)
        await loadDeliveryStatsForUser(user.id)
      }, 30000)

      return () => clearInterval(deliveryPolling)
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const checkApplicationStatus = async (user: any) => {
    const { data } = await supabase
      .from("delivery_applications")
      .select("status, created_at, first_name, last_name")
      .eq("user_id", user.id)
      .single()

    setApplicationStatus(data)
  }

  const loadDeliveriesForUser = async (userId: string) => {
    const result = await getDeliveryPersonDeliveries(userId)
    if (result.success) {
      const newDeliveries = result.data || []

      if (lastDeliveryCount > 0 && newDeliveries.length > lastDeliveryCount) {
        const newDeliveryCount = newDeliveries.length - lastDeliveryCount
        toast({
          title: "🚚 New Delivery Assignment!",
          description: `You have ${newDeliveryCount} new delivery${newDeliveryCount > 1 ? 's' : ''} assigned to you.`,
          duration: 5000,
        })

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Delivery Assignment', {
            body: `You have ${newDeliveryCount} new delivery${newDeliveryCount > 1 ? 's' : ''} assigned.`,
            icon: '/favicon.ico'
          })
        }
      }

      setDeliveries(newDeliveries)
      setLastDeliveryCount(newDeliveries.length)
      setLastRefresh(new Date())
    } else {
      console.error("Failed to load deliveries:", result.error)
    }
  }

  const loadDeliveryStatsForUser = async (userId: string) => {
    const result = await getDeliveryStats(userId)
    if (result.success) {
      setDeliveryStats(result.data)
    } else {
      console.error("Failed to load delivery stats:", result.error)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Logout error:", error)
      setLoggingOut(false)
    }
  }

  const handleUpdateDeliveryStatus = async (deliveryId: string, status: string, notes?: string) => {
    setUpdatingDelivery(deliveryId)
    try {
      const result = await updateDeliveryStatus(deliveryId, status, notes, user?.id)
      if (result.success) {
        toast({
          title: "Status Updated",
          description: `Delivery status updated to ${status}`,
        })
        await loadDeliveriesForUser(user?.id)
        await loadDeliveryStatsForUser(user?.id)
      } else {
        toast({
          title: "Update Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update delivery status",
        variant: "destructive",
      })
    } finally {
      setUpdatingDelivery(null)
    }
  }

  const handleAcceptDelivery = async (deliveryId: string) => {
    setUpdatingDelivery(deliveryId)
    try {
      const result = await acceptDelivery(deliveryId, user?.id)
      if (result.success) {
        toast({
          title: "Delivery Accepted",
          description: "You have accepted this delivery",
        })
        await loadDeliveriesForUser(user?.id)
        await loadDeliveryStatsForUser(user?.id)
      } else {
        toast({
          title: "Accept Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Accept Failed",
        description: "Failed to accept delivery",
        variant: "destructive",
      })
    } finally {
      setUpdatingDelivery(null)
    }
  }

  const handleManualRefresh = async () => {
    if (!user?.id) return
    setRefreshing(true)
    try {
      await loadDeliveriesForUser(user.id)
      await loadDeliveryStatsForUser(user.id)
      toast({
        title: "Refreshed",
        description: "Delivery data updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh delivery data.",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        )
      case "approved":
        return (
          <Badge className="rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-medium">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="rounded-full border border-red-200 bg-red-50 text-red-700 text-xs font-medium">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return (
          <Badge className="rounded-full border border-purple-200 bg-purple-50 text-purple-700 text-xs font-medium">
            <Clock className="h-3 w-3 mr-1" />
            Assigned
          </Badge>
        )
      case "picked_up":
        return (
          <Badge className="rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium">
            <Package className="h-3 w-3 mr-1" />
            Picked Up
          </Badge>
        )
      case "in_transit":
        return (
          <Badge className="rounded-full border border-orange-200 bg-orange-50 text-orange-700 text-xs font-medium">
            <Truck className="h-3 w-3 mr-1" />
            In Transit
          </Badge>
        )
      case "delivered":
        return (
          <Badge className="rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-medium">
            <CheckCircle className="h-3 w-3 mr-1" />
            Delivered
          </Badge>
        )
      case "failed":
        return (
          <Badge className="rounded-full border border-red-200 bg-red-50 text-red-700 text-xs font-medium">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="rounded-full border border-gray-200 bg-gray-50 text-gray-700 text-xs font-medium">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <Truck className="absolute inset-0 m-auto h-8 w-8 text-purple-600" />
          </div>
          <p className="text-lg font-semibold text-gray-900">Loading Your Dashboard</p>
          <p className="text-sm text-gray-600 mt-1">Preparing delivery management...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const completionRate = deliveryStats.total > 0 
    ? Math.round((deliveryStats.completed / deliveryStats.total) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-violet-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-700 border border-violet-800 rounded-lg flex items-center justify-center">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-gray-900">
                  Delivery Partner
                </h1>
                <p className="text-xs text-gray-600 tracking-tight">Professional Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleManualRefresh}
                disabled={refreshing}
                size="sm"
                variant="ghost"
                className="hidden sm:flex"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
              <Button 
                onClick={handleLogout}
                disabled={loggingOut}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{loggingOut ? "Logging out..." : "Logout"}</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Hero Section - Driver Profile Card */}
          <div className="pb-6 border-b border-violet-200">
            <Card className="border border-violet-200 shadow-sm overflow-hidden">
              <div className="h-2 bg-violet-500/30" />
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-20 h-20 bg-violet-700 border border-violet-800 rounded-2xl flex items-center justify-center shadow-sm">
                      <span className="text-3xl font-semibold text-white tracking-tight">
                        {applicationStatus?.first_name?.charAt(0) || "D"}
                      </span>
                    </div>
                    {applicationStatus?.status === "approved" && (
                      <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Driver Info */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tighter bg-gradient-to-r from-violet-600 via-purple-700 to-violet-900 bg-clip-text text-transparent">
                        {applicationStatus?.first_name || "Driver"} {applicationStatus?.last_name || ""}
                      </h2>
                      {getStatusBadge(applicationStatus?.status)}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 tracking-tight mb-4">
                      {applicationStatus?.status === "approved" 
                        ? "Active delivery partner. Ready for assignments"
                        : applicationStatus?.status === "pending"
                        ? "Application under review. We'll notify you soon"
                        : "Contact support for assistance"}
                    </p>

                    {/* Quick Stats Row */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                      <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 px-4 py-2 rounded-full">
                        <Star className="h-4 w-4 text-violet-700" />
                        <span className="text-xs sm:text-sm font-semibold text-violet-900 tracking-tight">{completionRate}% Success</span>
                      </div>
                      <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 px-4 py-2 rounded-full">
                        <Award className="h-4 w-4 text-violet-700" />
                        <span className="text-xs sm:text-sm font-semibold text-violet-900 tracking-tight">{deliveryStats.total} Completed</span>
                      </div>
                      <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 px-4 py-2 rounded-full">
                        <TrendingUp className="h-4 w-4 text-violet-700" />
                        <span className="text-xs sm:text-sm font-semibold text-violet-900 tracking-tight">KSh {deliveryStats.totalEarnings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      applicationStatus?.status === "approved" 
                        ? 'bg-green-500 shadow-sm' 
                        : 'bg-gray-300'
                    }`}>
                      {applicationStatus?.status === "approved" ? (
                        <Radio className="h-8 w-8 text-white animate-pulse" />
                      ) : (
                        <Clock className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <span className={`text-xs font-medium ${
                      applicationStatus?.status === "approved" ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {applicationStatus?.status === "approved" ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Only show if approved */}
          {applicationStatus?.status === "approved" && (
            <>
              {/* Main Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Stats & Quick Actions */}
                <div className="space-y-6">
                  {/* Today's Performance */}
                  <Card className="border border-green-200 shadow-sm">
                    <div className="h-1 bg-green-500"></div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        Today's Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Deliveries Completed</span>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-3xl font-semibold text-green-700">{deliveryStats.todayDeliveries}</p>
                        <p className="text-xs text-green-600 mt-1">Keep up the great work! 🎉</p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Active Deliveries</span>
                          <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-3xl font-semibold text-blue-700">{deliveryStats.pending}</p>
                        <p className="text-xs text-blue-600 mt-1">In progress</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lifetime Stats */}
                  <Card className="border border-violet-200 shadow-sm overflow-hidden">
                    <div className="h-1 bg-violet-500/30" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Award className="h-5 w-5 text-violet-700" />
                        Career Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-violet-50 rounded-lg border border-violet-200">
                        <span className="text-sm font-medium text-gray-700">Total Deliveries</span>
                        <span className="text-xl font-semibold text-violet-800">{deliveryStats.total}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-violet-50 rounded-lg border border-violet-200">
                        <span className="text-sm font-medium text-gray-700">Success Rate</span>
                        <span className="text-xl font-semibold text-violet-800">{completionRate}%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-violet-50 rounded-lg border border-violet-200">
                        <span className="text-sm font-medium text-gray-700">Total Earnings</span>
                        <span className="text-xl font-semibold text-violet-800">KSh {deliveryStats.totalEarnings.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="border border-violet-200 shadow-sm overflow-hidden">
                    <div className="h-1 bg-violet-500/30" />
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center gap-2 tracking-tight">
                        <Zap className="h-5 w-5 text-violet-700" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        className="w-full bg-violet-600 hover:bg-violet-700 justify-start font-semibold"
                        onClick={handleManualRefresh}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Deliveries
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <MapPin className="h-4 w-4 mr-2" />
                        Update Location
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <DollarSign className="h-4 w-4 mr-2" />
                        View Earnings History
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Deliveries & Location */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Location Tracker */}
                  <DeliveryLocationTracker userId={user?.id} />

                  {/* Active Deliveries */}
                  <Card className="border border-orange-200 shadow-sm">
                    <div className="h-1 bg-orange-500"></div>
                    <CardHeader className="bg-orange-50/70 border-b border-orange-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <CardTitle className="flex items-center gap-2">
                          <Truck className="h-6 w-6 text-orange-600" />
                          Active Deliveries
                          <Badge className="rounded-full border border-orange-200 bg-orange-50 text-orange-700 text-xs font-medium">
                            {deliveries.length}
                          </Badge>
                        </CardTitle>
                        {lastRefresh && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            Updated {lastRefresh.toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      {deliveries.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 bg-orange-50 border border-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="h-12 w-12 text-orange-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up! 🎉</h3>
                          <p className="text-gray-600 mb-4">
                            No active deliveries at the moment
                          </p>
                          <p className="text-sm text-gray-500">
                            New assignments will appear here automatically
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {deliveries.map((delivery) => (
                            <Card key={delivery.id} className="border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                              <div className="h-1 bg-violet-500/30" />
                              <CardContent className="p-4">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Package className="h-5 w-5 text-indigo-600" />
                                      <h3 className="text-lg font-semibold text-gray-900">
                                        #{delivery.orders.order_number}
                                      </h3>
                                    </div>
                                    <p className="text-xl font-semibold text-indigo-600">
                                      KES {delivery.orders.total_amount.toLocaleString()}
                                    </p>
                                  </div>
                                  {getDeliveryStatusBadge(delivery.delivery_status)}
                                </div>

                                {/* Details Grid */}
                                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <MapPin className="h-4 w-4 text-blue-600" />
                                      <span className="text-xs font-medium tracking-normal text-blue-900 uppercase">Delivery Address</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                      {delivery.delivery_address_line1}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {delivery.delivery_city}, {delivery.delivery_country}
                                    </p>
                                  </div>

                                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Phone className="h-4 w-4 text-purple-600" />
                                      <span className="text-xs font-medium tracking-normal text-purple-900 uppercase">Customer</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                      {delivery.orders.customer_email}
                                    </p>
                                    {delivery.orders.customer_phone && (
                                      <p className="text-xs text-gray-600">{delivery.orders.customer_phone}</p>
                                    )}
                                  </div>
                                </div>

                                {/* Instructions */}
                                {delivery.delivery_instructions && (
                                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mb-4">
                                    <p className="text-xs font-medium text-amber-900 mb-1">Special Instructions:</p>
                                    <p className="text-sm text-amber-800">{delivery.delivery_instructions}</p>
                                  </div>
                                )}

                                {/* Footer */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-200">
                                  <div className="space-y-1">
                                    <p className="text-sm">
                                      <span className="font-medium text-gray-700">Delivery Fee:</span>
                                      <span className="text-green-600 font-semibold ml-2">
                                        KES {delivery.delivery_fee?.toLocaleString() || 0}
                                      </span>
                                    </p>
                                    {delivery.estimated_delivery_time && (
                                      <p className="text-xs text-gray-500">
                                        Est: {new Date(delivery.estimated_delivery_time).toLocaleString()}
                                      </p>
                                    )}
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex flex-wrap gap-2">
                                    {delivery.delivery_status === "assigned" && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleAcceptDelivery(delivery.id)}
                                        disabled={updatingDelivery === delivery.id}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        {updatingDelivery === delivery.id ? "Accepting..." : "Accept"}
                                      </Button>
                                    )}
                                    {delivery.delivery_status === "picked_up" && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleUpdateDeliveryStatus(delivery.id, "in_transit")}
                                        disabled={updatingDelivery === delivery.id}
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        <Truck className="h-4 w-4 mr-1" />
                                        {updatingDelivery === delivery.id ? "Starting..." : "Start"}
                                      </Button>
                                    )}
                                    {delivery.delivery_status === "in_transit" && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleUpdateDeliveryStatus(delivery.id, "delivered")}
                                        disabled={updatingDelivery === delivery.id}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        {updatingDelivery === delivery.id ? "Completing..." : "Complete"}
                                      </Button>
                                    )}
                                    {["picked_up", "in_transit"].includes(delivery.delivery_status) && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          const address = `${delivery.delivery_address_line1}, ${delivery.delivery_city}`
                                          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
                                          window.open(url, "_blank")
                                        }}
                                      >
                                        <Navigation className="h-3 w-3 mr-1" />
                                        Navigate
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}