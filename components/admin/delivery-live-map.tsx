"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, RefreshCw, Users, Truck, Battery, Clock, Zap, Navigation } from "lucide-react"
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
  } | null
}

export function DeliveryLiveMap() {
  const [locations, setLocations] = useState<DeliveryLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInitializing, setMapInitializing] = useState(true)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const loadLocations = async () => {
    try {

      const result = await getActiveDeliveryLocations()
      
      if (result.success) {

        setLocations(result.data || [])
        updateMapMarkers(result.data || [])
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

  const initializeMap = async () => {
    try {
      if (!mapContainerRef.current) {

        return
      }



      const L = (await import('leaflet')).default
      
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      const map = L.map(mapContainerRef.current).setView([-1.2921, 36.8219], 11)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map)

      mapRef.current = map
      setMapLoaded(true)
      setMapInitializing(false)
      

    } catch (error) {
      setMapInitializing(false)
      toast({
        title: "Map Error",
        description: "Failed to initialize map. Please refresh the page.",
        variant: "destructive",
      })
    }
  }

  const updateMapMarkers = async (locations: DeliveryLocation[]) => {
    if (!mapRef.current || !mapLoaded) return

    try {
      const L = (await import('leaflet')).default

      markersRef.current.forEach(marker => {
        mapRef.current.removeLayer(marker)
      })
      markersRef.current = []

      locations.forEach(location => {
        if (!location.delivery_applications) return

        const { first_name, last_name, vehicle_type, vehicle_registration, phone } = location.delivery_applications

        const iconColor = location.is_available ? '#10b981' : '#f59e0b'
        const iconHtml = `
          <div style="
            background: linear-gradient(135deg, ${iconColor}, ${iconColor}dd);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
          ">
            🚗
          </div>
        `

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-delivery-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })

        const lastUpdate = new Date(location.last_updated)
        const now = new Date()
        const diffMs = now.getTime() - lastUpdate.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const timeAgo = diffMins < 1 ? 'Just now' : 
                       diffMins < 60 ? `${diffMins}m ago` : 
                       `${Math.floor(diffMins / 60)}h ago`

        const popupContent = `
          <div style="min-width: 220px; font-family: sans-serif;">
            <div style="
              background: linear-gradient(135deg, #8b5cf6, #ec4899);
              padding: 12px;
              margin: -12px -12px 12px -12px;
              border-radius: 8px 8px 0 0;
            ">
              <h3 style="margin: 0; font-weight: bold; color: white; font-size: 16px;">
                ${first_name} ${last_name}
              </h3>
            </div>
            
            <div style="display: flex; gap: 6px; margin-bottom: 12px;">
              <span style="
                background: ${location.is_available ? '#10b981' : '#f59e0b'};
                color: white;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
              ">
                ${location.is_available ? '✓ Available' : '⏱ Busy'}
              </span>
              <span style="
                background: #10b981;
                color: white;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
              ">
                ● Online
              </span>
            </div>
            
            <div style="font-size: 13px; color: #4b5563; line-height: 1.6;">
              <div style="margin-bottom: 6px;"><strong>Vehicle:</strong> ${vehicle_type}</div>
              <div style="margin-bottom: 6px;"><strong>Plate:</strong> ${vehicle_registration}</div>
              <div style="margin-bottom: 6px;"><strong>Phone:</strong> ${phone}</div>
              <div style="margin-bottom: 6px;"><strong>Updated:</strong> ${timeAgo}</div>
              ${location.battery_level ? `<div style="margin-bottom: 6px;"><strong>Battery:</strong> 🔋 ${location.battery_level}%</div>` : ''}
              ${location.speed ? `<div style="margin-bottom: 6px;"><strong>Speed:</strong> ⚡ ${Math.round(location.speed)} km/h</div>` : ''}
            </div>
            
            <div style="margin-top: 12px; display: flex; gap: 6px;">
              <button onclick="window.open('tel:${phone}', '_self')" style="
                flex: 1;
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
                border: none;
                padding: 8px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: bold;
                cursor: pointer;
              ">
                📞 Call
              </button>
              <button onclick="window.open('https://www.google.com/maps?q=${location.latitude},${location.longitude}', '_blank')" style="
                flex: 1;
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                padding: 8px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: bold;
                cursor: pointer;
              ">
                🗺️ Navigate
              </button>
            </div>
          </div>
        `

        const marker = L.marker([location.latitude, location.longitude], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(mapRef.current)

        markersRef.current.push(marker)
      })

      if (locations.length > 0) {
        const group = new L.featureGroup(markersRef.current)
        mapRef.current.fitBounds(group.getBounds().pad(0.1))
      }


    } catch (error) {
      // Error updating markers
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadLocations()
  }

  useEffect(() => {
    loadLocations()
    const interval = setInterval(loadLocations, 30000)

    return () => {
      clearInterval(interval)
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- loadLocations closes over map state; stable interval setup on mount
  }, [])

  useEffect(() => {
    let attempts = 0
    const maxAttempts = 5
    
    const tryInitializeMap = () => {
      attempts++

      
      if (mapContainerRef.current) {
        initializeMap()
      } else if (attempts < maxAttempts) {
        setTimeout(tryInitializeMap, 1000)
      } else {

        setMapInitializing(false)
        toast({
          title: "Map Initialization Failed",
          description: "Please refresh the page to try again.",
          variant: "destructive",
        })
      }
    }

    const timer = setTimeout(tryInitializeMap, 100)
    return () => clearTimeout(timer)
  }, [])

  const availableCount = locations.filter(loc => loc.is_available).length
  const busyCount = locations.length - availableCount

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
          <Navigation className="w-6 h-6 text-gray-700" />
          Live Delivery Tracking
        </h2>
        <p className="text-sm text-gray-500">Real-time location tracking of active delivery partners</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Online</p>
                <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Available</p>
                <p className="text-2xl font-bold text-gray-900">{availableCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Truck className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Busy</p>
                <p className="text-2xl font-bold text-gray-900">{busyCount}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  Live Delivery Locations
                  <Badge className="bg-gray-100 text-gray-700 border border-gray-200 text-xs font-semibold hover:bg-gray-100">
                    <Zap className="w-3 h-3 mr-1" />
                    {locations.length} online
                  </Badge>
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">Auto-refreshing every 30 seconds</p>
              </div>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="h-8 rounded-xl border-gray-200 text-xs"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative">
            <div 
              ref={mapContainerRef}
              className="w-full rounded-xl border border-gray-200 shadow-inner"
              style={{ minHeight: '500px', height: '500px' }}
            />
            
            {(loading || mapInitializing) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
                <div className="text-center">
                  <div className="w-20 h-20 border-4 border-gray-200 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-900 font-semibold text-lg mb-2">
                    {mapInitializing ? "Initializing map..." : "Loading delivery locations..."}
                  </p>
                  <p className="text-gray-600 text-sm">Please wait a moment</p>
                </div>
              </div>
            )}
            
            {!loading && !mapInitializing && locations.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Truck className="h-12 w-12 text-gray-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Drivers Online</h3>
                  <p className="text-gray-600 mb-2">No delivery partners are currently online</p>
                  <p className="text-sm text-gray-500">
                    Delivery partners will appear on the map when they start location tracking
                  </p>
                </div>
              </div>
            )}
          </div>

          {!loading && !mapInitializing && locations.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Available ({availableCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-100 rounded-full"></div>
                    <span className="text-gray-700 font-medium">Busy ({busyCount})</span>
                  </div>
                </div>
                <p className="text-gray-500 text-xs">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}