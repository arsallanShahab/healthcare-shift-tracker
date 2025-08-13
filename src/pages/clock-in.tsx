import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import {
  CLOCK_IN_MUTATION,
  GET_MY_CURRENT_SHIFT,
  GET_ORGANIZATIONS,
} from "@/lib/graphql/queries";
import { isWithinRadius } from "@/lib/location";
import { GeolocationCoordinates } from "@/types";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import {
  Alert,
  Button,
  Card,
  Flex,
  Input,
  notification,
  Space,
  Spin,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ClockIn() {
  const { user, isLoading } = useAuth();
  const {
    currentLocation,
    refreshLocation,
    permissionStatus,
    getQuickLocation,
    requestPermission,
    isLoading: locationContextLoading,
    error: locationError,
  } = useLocation();
  const [note, setNote] = useState("");
  const [isWithinArea, setIsWithinArea] = useState<boolean | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationInitialized, setLocationInitialized] = useState(false);

  const { data: orgData } = useQuery(GET_ORGANIZATIONS);

  const {
    data: currentShiftData,
    loading: shiftLoading,
    refetch: refetchCurrentShift,
  } = useQuery(GET_MY_CURRENT_SHIFT);

  const [clockIn, { loading: isClockingIn }] = useMutation(CLOCK_IN_MUTATION, {
    onCompleted: (data) => {
      notification.success({
        message: "Clocked In Successfully!",
        description: `You have successfully clocked in at ${new Date(
          data.clockIn.clockInTime
        ).toLocaleTimeString()}`,
        placement: "topRight",
      });
      setNote("");
      refetchCurrentShift();
    },
    onError: (error) => {
      notification.error({
        message: "Clock In Failed",
        description: error.message,
        placement: "topRight",
      });
    },
  });

  const currentShift = currentShiftData?.myCurrentShift;
  const userOrganization = orgData?.organizations?.find((org: any) =>
    org.users?.some((u: any) => u.email === user?.email)
  );

  useEffect(() => {
    const initializeLocation = async () => {
      if (!locationInitialized && !locationContextLoading) {
        setLocationInitialized(true);

        if (permissionStatus.prompt) {
          console.log("Requesting location permission...");
          try {
            await requestPermission();
          } catch (error) {
            console.error("Failed to request permission:", error);
          }
        }

        if (permissionStatus.granted && !currentLocation) {
          console.log("Permission granted, getting location...");
          try {
            await refreshLocation(false);
          } catch (error) {
            console.error("Failed to get initial location:", error);
          }
        }
      }
    };

    initializeLocation();
  }, [
    locationInitialized,
    locationContextLoading,
    permissionStatus,
    currentLocation,
    requestPermission,
    refreshLocation,
  ]);

  useEffect(() => {
    if (currentLocation && userOrganization) {
      const hospitalLocation: GeolocationCoordinates = {
        latitude: userOrganization.centerLatitude,
        longitude: userOrganization.centerLongitude,
      };

      const withinArea = isWithinRadius(
        currentLocation,
        hospitalLocation,
        userOrganization.allowedRadius
      );
      console.log("User is within allowed area:", withinArea);
      setIsWithinArea(withinArea);
    }
  }, [currentLocation, userOrganization]);

  const handleRefreshLocation = async () => {
    setLocationLoading(true);

    try {
      if (permissionStatus.denied) {
        console.log("Permission denied, requesting permission...");
        const granted = await requestPermission();
        if (!granted) {
          notification.error({
            message: "Location Permission Required",
            description:
              "Please enable location access in your browser settings to clock in.",
            placement: "topRight",
            duration: 5,
          });
          setLocationLoading(false);
          return;
        }
      }

      console.log("Refreshing location...");
      await refreshLocation(true);

      notification.success({
        message: "Location Updated",
        description: "Your location has been successfully updated.",
        placement: "topRight",
      });
    } catch (error) {
      console.error("Failed to refresh location:", error);
      notification.error({
        message: "Location Error",
        description: "Failed to get your current location. Please try again.",
        placement: "topRight",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const handleClockIn = async () => {
    setLocationLoading(true);

    try {
      let location = currentLocation;

      if (!location) {
        console.log("No cached location, trying to get quick location...");
        location = await getQuickLocation();
      }

      if (!location && permissionStatus.granted) {
        console.log("No location from quick method, trying high accuracy...");
        try {
          await refreshLocation(true);
          location = currentLocation;
        } catch (error) {
          console.error("High accuracy location failed:", error);
        }
      }

      setLocationLoading(false);

      if (!location) {
        let errorMessage = "Unable to get your current location.";

        if (permissionStatus.denied) {
          errorMessage =
            "Location permission is required. Please enable location access and try again.";
        } else if (permissionStatus.prompt) {
          errorMessage = "Please allow location access to clock in.";
        }

        notification.error({
          message: "Location Required",
          description: errorMessage,
          placement: "topRight",
          duration: 5,
        });
        return;
      }

      if (!isWithinArea) {
        notification.error({
          message: "Location Error",
          description: "You must be within the allowed area to clock in.",
          placement: "topRight",
        });
        return;
      }

      if (!userOrganization) {
        notification.error({
          message: "Organization Error",
          description: "You must be assigned to an organization to clock in.",
          placement: "topRight",
        });
        return;
      }

      await clockIn({
        variables: {
          input: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: `${location.latitude.toFixed(
              6
            )}, ${location.longitude.toFixed(6)}`,
            note: note.trim() || undefined,
            organizationId: userOrganization.id,
          },
        },
      });

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error) {
      console.error("Clock in error:", error);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Flex align="center" justify="center" style={{ padding: "2rem" }}>
          <Spin />
          <Text style={{ marginLeft: "1rem" }}>
            Loading user information...
          </Text>
        </Flex>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <Flex align="center" justify="center" style={{ padding: "2rem" }}>
          <Text>Please log in to clock in.</Text>
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout title="Clock In">
      <div style={{ padding: "1rem", maxWidth: "800px", margin: "0 auto" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Space>
            <ClockCircleOutlined style={{ fontSize: "24px" }} />
            <Title level={2} style={{ margin: 0 }}>
              Clock In
            </Title>
          </Space>

          {/* Show loading while fetching shift data */}
          {shiftLoading && (
            <Card>
              <Flex justify="center" align="center" style={{ padding: "2rem" }}>
                <Spin size="large" />
                <Text style={{ marginLeft: "1rem" }}>
                  Loading shift status...
                </Text>
              </Flex>
            </Card>
          )}

          {/* Show if user is already clocked in */}
          {currentShift && (
            <Alert
              message="Already Clocked In"
              description={`You are currently clocked in since ${new Date(
                currentShift.clockInTime
              ).toLocaleString()}. Please clock out before clocking in again.`}
              type="warning"
              showIcon
              action={
                <Button
                  size="small"
                  onClick={() => (window.location.href = "/clock-out")}
                >
                  Go to Clock Out
                </Button>
              }
            />
          )}

          {/* Location Status Card */}
          <Card
            title={
              <Space>
                <EnvironmentOutlined />
                <Title level={3} style={{ margin: 0 }}>
                  Location Status
                </Title>
              </Space>
            }
          >
            {permissionStatus.denied ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text type="danger">❌ Location permission denied</Text>
                <Text type="secondary" style={{ marginBottom: "1rem" }}>
                  Please enable location access in your browser settings and
                  refresh the page
                </Text>
                <Button
                  type="primary"
                  onClick={handleRefreshLocation}
                  loading={locationLoading}
                >
                  Request Permission Again
                </Button>
              </Space>
            ) : permissionStatus.prompt ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text type="warning">📍 Location permission required</Text>
                <Text type="secondary" style={{ marginBottom: "1rem" }}>
                  Please allow location access to clock in
                </Text>
                <Button
                  type="primary"
                  onClick={handleRefreshLocation}
                  loading={locationLoading}
                >
                  Enable Location Access
                </Button>
              </Space>
            ) : (locationContextLoading || locationLoading) &&
              !currentLocation ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                <Spin />
                <Text type="secondary">Getting your location...</Text>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  This may take a few moments
                </Text>
              </Space>
            ) : !currentLocation ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text type="warning">📍 Unable to get location</Text>
                {locationError && (
                  <Text type="danger" style={{ fontSize: "12px" }}>
                    Error: {locationError}
                  </Text>
                )}
                <Button
                  onClick={handleRefreshLocation}
                  loading={locationLoading}
                  type="primary"
                >
                  Try Again
                </Button>
              </Space>
            ) : (
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Space>
                  {isWithinArea ? (
                    <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  ) : (
                    <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
                  )}
                  <Text>
                    {isWithinArea
                      ? "✅ You are within the allowed area"
                      : "❌ You are outside the allowed area"}
                  </Text>
                </Space>

                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Current location: {currentLocation.latitude.toFixed(6)},{" "}
                  {currentLocation.longitude.toFixed(6)}
                  {currentLocation.accuracy && (
                    <span> (±{Math.round(currentLocation.accuracy)}m)</span>
                  )}
                </Text>

                {!isWithinArea && userOrganization && (
                  <Text type="danger" style={{ fontSize: "12px" }}>
                    You must be within {userOrganization.allowedRadius}m of the
                    workplace to clock in
                  </Text>
                )}

                <Button
                  onClick={handleRefreshLocation}
                  loading={locationLoading}
                  size="small"
                  style={{ alignSelf: "flex-start" }}
                >
                  Refresh Location
                </Button>
              </Space>
            )}
          </Card>

          {/* Clock In Form */}
          <Card
            title={
              <Title level={3} style={{ margin: 0 }}>
                Clock In Details
              </Title>
            }
          >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div>
                <Text style={{ display: "block", marginBottom: "8px" }}>
                  Add a note (optional):
                </Text>
                <TextArea
                  placeholder="Enter any notes about your shift..."
                  value={note}
                  onChange={(event: any) => setNote(event.target.value)}
                  rows={3}
                />
              </div>

              <Flex justify="flex-end" gap="middle">
                <Button onClick={() => (window.location.href = "/dashboard")}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  loading={isClockingIn}
                  onClick={handleClockIn}
                  disabled={!currentLocation || !isWithinArea || isClockingIn}
                  icon={<ClockCircleOutlined />}
                >
                  {isClockingIn ? "Clocking In..." : "Clock In Now"}
                </Button>
              </Flex>
            </Space>
          </Card>

          {/* Current Time Display */}
          <Card style={{ backgroundColor: "#1890ff", color: "white" }}>
            <Flex justify="center" align="center">
              <Text
                style={{ fontSize: "18px", fontWeight: "bold", color: "white" }}
              >
                Current Time: {new Date().toLocaleTimeString()}
              </Text>
            </Flex>
          </Card>
        </Space>
      </div>
    </Layout>
  );
}
