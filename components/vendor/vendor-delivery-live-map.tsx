"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, RefreshCw, Package, Truck, Clock, DollarSign, Phone, Navigation } from "lucide-react"
import { getVendorActiveDeliveryLocations, getVendorDeliveryStats } from "@/app/actions/vendor-deliveries"
import { toast } from "@/hooks/use-toast"

interface VendorDeliveryLocation {
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
  vendor_deliveries: Array<{
    id: string
    delivery_status: string
    orders: {
      id: string
      order_number: string
      order_items: Array<{
        vendor_id: string
        product_name: string
        quantity: number
      }>
    }
  }>
  vendor_products_count: number
}

interface DeliveryStats {
  totalDeliveries: number
  pendingDeliveries: number
  completedDeliveries: number
  inTransitDeliveries: number
  totalValue: number
}

export function VendorDeliveryLiveMap() {
  const [locations, setLocations] = useState<VendorDeliveryLocation[]>([])
  const [stats, setStats] = useState<DeliveryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInitializing, setMapInitializing] = useState(true)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const loadData = async () => {
    try {

      
      const [locationsResult, statsResult] = await Promise.all([
        getVendorActiveDeliveryLocations(),
        getVendorDeliveryStats()
      ])
      
      if (locationsResult.success) {

        setLocations(locationsResult.data || [])
        updateMapMarkers(locationsResult.data || [])
      } else {
        toast({
          title: "Failed to Load Delivery Locations",
          description: locationsResult.error,
          variant: "destructive",
        })
      }

      if (statsResult.success) {
        setStats(statsResult.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load delivery data",
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
      
      // Fix for default markers in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      // Initialize map centered on Nairobi
      const map = L.map(mapContainerRef.current).setView([-1.2921, 36.8219], 11)

      // Add tile layer
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

  const updateMapMarkers = async (locations: VendorDeliveryLocation[]) => {
    if (!mapRef.current || !mapLoaded) return

    try {
      const L = (await import('leaflet')).default

      // Clear existing markers
      markersRef.current.forEach(marker => {
        mapRef.current.removeLayer(marker)
      })
      markersRef.current = []

      // Add new markers
      locations.forEach(location => {
        if (!location.delivery_applications) return

        const { first_name, last_name, vehicle_type, vehicle_registration, phone } = location.delivery_applications

        // Create custom icon - different color for vendor deliveries
        const iconColor = '#8b5cf6' // Purple for vendor-specific deliveries
        const iconHtml = `
          <div style="
            background-color: ${iconColor};
            width: 35px;
            height: 35px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            position: relative;
          ">
            📦
            <div style="
              position: absolute;
              top: -5px;
              right: -5px;
              background: #ef4444;
              color: white;
              border-radius: 50%;
              width: 18px;
              height: 18px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
            ">
              ${location.vendor_products_count}
            </div>
          </div>
        `

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-vendor-delivery-marker',
          iconSize: [35, 35],
          iconAnchor: [17, 17],
        })

        // Format last update time
        const lastUpdate = new Date(location.last_updated)
        const now = new Date()
        const diffMs = now.getTime() - lastUpdate.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const timeAgo = diffMins < 1 ? 'Just now' : 
                       diffMins < 60 ? `${diffMins}m ago` : 
                       `${Math.floor(diffMins / 60)}h ago`

        // Create popup content with vendor-specific information
        const deliveryDetails = location.vendor_deliveries.map(delivery => {
          const vendorItems = delivery.orders.order_items
          return `
            <div style="margin: 4px 0; padding: 4px; background: #f3f4f6; border-radius: 4px;">
              <strong>Order:</strong> ${delivery.orders.order_number}<br>
              <strong>Status:</strong> <span style="color: #8b5cf6;">${delivery.delivery_status}</span><br>
              <strong>Your Products:</strong> ${vendorItems.map(item => `${item.product_name} (${item.quantity})`).join(', ')}
            </div>
          `
        }).join('')

        const popupContent = `
          <div style="min-width: 250px; max-width: 350px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937; display: flex; align-items: center; gap: 8px;">
              📦 ${first_name} ${last_name}
              <span style="
                background: #8b5cf6;
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
              ">
                ${location.vendor_products_count} YOUR PRODUCTS
              </span>
            </h3>
            
            <div style="display: flex; gap: 4px; margin-bottom: 8px;">
              <span style="
                background: ${location.is_available ? '#10b981' : '#f59e0b'};
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: bold;
              ">
                ${location.is_available ? 'Available' : 'Busy'}
              </span>
              <span style="
                background: #10b981;
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: bold;
              ">
                Online
              </span>
            </div>
            
            <div style="font-size: 13px; color: #6b7280; line-height: 1.4; margin-bottom: 8px;">
              <div><strong>Vehicle:</strong> ${vehicle_type}</div>
              <div><strong>Plate:</strong> ${vehicle_registration}</div>
              <div><strong>Phone:</strong> ${phone}</div>
              <div><strong>Last Update:</strong> ${timeAgo}</div>
              ${location.battery_level ? `<div><strong>Battery:</strong> ${location.battery_level}%</div>` : ''}
              ${location.speed ? `<div><strong>Speed:</strong> ${Math.round(location.speed)} km/h</div>` : ''}
            </div>

            <div style="margin: 8px 0;">
              <h4 style="margin: 0 0 4px 0; font-size: 12px; font-weight: bold; color: #8b5cf6;">DELIVERING YOUR PRODUCTS:</h4>
              ${deliveryDetails}
            </div>
            
            <div style="margin-top: 8px; display: flex; gap: 4px;">
              <button onclick="window.open('tel:${phone}', '_self')" style="
                background: #3b82f6;
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                flex: 1;
              ">
                📞 Call Driver
              </button>
              <button onclick="window.open('https://www.google.com/maps?q=${location.latitude},${location.longitude}', '_blank')" style="
                background: #8b5cf6;
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                flex: 1;
              ">
                🗺️ Track
              </button>
            </div>
          </div>
        `

        const marker = L.marker([location.latitude, location.longitude], { icon: customIcon })
          .bindPopup(popupContent)
          .addTo(mapRef.current)

        markersRef.current.push(marker)
      })

      // Fit map to show all markers if there are any
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
    await loadData()
  }

  useEffect(() => {
    loadData()

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000)

    return () => {
      clearInterval(interval)
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- loadData closes over map state; stable interval setup on mount
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

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-gray-700" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-gray-700" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingDeliveries}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-emerald-700" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Transit</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inTransitDeliveries}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">KSh {stats.totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Your Products Live Delivery Tracking
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {locations.length} active deliveries
              </Badge>
            </CardTitle>
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div 
              ref={mapContainerRef}
              className="w-full h-96 rounded-lg border"
              style={{ minHeight: '400px' }}
            />
            
            {/* Loading overlay */}
            {(loading || mapInitializing) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-200 mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    {mapInitializing ? "Initializing map..." : "Loading your delivery locations..."}
                  </p>
                </div>
              </div>
            )}
            
            {/* No deliveries overlay */}
            {!loading && !mapInitializing && locations.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 rounded-lg">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No active deliveries for your products</p>
                  <p className="text-sm text-gray-500">
                    When customers order your products and they're out for delivery, you'll see the delivery drivers here
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          {locations.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Map Legend:</h4>
              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center text-white text-xs">📦</div>
                  <span>Delivery driver carrying your products</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                  <span>Number of your products being delivered</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}