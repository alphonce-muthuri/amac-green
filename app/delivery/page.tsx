"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LogOut,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Package,
  Navigation,
  RefreshCw,
  Activity,
  Star,
  ChevronDown,
  ChevronUp,
  Wallet,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  Phone,
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
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          toast({ title: "Notifications Enabled", description: "You'll receive alerts for new delivery assignments." })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const checkUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error || !user) { router.push("/login"); return }
      if (user?.user_metadata?.role !== "delivery") { router.push("/dashboard"); return }
      setUser(user)
      await checkApplicationStatus(user)
      await loadDeliveriesForUser(user.id)
      await loadDeliveryStatsForUser(user.id)
      const poll = setInterval(async () => {
        await loadDeliveriesForUser(user.id)
        await loadDeliveryStatsForUser(user.id)
      }, 30000)
      return () => clearInterval(poll)
    } catch {
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
      const next = result.data || []
      if (lastDeliveryCount > 0 && next.length > lastDeliveryCount) {
        const n = next.length - lastDeliveryCount
        toast({ title: "New Assignment", description: `${n} new deliver${n > 1 ? "ies" : "y"} assigned.`, duration: 5000 })
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("New Delivery", { body: `${n} new deliver${n > 1 ? "ies" : "y"} assigned.`, icon: "/favicon.ico" })
        }
      }
      setDeliveries(next)
      setLastDeliveryCount(next.length)
      setLastRefresh(new Date())
    }
  }

  const loadDeliveryStatsForUser = async (userId: string) => {
    const result = await getDeliveryStats(userId)
    if (result.success) setDeliveryStats(result.data)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try { await supabase.auth.signOut() } catch { setLoggingOut(false) }
  }

  const handleUpdateDeliveryStatus = async (deliveryId: string, status: string, notes?: string) => {
    setUpdatingDelivery(deliveryId)
    try {
      const result = await updateDeliveryStatus(deliveryId, status, notes, user?.id)
      if (result.success) {
        toast({ title: "Status Updated", description: `Delivery marked as ${status}` })
        await loadDeliveriesForUser(user?.id)
        await loadDeliveryStatsForUser(user?.id)
      } else {
        toast({ title: "Update Failed", description: result.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Update Failed", description: "Failed to update delivery status", variant: "destructive" })
    } finally {
      setUpdatingDelivery(null)
    }
  }

  const handleAcceptDelivery = async (deliveryId: string) => {
    setUpdatingDelivery(deliveryId)
    try {
      const result = await acceptDelivery(deliveryId, user?.id)
      if (result.success) {
        toast({ title: "Accepted", description: "Delivery accepted successfully" })
        await loadDeliveriesForUser(user?.id)
        await loadDeliveryStatsForUser(user?.id)
      } else {
        toast({ title: "Failed", description: result.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Failed", description: "Failed to accept delivery", variant: "destructive" })
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
    } catch {
      toast({ title: "Failed", description: "Could not refresh.", variant: "destructive" })
    } finally {
      setRefreshing(false)
    }
  }

  const statusConfig = (status: string) => {
    switch (status) {
      case "assigned":    return { label: "Assigned",    cls: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-400" }
      case "picked_up":  return { label: "Picked Up",   cls: "bg-blue-50 text-blue-700 border-blue-200",           dot: "bg-blue-500" }
      case "in_transit": return { label: "In Transit",  cls: "bg-gray-900 text-white border-gray-900",             dot: "bg-white" }
      case "delivered":  return { label: "Delivered",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200",  dot: "bg-emerald-500" }
      case "failed":     return { label: "Failed",      cls: "bg-red-50 text-red-600 border-red-200",              dot: "bg-red-400" }
      case "cancelled":  return { label: "Cancelled",   cls: "bg-gray-100 text-gray-500 border-gray-200",          dot: "bg-gray-300" }
      default:           return { label: status,        cls: "bg-gray-100 text-gray-600 border-gray-200",          dot: "bg-gray-400" }
    }
  }

  const isActive = applicationStatus?.status === "approved"
  const completionRate = deliveryStats.total > 0
    ? Math.round((deliveryStats.completed / deliveryStats.total) * 100)
    : 0

  const driverName = [applicationStatus?.first_name, applicationStatus?.last_name].filter(Boolean).join(" ") || "Driver"
  const initials = (applicationStatus?.first_name?.[0] || "") + (applicationStatus?.last_name?.[0] || "") || "D"

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium text-gray-400 tracking-wide">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  /* ── Page ────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900 tracking-tight">Delivery Partner</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              {loggingOut ? "…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Hero / Identity card ─────────────────────────── */}
        <div className="rounded-2xl bg-[#0a1a0f] overflow-hidden">
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex items-start justify-between gap-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-400 uppercase">{initials}</span>
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a1a0f] ${isActive ? "bg-emerald-500" : "bg-gray-500"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-sm font-semibold text-white tracking-tight">{driverName}</h1>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/40 border-white/10"}`}>
                      {isActive ? (
                        <><ShieldCheck className="h-2.5 w-2.5" /> Active</>
                      ) : applicationStatus?.status === "pending" ? (
                        <><Clock className="h-2.5 w-2.5" /> Under Review</>
                      ) : "Inactive"}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    {isActive ? "Ready for assignments · Auto-syncs every 30s" : "Application pending approval"}
                  </p>
                </div>
              </div>

              {/* Last sync */}
              {lastRefresh && (
                <p className="text-[10px] text-white/30 shrink-0 pt-1">
                  Synced {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>

            {/* KPI row — visible only when approved */}
            {isActive && (
              <div className="mt-5 pt-5 border-t border-white/[0.07] grid grid-cols-3 gap-4">
                {[
                  { label: "Today", value: String(deliveryStats.todayDeliveries) },
                  { label: "Success rate", value: `${completionRate}%`, accent: true },
                  { label: "Earnings", value: `KSh ${(deliveryStats.totalEarnings / 1000).toFixed(1)}K` },
                ].map((kpi) => (
                  <div key={kpi.label}>
                    <p className="text-[10px] font-medium text-white/35 uppercase tracking-wider">{kpi.label}</p>
                    <p className={`text-lg font-bold leading-none mt-1 ${kpi.accent ? "text-emerald-400" : "text-white"}`}>{kpi.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Approved — main content ──────────────────────── */}
        {isActive ? (
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">

            {/* ── Sidebar ─────────────────────────────────── */}
            <div className="space-y-4">

              {/* Stats panel */}
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 pt-4 pb-1">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Career Stats</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {[
                    { label: "Total",      value: deliveryStats.total,              icon: Package,      hi: false },
                    { label: "Completed",  value: deliveryStats.completed,          icon: CheckCircle,  hi: true  },
                    { label: "In Progress",value: deliveryStats.inProgress,         icon: Activity,     hi: false },
                    { label: "Success",    value: `${completionRate}%`,             icon: Star,         hi: true  },
                    { label: "Today",      value: deliveryStats.todayDeliveries,    icon: CalendarDays, hi: false },
                    { label: "Earnings",   value: `KSh ${deliveryStats.totalEarnings.toLocaleString()}`, icon: Wallet, hi: false },
                  ].map(({ label, value, icon: Icon, hi }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                        <span className="text-xs text-gray-500">{label}</span>
                      </div>
                      <span className={`text-xs font-semibold ${hi ? "text-emerald-600" : "text-gray-800"}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location tracker */}
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 pt-4 pb-1">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Location</p>
                </div>
                <div className="px-4 pb-4 pt-2">
                  <DeliveryLocationTracker userId={user?.id} />
                </div>
              </div>
            </div>

            {/* ── Deliveries list ──────────────────────────── */}
            <div>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">Active Deliveries</span>
                    <span className="text-[11px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full tabular-nums">
                      {deliveries.length}
                    </span>
                  </div>
                  {lastRefresh && (
                    <span className="text-[11px] text-gray-400">
                      {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>

                {/* Empty */}
                {deliveries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                      <Package className="h-5 w-5 text-gray-300" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">All caught up</p>
                    <p className="text-xs text-gray-400 mt-1">New assignments appear here automatically</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {deliveries.map((delivery) => {
                      const cfg = statusConfig(delivery.delivery_status)
                      const isExpanded = expandedDelivery === delivery.id
                      const isUpdating = updatingDelivery === delivery.id

                      return (
                        <div key={delivery.id}>
                          {/* Row — click to expand */}
                          <button
                            onClick={() => setExpandedDelivery(isExpanded ? null : delivery.id)}
                            className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-gray-50/70 transition-colors text-left"
                          >
                            <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-gray-900">
                                  #{delivery.orders?.order_number}
                                </span>
                                <span className="text-xs font-semibold text-emerald-600">
                                  KES {delivery.orders?.total_amount?.toLocaleString()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                <MapPin className="inline h-3 w-3 mr-0.5 -mt-px" />
                                {delivery.delivery_address_line1}, {delivery.delivery_city}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`inline-flex items-center text-[10px] font-semibold border rounded-full px-2 py-0.5 ${cfg.cls}`}>
                                {cfg.label}
                              </span>
                              {isExpanded
                                ? <ChevronUp className="h-3.5 w-3.5 text-gray-300" />
                                : <ChevronDown className="h-3.5 w-3.5 text-gray-300" />
                              }
                            </div>
                          </button>

                          {/* Expanded detail */}
                          {isExpanded && (
                            <div className="bg-gray-50/50 border-t border-gray-100 px-5 pt-4 pb-5 space-y-4">
                              {/* Address + customer */}
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Delivery Address</p>
                                  <p className="text-sm font-medium text-gray-900">{delivery.delivery_address_line1}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{delivery.delivery_city}, {delivery.delivery_country}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Customer</p>
                                  <p className="text-sm font-medium text-gray-900">{delivery.orders?.customer_email}</p>
                                  {delivery.orders?.customer_phone && (
                                    <a
                                      href={`tel:${delivery.orders.customer_phone}`}
                                      className="inline-flex items-center gap-1 text-xs text-emerald-600 mt-0.5 hover:underline"
                                    >
                                      <Phone className="h-3 w-3" />
                                      {delivery.orders.customer_phone}
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Instructions */}
                              {delivery.delivery_instructions && (
                                <div className="rounded-lg bg-white border border-gray-100 px-3.5 py-3">
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Delivery Note</p>
                                  <p className="text-xs text-gray-700 leading-relaxed">{delivery.delivery_instructions}</p>
                                </div>
                              )}

                              {/* Fee + CTA row */}
                              <div className="flex items-end justify-between pt-1">
                                <div>
                                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Delivery Fee</p>
                                  <p className="text-base font-bold text-gray-900 mt-0.5">
                                    KES {delivery.delivery_fee?.toLocaleString() || "0"}
                                  </p>
                                  {delivery.estimated_delivery_time && (
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                      Est. {new Date(delivery.estimated_delivery_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Navigate button — shown while active */}
                                  {["picked_up", "in_transit"].includes(delivery.delivery_status) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 text-xs border-gray-200 text-gray-600 hover:bg-white gap-1.5 rounded-full"
                                      onClick={() => {
                                        const addr = `${delivery.delivery_address_line1}, ${delivery.delivery_city}`
                                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`, "_blank")
                                      }}
                                    >
                                      <Navigation className="h-3 w-3" />
                                      Navigate
                                    </Button>
                                  )}

                                  {/* Accept */}
                                  {delivery.delivery_status === "assigned" && (
                                    <Button
                                      size="sm"
                                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-full"
                                      disabled={isUpdating}
                                      onClick={() => handleAcceptDelivery(delivery.id)}
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                      {isUpdating ? "Accepting…" : "Accept"}
                                    </Button>
                                  )}

                                  {/* Start Transit */}
                                  {delivery.delivery_status === "picked_up" && (
                                    <Button
                                      size="sm"
                                      className="h-8 text-xs bg-gray-900 hover:bg-gray-800 text-white gap-1.5 rounded-full"
                                      disabled={isUpdating}
                                      onClick={() => handleUpdateDeliveryStatus(delivery.id, "in_transit")}
                                    >
                                      <Truck className="h-3 w-3" />
                                      {isUpdating ? "Starting…" : "Start Transit"}
                                    </Button>
                                  )}

                                  {/* Mark Delivered */}
                                  {delivery.delivery_status === "in_transit" && (
                                    <Button
                                      size="sm"
                                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-full"
                                      disabled={isUpdating}
                                      onClick={() => handleUpdateDeliveryStatus(delivery.id, "delivered")}
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                      {isUpdating ? "Completing…" : "Mark Delivered"}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ── Pending / not approved ──────────────────────── */
          <div className="max-w-sm mx-auto">
            <div className="rounded-2xl border border-gray-100 bg-white px-8 py-12 text-center">
              <div className="w-11 h-11 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-5">
                <Clock className="h-5 w-5 text-gray-300" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Application Under Review</h2>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                Your delivery partner application is being reviewed by our team. You'll receive an email once it's approved.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-gray-200 rounded-full gap-1.5"
                onClick={() => router.push("/")}
              >
                Back to Home
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
