import { GeolocationCoordinates } from "@/types";
import haversineDistance from "haversine-distance";

/**
 * Calculate the distance between two geographic coordinates
 * @param point1 First coordinate point
 * @param point2 Second coordinate point
 * @returns Distance in meters
 */
export function calculateDistance(
  point1: GeolocationCoordinates,
  point2: GeolocationCoordinates
): number {
  return haversineDistance(
    { latitude: point1.latitude, longitude: point1.longitude },
    { latitude: point2.latitude, longitude: point2.longitude }
  );
}

/**
 * Check if a coordinate is within a specified radius of a center point
 * @param userLocation User's current location
 * @param centerLocation Center point of the allowed area
 * @param radiusInMeters Allowed radius in meters
 * @returns Whether the user is within the allowed area
 */
export function isWithinRadius(
  userLocation: GeolocationCoordinates,
  centerLocation: GeolocationCoordinates,
  radiusInMeters: number
): boolean {
  const distance = calculateDistance(userLocation, centerLocation);
  return distance <= radiusInMeters;
}

/**
 * Get the user's current location using the Geolocation API
 * @param highAccuracy Whether to request high accuracy (slower but more precise)
 * @returns Promise resolving to the user's coordinates
 */
export function getCurrentLocation(
  highAccuracy: boolean = false
): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    const options = highAccuracy
      ? {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        }
      : {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000,
        };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        if (highAccuracy && error.code === error.TIMEOUT) {
          getCurrentLocation(false).then(resolve).catch(reject);
        } else {
          reject(error);
        }
      },
      options
    );
  });
}

/**
 * Watch the user's location for changes
 * @param callback Function to call when location changes
 * @returns Watch ID that can be used to clear the watch
 */
export function watchLocation(
  callback: (location: GeolocationCoordinates) => void
): number | null {
  if (!navigator.geolocation) {
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    (error) => {
      console.error("Location watch error:", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    }
  );
}

/**
 * Stop watching the user's location
 * @param watchId The watch ID returned by watchLocation
 */
export function clearLocationWatch(watchId: number): void {
  navigator.geolocation.clearWatch(watchId);
}

/**
 * Convert coordinates to a human-readable address (requires a geocoding service)
 * Note: This is a placeholder. In production, you'd use a service like Google Maps Geocoding API
 * @param coordinates The coordinates to convert
 * @returns Promise resolving to an address string
 */
export async function coordinatesToAddress(
  coordinates: GeolocationCoordinates
): Promise<string> {
  return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(
    6
  )}`;
}

/**
 * Request location permission from the user
 * @returns Promise resolving to whether permission was granted
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (!navigator.permissions) {
    try {
      await getCurrentLocation();
      return true;
    } catch {
      return false;
    }
  }

  try {
    const permission = await navigator.permissions.query({
      name: "geolocation",
    });
    return permission.state === "granted";
  } catch {
    return false;
  }
}
