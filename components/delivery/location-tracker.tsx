"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { LocationTracker, type LocationData } from "@/lib/location-tracker"
import { updateDeliveryLocation, updateDeliveryAvailability } from "@/app/actions/delivery"
import { 
  MapPin, 
  Battery, 
  Wifi, 
  WifiOff, 
  Clock, 
  Navigation, 
  Activity,
  Zap,
  Radio,
  TrendingUp,
  AlertCircle
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface DeliveryLocationTrackerProps {
  userId?: string
}

export function DeliveryLocationTracker({ userId }: DeliveryLocationTrackerProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [isAvailable, setIsAvailable] = useState(true)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [batteryLevel, setBatteryLevel] = useState<number | undefined>()
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [tracker, setTracker] = useState<LocationTracker | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "prompt">("prompt")

  useEffect(() => {
    const locationTracker = new LocationTracker(
      async (location: LocationData) => {

        setCurrentLocation(location)
        setLastUpdate(new Date())

        const battery = await locationTracker.getBatteryLevel()
        setBatteryLevel(battery)

        const result = await updateDeliveryLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          heading: location.heading,
          speed: location.speed,
          isOnline: true,
          isAvailable,
          batteryLevel: battery,
        }, userId)

        if (!result.success) {

          toast({
            title: "Location Update Failed",
            description: result.error,
            variant: "destructive",
          })
        }
      },
      (error: GeolocationPositionError) => {

        let message = "Unknown location error"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable location permissions."
            setPermissionStatus("denied")
            break
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable."
            break
          case error.TIMEOUT:
            message = "Location request timed out."
            break
        }

        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        })
      },
    )

    setTracker(locationTracker)

    return () => {
      locationTracker.stopTracking()
    }
  }, [isAvailable, userId])

  const startTracking = useCallback(async () => {
    if (!tracker) return

    try {

      await tracker.startTracking(30000)
      setIsTracking(true)
      setPermissionStatus("granted")

      toast({
        title: "📍 Location Tracking Started",
        description: "Your location is now being shared for deliveries.",
      })
    } catch (error) {
      setPermissionStatus("denied")
      toast({
        title: "Failed to Start Tracking",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }, [tracker])

  const stopTracking = useCallback(() => {
    if (!tracker) return


    tracker.stopTracking()
    setIsTracking(false)
    setCurrentLocation(null)
    setLastUpdate(null)

    toast({
      title: "🔴 Location Tracking Stopped",
      description: "You are now offline for deliveries.",
    })
  }, [tracker])

  const handleAvailabilityChange = async (available: boolean) => {

    
    if (available && !isTracking) {
      await startTracking()
      setIsAvailable(true)
    } else if (!available && isTracking) {
      stopTracking()
      setIsAvailable(false)
    }

    const result = await updateDeliveryAvailability(available, userId)
    if (result.success) {
      toast({
        title: available ? "🟢 Now Online" : "🔴 Now Offline",
        description: available
          ? "You can now receive delivery assignments."
          : "You won't receive new assignments.",
      })
    } else {
      toast({
        title: "Failed to Update Status",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  const getBatteryColor = () => {
    if (!batteryLevel) return "text-gray-400"
    if (batteryLevel > 50) return "text-green-600"
    if (batteryLevel > 20) return "text-amber-600"
    return "text-red-600"
  }

  const getAccuracyColor = () => {
    if (!currentLocation?.accuracy) return "text-gray-400"
    if (currentLocation.accuracy < 20) return "text-green-600"
    if (currentLocation.accuracy < 50) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <Card className="border-2 border-indigo-200 overflow-hidden">
      {/* Animated gradient top bar */}
      <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x"></div>
      
      <CardHeader className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Location Tracking</CardTitle>
              <CardDescription className="text-sm mt-1">Share your location to receive delivery assignments</CardDescription>
            </div>
          </div>
          {/* Live indicator */}
          {isTracking && (
            <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-full border-2 border-green-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-green-700">LIVE</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Main Status Display */}
        <div className="relative">
          <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
            isTracking && isAvailable 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
              : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Status Icon */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isTracking && isAvailable
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/50'
                    : 'bg-gradient-to-br from-gray-300 to-gray-400'
                }`}>
                  {isTracking ? (
                    <Radio className="h-8 w-8 text-white animate-pulse" />
                  ) : (
                    <WifiOff className="h-8 w-8 text-white" />
                  )}
                </div>
                
                {/* Status Text */}
                <div>
                  <h3 className={`text-2xl font-extrabold ${
                    isTracking && isAvailable ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {isTracking && isAvailable ? 'Online & Available' : 'Offline'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {isTracking && isAvailable 
                      ? 'Ready to receive delivery assignments' 
                      : 'Toggle switch to go online'}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex flex-col items-center gap-2">
                <Switch 
                  checked={isTracking && isAvailable} 
                  onCheckedChange={handleAvailabilityChange}
                  className="data-[state=checked]:bg-green-600 scale-125"
                />
                <span className="text-xs font-semibold text-gray-600">
                  {isTracking && isAvailable ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Location Details Grid */}
        {currentLocation && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Coordinates Card */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Navigation className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-bold text-gray-900">GPS Coordinates</h4>
              </div>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between items-center bg-white p-2 rounded-lg">
                  <span className="text-gray-600">Latitude:</span>
                  <span className="font-bold text-blue-700">{currentLocation.latitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded-lg">
                  <span className="text-gray-600">Longitude:</span>
                  <span className="font-bold text-blue-700">{currentLocation.longitude.toFixed(6)}</span>
                </div>
              </div>
            </div>

            {/* Accuracy Card */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-bold text-gray-900">Signal Quality</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-white p-2 rounded-lg">
                  <span className="text-sm text-gray-600">Accuracy:</span>
                  <Badge className={`${getAccuracyColor()} bg-opacity-10 font-bold`}>
                    ±{Math.round(currentLocation.accuracy || 0)}m
                  </Badge>
                </div>
                {currentLocation.speed !== null && currentLocation.speed !== undefined && (
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg">
                    <span className="text-sm text-gray-600">Speed:</span>
                    <Badge className="bg-purple-100 text-purple-700 font-bold">
                      {Math.round(currentLocation.speed)} km/h
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Battery Level */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Battery className={`h-5 w-5 ${getBatteryColor()}`} />
              <span className="text-xs font-semibold text-gray-600 uppercase">Battery</span>
            </div>
            <p className={`text-2xl font-extrabold ${getBatteryColor()}`}>
              {batteryLevel ? `${batteryLevel}%` : '--'}
            </p>
          </div>

          {/* Last Update */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border-2 border-teal-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-teal-600" />
              <span className="text-xs font-semibold text-gray-600 uppercase">Updated</span>
            </div>
            <p className="text-lg font-bold text-teal-700">
              {lastUpdate ? lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </p>
          </div>

          {/* Status Badge */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-indigo-200 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className={`h-5 w-5 ${isTracking ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="text-xs font-semibold text-gray-600 uppercase">Status</span>
            </div>
            <p className={`text-lg font-bold ${isTracking ? 'text-green-700' : 'text-gray-600'}`}>
              {isTracking ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>

        {/* No Location Display */}
        {!currentLocation && !isTracking && (
          <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Location Sharing Disabled</h4>
            <p className="text-sm text-gray-600 px-4">
              Enable the switch above to start sharing your location and receive delivery assignments
            </p>
          </div>
        )}

        {/* Permission Warning */}
        {permissionStatus === "denied" && (
          <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-xl border-2 border-red-300">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-red-900 mb-1">Location Permission Required</h4>
                <p className="text-sm text-red-700">
                  Please enable location access in your browser settings to use this feature. This is required to receive delivery assignments based on your location.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 p-4 rounded-xl border-2 border-indigo-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1 text-sm">Auto-Refresh Every 30 Seconds</h4>
              <p className="text-xs text-gray-700">
                Your location is automatically updated every 30 seconds when tracking is enabled. Keep the app open for best results.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

       
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
    </Card>
  )
}