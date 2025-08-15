import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import {
  CLOCK_OUT_MUTATION,
  GET_MY_CURRENT_SHIFT,
} from "@/lib/graphql/queries";
import { calculateDuration, formatTime } from "@/lib/utils";
import { ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Input,
  notification,
  Row,
  Space,
  Spin,
  Statistic,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ClockOut() {
  const { user, isLoading } = useAuth();
  const {
    currentLocation,
    refreshLocation,
    permissionStatus,
    getQuickLocation,
  } = useLocation();
  const [note, setNote] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const initializeLocation = async () => {
      if (permissionStatus.granted && !currentLocation) {
        setLocationLoading(true);
        try {
          await refreshLocation();
          setLocationError(null);
        } catch (error) {
          console.error("Error getting initial location:", error);
          setLocationError("Failed to get initial location");
        } finally {
          setLocationLoading(false);
        }
      } else if (permissionStatus.denied) {
        setLocationError(
          "Location permission denied. Please enable location access."
        );
      } else if (permissionStatus.prompt) {
        setLocationError(
          "Location permission required. Click 'Refresh Location' to grant access."
        );
      }
    };

    initializeLocation();
  }, [permissionStatus, currentLocation, refreshLocation]);

  const {
    data: currentShiftData,
    loading: shiftLoading,
    refetch: refetchCurrentShift,
  } = useQuery(GET_MY_CURRENT_SHIFT);

  const [clockOut, { loading: isClockingOut }] = useMutation(
    CLOCK_OUT_MUTATION,
    {
      onCompleted: (data) => {
        notification.success({
          message: "Clocked Out Successfully!",
          description: `Shift completed. Duration: ${Math.floor(
            data.clockOut.duration / 60
          )} minutes`,
          placement: "topRight",
        });
        setNote("");

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      },
      onError: (error) => {
        notification.error({
          message: "Clock Out Failed",
          description: error.message,
          placement: "topRight",
        });
      },
    }
  );

  const currentShift = currentShiftData?.myCurrentShift;

  const shiftDuration = currentShift
    ? Math.floor(
        (Date.now() - new Date(currentShift.clockInTime).getTime()) /
          (1000 * 60)
      )
    : 0;

  const handleRefreshLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      if (permissionStatus.prompt || permissionStatus.denied) {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });
        if (permission.state === "denied") {
          setLocationError(
            "Location permission denied. Please enable location access in your browser settings."
          );
          return;
        }
      }

      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          await refreshLocation(true);
          setLocationError(null);
          break;
        } catch (error) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw error;
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    } catch (error: any) {
      console.error("Location refresh failed:", error);
      if (error.message?.includes("denied")) {
        setLocationError(
          "Location permission denied. Please enable location access."
        );
      } else if (error.message?.includes("timeout")) {
        setLocationError("Location request timed out. Please try again.");
      } else {
        setLocationError(
          "Failed to get location. Please check your GPS and try again."
        );
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      let location = currentLocation;

      if (!location) {
        location = await getQuickLocation();
      }

      if (!location) {
        await refreshLocation(true);
        location = currentLocation;
      }

      if (!location) {
        setLocationError(
          "Unable to get your current location. Please enable location access and try again."
        );
        notification.error({
          message: "Location Required",
          description:
            "Location is required to clock out. Please enable location access and try again.",
          placement: "topRight",
        });
        return;
      }

      if (!currentShift) {
        notification.error({
          message: "No Active Shift",
          description: "No active shift found to clock out from.",
          placement: "topRight",
        });
        return;
      }

      await clockOut({
        variables: {
          input: {
            shiftId: currentShift.id,
            latitude: location.latitude,
            longitude: location.longitude,
            address: `${location.latitude.toFixed(
              6
            )}, ${location.longitude.toFixed(6)}`,
            note: note.trim() || undefined,
          },
        },
      });
    } catch (error: any) {
      console.error("Clock out error:", error);
      setLocationError("Failed to clock out. Please try again.");
      notification.error({
        message: "Clock Out Failed",
        description:
          error.message || "An unexpected error occurred. Please try again.",
        placement: "topRight",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  if (locationLoading) {
    return (
      <Layout>
        <Flex align="center" justify="center" style={{ padding: "2rem" }}>
          <Spin />
        </Flex>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <Flex align="center" justify="center" style={{ padding: "2rem" }}>
          <Text>Please log in to clock out.</Text>
        </Flex>
      </Layout>
    );
  }

  if (shiftLoading) {
    return (
      <Layout>
        <Flex align="center" justify="center" style={{ padding: "2rem" }}>
          <Spin size="large" />
          <Text style={{ marginLeft: "1rem" }}>Loading shift data...</Text>
        </Flex>
      </Layout>
    );
  }

  if (!currentShift) {
    return (
      <Layout title="Clock Out">
        <Flex align="center" justify="center" style={{ padding: "2rem" }}>
          <Card style={{ textAlign: "center" }}>
            <Space direction="vertical" size="large">
              <Text style={{ fontSize: "18px" }}>
                You are not currently clocked in
              </Text>
              <Button
                type="primary"
                onClick={() => (window.location.href = "/dashboard")}
              >
                Go to Dashboard
              </Button>
            </Space>
          </Card>
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout title="Clock Out">
      <div style={{ padding: "1rem", maxWidth: "800px", margin: "0 auto" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Space>
            <ClockCircleOutlined
              style={{ fontSize: "24px", color: "#ff4d4f" }}
            />
            <Title level={2} style={{ margin: 0 }}>
              Clock Out
            </Title>
          </Space>

          {/* Current Shift Info */}
          <Card style={{ backgroundColor: "#52c41a" }}>
            <Title level={3} style={{ margin: "0 0 1rem 0", color: "white" }}>
              Current Shift
            </Title>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Statistic
                  title={<span style={{ color: "white" }}>Clocked in at</span>}
                  value={formatTime(currentShift.clockInTime)}
                  valueStyle={{ color: "white" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={<span style={{ color: "white" }}>Duration</span>}
                  value={`${Math.floor(shiftDuration / 60)}h ${
                    shiftDuration % 60
                  }m`}
                  valueStyle={{ color: "white" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={<span style={{ color: "white" }}>Location</span>}
                  value={currentShift.clockInAddress || "Unknown"}
                  valueStyle={{ color: "white" }}
                />
              </Col>
            </Row>

            {currentShift.clockInNote && (
              <>
                <Divider
                  style={{ backgroundColor: "white", margin: "1rem 0" }}
                />
                <Text style={{ color: "white" }}>
                  <strong>Start note:</strong> {currentShift.clockInNote}
                </Text>
              </>
            )}
          </Card>

          {/* Location Status */}
          <Card
            title={
              <Space>
                <EnvironmentOutlined />
                <Title level={3} style={{ margin: 0 }}>
                  Current Location
                </Title>
              </Space>
            }
          >
            {locationError ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text type="danger">❌ {locationError}</Text>
                <Button
                  type="primary"
                  onClick={handleRefreshLocation}
                  loading={locationLoading}
                >
                  Refresh Location
                </Button>
              </Space>
            ) : !permissionStatus.granted ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text type="danger">❌ Location permission required</Text>
                <Text type="secondary" style={{ marginBottom: "1rem" }}>
                  Please enable location access to clock out
                </Text>
                <Button
                  type="primary"
                  onClick={handleRefreshLocation}
                  loading={locationLoading}
                >
                  Enable Location Access
                </Button>
              </Space>
            ) : !currentLocation ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text type="warning">📍 Getting your location...</Text>
                <Button
                  onClick={handleRefreshLocation}
                  loading={locationLoading}
                  style={{ marginTop: "8px" }}
                >
                  Refresh Location
                </Button>
              </Space>
            ) : (
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text type="success">✅ Location detected</Text>
                <Text type="secondary">
                  {currentLocation.latitude.toFixed(6)},{" "}
                  {currentLocation.longitude.toFixed(6)}
                </Text>
                <Button
                  onClick={handleRefreshLocation}
                  loading={locationLoading}
                  style={{ marginTop: "8px" }}
                >
                  Refresh Location
                </Button>
              </Space>
            )}
          </Card>

          {/* Clock Out Form */}
          <Card
            title={
              <Title level={3} style={{ margin: 0 }}>
                Clock Out Details
              </Title>
            }
          >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div>
                <Text style={{ display: "block", marginBottom: "8px" }}>
                  Add a note (optional):
                </Text>
                <TextArea
                  placeholder="How was your shift? Any notes to add..."
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
                  danger
                  loading={isClockingOut}
                  onClick={handleClockOut}
                  disabled={!currentLocation || isClockingOut}
                  icon={<ClockCircleOutlined />}
                >
                  {isClockingOut ? "Clocking Out..." : "Clock Out Now"}
                </Button>
              </Flex>
            </Space>
          </Card>

          {/* Current Time Display */}
          <Card style={{ backgroundColor: "#ff4d4f", color: "white" }}>
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
