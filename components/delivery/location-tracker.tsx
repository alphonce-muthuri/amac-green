"use client"

import { useState, useEffect, useCallback } from "react"
import { Switch } from "@/components/ui/switch"
import { LocationTracker, type LocationData } from "@/lib/location-tracker"
import { updateDeliveryLocation, updateDeliveryAvailability } from "@/app/actions/delivery"
import { MapPin, Battery, Clock, Navigation, Activity, AlertCircle, WifiOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface DeliveryLocationTrackerProps {
  userId?: string
}

export function DeliveryLocationTracker({ userId }: DeliveryLocationTrackerProps) {
  const [isTracking, setIsTracking]         = useState(false)
  const [isAvailable, setIsAvailable]       = useState(true)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [batteryLevel, setBatteryLevel]     = useState<number | undefined>()
  const [lastUpdate, setLastUpdate]         = useState<Date | null>(null)
  const [tracker, setTracker]               = useState<LocationTracker | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "prompt">("prompt")

  useEffect(() => {
    const locationTracker = new LocationTracker(
      async (location: LocationData) => {
        if (!userId) return
        setCurrentLocation(location)
        setLastUpdate(new Date())

        const battery = await locationTracker.getBatteryLevel()
        setBatteryLevel(battery)

        const result = await updateDeliveryLocation(
          { latitude: location.latitude, longitude: location.longitude, accuracy: location.accuracy,
            heading: location.heading, speed: location.speed, isOnline: true, isAvailable, batteryLevel: battery },
        )

        if (!result.success) {
          toast({ title: "Location Update Failed", description: result.error, variant: "destructive" })
        }
      },
      (error: GeolocationPositionError) => {
        let message = "Unknown location error"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Enable permissions in your browser."
            setPermissionStatus("denied")
            break
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable."
            break
          case error.TIMEOUT:
            message = "Location request timed out."
            break
        }
        toast({ title: "Location Error", description: message, variant: "destructive" })
      },
    )

    setTracker(locationTracker)
    return () => locationTracker.stopTracking()
  }, [isAvailable, userId])

  const startTracking = useCallback(async () => {
    if (!tracker) return
    try {
      await tracker.startTracking(30000)
      setIsTracking(true)
      setPermissionStatus("granted")
    } catch (error) {
      setPermissionStatus("denied")
      toast({
        title: "Tracking failed",
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
  }, [tracker])

  const handleAvailabilityChange = async (available: boolean) => {
    if (!userId) {
      toast({ title: "Unavailable", description: "Sign in again to update location status.", variant: "destructive" })
      return
    }

    if (available && !isTracking) {
      await startTracking()
      setIsAvailable(true)
    } else if (!available && isTracking) {
      stopTracking()
      setIsAvailable(false)
    }

    const result = await updateDeliveryAvailability(available)
    if (!result.success) {
      toast({ title: "Failed to update status", description: result.error, variant: "destructive" })
    }
  }

  const accuracyLabel = () => {
    if (!currentLocation?.accuracy) return null
    const a = currentLocation.accuracy
    return a < 20 ? "Good" : a < 50 ? "Fair" : "Weak"
  }

  const accuracyColor = () => {
    if (!currentLocation?.accuracy) return "text-gray-400"
    const a = currentLocation.accuracy
    return a < 20 ? "text-emerald-600" : a < 50 ? "text-amber-600" : "text-red-500"
  }

  const online = isTracking && isAvailable

  return (
    <div className="space-y-3">

      {/* Toggle row */}
      <div className={`flex items-center justify-between rounded-lg border px-3.5 py-3 transition-colors ${
        online ? "bg-emerald-50/60 border-emerald-200/70" : "bg-gray-50 border-gray-100"
      }`}>
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${online ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
          <div>
            <p className="text-xs font-semibold text-gray-800 leading-none">
              {online ? "Online & available" : "Offline"}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {online ? "Receiving assignments" : "Toggle to go online"}
            </p>
          </div>
        </div>
        <Switch
          checked={online}
          onCheckedChange={handleAvailabilityChange}
          className="data-[state=checked]:bg-emerald-600 scale-90"
        />
      </div>

      {/* Permission denied warning */}
      {permissionStatus === "denied" && (
        <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-100 px-3.5 py-3">
          <AlertCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700 leading-relaxed">
            Location permission denied. Enable it in your browser settings and try again.
          </p>
        </div>
      )}

      {/* No location yet — offline state */}
      {!currentLocation && !isTracking && permissionStatus !== "denied" && (
        <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-gray-200 px-3.5 py-3">
          <WifiOff className="h-3.5 w-3.5 text-gray-300 shrink-0" />
          <p className="text-xs text-gray-400">Turn on the switch to start sharing your location.</p>
        </div>
      )}

      {/* Live data — only when tracking */}
      {currentLocation && (
        <div className="rounded-lg border border-gray-100 overflow-hidden divide-y divide-gray-50">

          {/* Coordinates */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5">
            <Navigation className="h-3.5 w-3.5 text-gray-300 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">GPS</p>
              <p className="text-[11px] font-mono text-gray-700 tabular-nums">
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Accuracy + speed */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5">
            <Activity className="h-3.5 w-3.5 text-gray-300 shrink-0" />
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Accuracy</p>
                <p className="text-xs text-gray-700">±{Math.round(currentLocation.accuracy || 0)}m</p>
              </div>
              {accuracyLabel() && (
                <span className={`text-[10px] font-semibold ${accuracyColor()}`}>{accuracyLabel()}</span>
              )}
            </div>
          </div>

          {/* Battery + last update */}
          <div className="grid grid-cols-2 divide-x divide-gray-50">
            <div className="flex items-center gap-2 px-3.5 py-2.5">
              <Battery className="h-3.5 w-3.5 text-gray-300 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Battery</p>
                <p className="text-xs text-gray-700">{batteryLevel != null ? `${batteryLevel}%` : "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2.5">
              <Clock className="h-3.5 w-3.5 text-gray-300 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Updated</p>
                <p className="text-xs text-gray-700">
                  {lastUpdate
                    ? lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer note */}
      {online && (
        <p className="text-[10px] text-gray-400 leading-relaxed px-0.5">
          Location updates every 30s. Keep the app open for best results.
        </p>
      )}
    </div>
  )
}
