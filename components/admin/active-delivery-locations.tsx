"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, RefreshCw, Clock, Battery, Truck, Phone, Navigation, Zap, Activity } from "lucide-react"
import { getActiveDeliveryLocations } from "@/app/actions/delivery"
import { toast } from "@/hooks/use-toast"

interface DeliveryLocation {
  id: string
  delivery_person_id: string
  latitude: number
  longitude: number
  accuracy?: number
  heading?: number
  speed?: number
  is_online: boolean
  is_available: boolean
  battery_level?: number
  last_updated: string
  delivery_applications: {
    first_name: string
    last_name: string
    phone: string
    vehicle_type: string
    vehicle_registration: string
  }
}

export function ActiveDeliveryLocations() {
  const [locations, setLocations] = useState<DeliveryLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadLocations = async () => {
    try {
      const result = await getActiveDeliveryLocations()
      
      if (result.success) {

        setLocations(result.data)
      } else {

        toast({
          title: "Failed to Load Locations",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load delivery locations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadLocations()
  }

  useEffect(() => {
    loadLocations()
    const interval = setInterval(loadLocations, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatLastUpdate = (timestamp: string) => {
    const now = new Date()
    const updated = new Date(timestamp)
    const diffMs = now.getTime() - updated.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return updated.toLocaleDateString()
  }

  const openInMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}&z=15&t=m`
    window.open(url, "_blank")
  }

  if (loading) {
    return (
      <Card className="border-2 border-purple-200">
        <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
        <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            Active Delivery Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Loading active locations...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600" />
            Active Delivery Locations
          </h2>
          <p className="text-gray-600 mt-1">Real-time tracking of delivery partners</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {locations.length === 0 ? (
        <Card className="border-2 border-gray-200">
          <CardContent className="text-center py-16">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Delivery Partners Online</h3>
            <p className="text-gray-600 mb-2">No active delivery partners at the moment</p>
            <p className="text-sm text-gray-500">
              Delivery partners will appear here when they start location tracking
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {locations.map((location) => (
            <Card key={location.id} className="border-2 border-purple-200 hover:shadow-2xl transition-all duration-300 hover:border-purple-400">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {location.delivery_applications?.first_name?.charAt(0) || "D"}
                        {location.delivery_applications?.last_name?.charAt(0) || "P"}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {location.delivery_applications?.first_name || "Unknown"} {location.delivery_applications?.last_name || "Driver"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className={`${
                              location.is_available 
                                ? "bg-green-100 text-green-700 border-2 border-green-300" 
                                : "bg-amber-100 text-amber-700 border-2 border-amber-300"
                            } font-bold`}
                          >
                            {location.is_available ? "✓ Available" : "⏱ Busy"}
                          </Badge>
                          {location.is_online && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-2 border-emerald-300 font-bold">
                              ● Online
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Vehicle Info</h4>
                        <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                          <p className="text-xs text-purple-700 font-semibold mb-1">Vehicle Type</p>
                          <p className="text-sm font-bold text-gray-900">{location.delivery_applications?.vehicle_type || "Unknown"}</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                          <p className="text-xs text-purple-700 font-semibold mb-1">License Plate</p>
                          <p className="text-sm font-bold text-gray-900">{location.delivery_applications?.vehicle_registration || "N/A"}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Contact & Status</h4>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Phone className="w-4 h-4 text-purple-600" />
                            <p className="text-xs text-gray-500 font-semibold">Phone Number</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{location.delivery_applications?.phone || "N/A"}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <p className="text-xs text-gray-500 font-semibold">Last Update</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{formatLastUpdate(location.last_updated)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-semibold text-gray-700">
                          {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </span>
                      </div>
                      {location.accuracy && (
                        <Badge variant="outline" className="text-xs font-semibold">
                          ±{Math.round(location.accuracy)}m accuracy
                        </Badge>
                      )}
                      {location.speed && (
                        <Badge className="bg-blue-100 text-blue-700 border-2 border-blue-300 text-xs font-bold">
                          <Zap className="w-3 h-3 mr-1" />
                          {Math.round(location.speed)} km/h
                        </Badge>
                      )}
                      {location.battery_level && (
                        <Badge className="bg-green-100 text-green-700 border-2 border-green-300 text-xs font-bold">
                          <Battery className="w-3 h-3 mr-1" />
                          {location.battery_level}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-3">
                    <Button
                      onClick={() =>
                        openInMaps(
                          location.latitude,
                          location.longitude,
                          `${location.delivery_applications?.first_name || "Unknown"} ${location.delivery_applications?.last_name || "Driver"}`,
                        )
                      }
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 flex-1 md:flex-none"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      View on Map
                    </Button>
                    <Button
                      onClick={() => window.open(`tel:${location.delivery_applications?.phone || ""}`, "_self")}
                      disabled={!location.delivery_applications?.phone}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 flex-1 md:flex-none"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Driver
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