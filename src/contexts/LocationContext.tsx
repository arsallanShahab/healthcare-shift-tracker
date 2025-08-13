import { getCurrentLocation, requestLocationPermission } from "@/lib/location";
import { GeolocationCoordinates, LocationPermissionStatus } from "@/types";
import React, { createContext, useContext, useEffect, useState } from "react";

interface LocationState {
  currentLocation: GeolocationCoordinates | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: LocationPermissionStatus;
}

interface LocationContextType extends LocationState {
  refreshLocation: (highAccuracy?: boolean) => Promise<void>;
  requestPermission: () => Promise<boolean>;
  getQuickLocation: () => Promise<GeolocationCoordinates | null>;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<LocationState>({
    currentLocation: null,
    isLoading: false,
    error: null,
    permissionStatus: {
      granted: false,
      denied: false,
      prompt: true,
    },
  });

  const checkPermissionStatus = async () => {
    if (!navigator.permissions) {
      setState((prev) => ({
        ...prev,
        permissionStatus: { granted: false, denied: false, prompt: true },
      }));
      return;
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      setState((prev) => ({
        ...prev,
        permissionStatus: {
          granted: permission.state === "granted",
          denied: permission.state === "denied",
          prompt: permission.state === "prompt",
        },
      }));
    } catch (error) {
      console.error("Error checking location permission:", error);
    }
  };

  const refreshLocation = async (highAccuracy: boolean = false) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const location = await getCurrentLocation(highAccuracy);
      setState((prev) => ({
        ...prev,
        currentLocation: location,
        isLoading: false,
        permissionStatus: { granted: true, denied: false, prompt: false },
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get location";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        permissionStatus: { granted: false, denied: true, prompt: false },
      }));
    }
  };

  const getQuickLocation = async (): Promise<GeolocationCoordinates | null> => {
    try {
      if (state.currentLocation) {
        return state.currentLocation;
      }

      const location = await getCurrentLocation(false);

      setState((prev) => ({
        ...prev,
        currentLocation: location,
        permissionStatus: { granted: true, denied: false, prompt: false },
      }));

      return location;
    } catch (error) {
      console.error("Quick location failed:", error);
      return null;
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    const granted = await requestLocationPermission();

    setState((prev) => ({
      ...prev,
      permissionStatus: {
        granted,
        denied: !granted,
        prompt: false,
      },
    }));

    if (granted) {
      await refreshLocation();
    }

    return granted;
  };

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const value: LocationContextType = {
    ...state,
    refreshLocation,
    requestPermission,
    getQuickLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
