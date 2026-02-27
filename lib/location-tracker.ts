// Location tracking service for delivery personnel
export interface LocationData {
  latitude: number
  longitude: number
  accuracy?: number
  heading?: number
  speed?: number
  timestamp: number
}

export interface DeliveryLocationUpdate {
  latitude: number
  longitude: number
  accuracy?: number
  heading?: number
  speed?: number
  isOnline: boolean
  isAvailable: boolean
  batteryLevel?: number
}

export class LocationTracker {
  private watchId: number | null = null
  private updateInterval: NodeJS.Timeout | null = null
  private isTracking = false
  private lastLocation: LocationData | null = null
  private onLocationUpdate?: (location: LocationData) => void
  private onError?: (error: GeolocationPositionError) => void

  constructor(
    onLocationUpdate?: (location: LocationData) => void,
    onError?: (error: GeolocationPositionError) => void,
  ) {
    this.onLocationUpdate = onLocationUpdate
    this.onError = onError
  }

  // Check if geolocation is supported
  static isSupported(): boolean {
    return "geolocation" in navigator
  }

  // Request location permission
  async requestPermission(): Promise<boolean> {
    if (!LocationTracker.isSupported()) {
      throw new Error("Geolocation is not supported by this browser")
    }

    try {
      // Try to get current position to trigger permission request
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        })
      })
      return true
    } catch (error) {
      console.error(" Location permission denied:", error)
      return false
    }
  }

  // Start tracking location
  async startTracking(updateIntervalMs = 30000): Promise<void> {
    if (this.isTracking) {
      console.log(" Location tracking already started")
      return
    }

    if (!LocationTracker.isSupported()) {
      throw new Error("Geolocation is not supported")
    }

    const hasPermission = await this.requestPermission()
    if (!hasPermission) {
      throw new Error("Location permission denied")
    }

    console.log(" Starting location tracking...")
    this.isTracking = true

    // Watch position changes
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed ? position.coords.speed * 3.6 : undefined, // Convert m/s to km/h
          timestamp: position.timestamp,
        }

        this.lastLocation = location
        this.onLocationUpdate?.(location)
        console.log(" Location updated:", location)
      },
      (error) => {
        console.error(" Location error:", error)
        this.onError?.(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      },
    )

    // Set up periodic updates even if position hasn't changed
    this.updateInterval = setInterval(() => {
      if (this.lastLocation) {
        this.onLocationUpdate?.(this.lastLocation)
      }
    }, updateIntervalMs)
  }

  // Stop tracking location
  stopTracking(): void {
    console.log(" Stopping location tracking...")
    this.isTracking = false

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  // Get current location once
  async getCurrentLocation(): Promise<LocationData> {
    if (!LocationTracker.isSupported()) {
      throw new Error("Geolocation is not supported")
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed ? position.coords.speed * 3.6 : undefined,
            timestamp: position.timestamp,
          }
          resolve(location)
        },
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    })
  }

  // Get battery level if supported
  async getBatteryLevel(): Promise<number | undefined> {
    try {
      // @ts-ignore - Battery API is experimental
      if ("getBattery" in navigator) {
        // @ts-ignore
        const battery = await navigator.getBattery()
        return Math.round(battery.level * 100)
      }
    } catch (error) {
      console.log(" Battery API not supported")
    }
    return undefined
  }

  get isCurrentlyTracking(): boolean {
    return this.isTracking
  }

  get currentLocation(): LocationData | null {
    return this.lastLocation
  }
}
