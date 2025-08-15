import { Layout } from "@/components/Layout";
import { ShiftCard } from "@/components/ShiftCard";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import {
  GET_DASHBOARD_STATS,
  GET_MY_CURRENT_SHIFT,
  GET_MY_SHIFTS,
  GET_ORGANIZATIONS,
} from "@/lib/graphql/queries";
import { formatTime, isToday } from "@/lib/utils";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import {
  Button,
  Card,
  Col,
  Flex,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";

const { Title, Text } = Typography;

export default function Dashboard() {
  const { user, isManager, isLoading } = useAuth();
  const { currentLocation, refreshLocation, permissionStatus } = useLocation();
  const [locationLoading, setLocationLoading] = useState(false);

  const { data: orgData } = useQuery(GET_ORGANIZATIONS);

  const userOrganization = orgData?.organizations?.find((org: any) =>
    org.users?.some((u: any) => u.email === user?.email)
  );

  const { data: currentShiftData, loading: shiftLoading } =
    useQuery(GET_MY_CURRENT_SHIFT);

  const { data: shiftsData, loading: shiftsLoading } = useQuery(GET_MY_SHIFTS, {
    variables: { limit: 5, offset: 0 },
  });

  const { data: statsData, loading: statsLoading } = useQuery(
    GET_DASHBOARD_STATS,
    {
      variables: { organizationId: userOrganization?.id },
      skip: !userOrganization?.id,
    }
  );

  const currentShift = currentShiftData?.myCurrentShift;
  const recentShifts = shiftsData?.myShifts || [];
  const stats = statsData?.dashboardStats;

  const handleRefreshLocation = async () => {
    setLocationLoading(true);
    try {
      await refreshLocation(true);
    } catch (error) {
      console.error("Failed to refresh location:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    if (user && !permissionStatus.granted && !permissionStatus.denied) {
      refreshLocation();
    }
  }, [user, permissionStatus, refreshLocation]);

  const handleClockOut = () => {
    window.location.href = "/clock-out";
  };

  if (isLoading) {
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
          <Text>Please log in to access your dashboard.</Text>
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <Space
        direction="vertical"
        size="large"
        style={{ width: "100%", padding: "1rem" }}
      >
        <Flex justify="space-between" align="center">
          <Title level={2}>Welcome back, {user.name || user.email}!</Title>
          <Text type="secondary">{formatTime(new Date())}</Text>
        </Flex>

        {/* Current Status Section */}
        <Card
          title={
            <Space>
              <ClockCircleOutlined />
              <Title level={3} style={{ margin: 0 }}>
                Current Status
              </Title>
            </Space>
          }
        >
          {shiftLoading ? (
            <Flex justify="center" align="center" style={{ padding: "2rem" }}>
              <Spin size="large" />
              <Text style={{ marginLeft: "1rem" }}>
                Loading shift status...
              </Text>
            </Flex>
          ) : currentShift ? (
            <ShiftCard shift={currentShift} onClockOut={handleClockOut} />
          ) : (
            <Flex align="center" justify="center" style={{ padding: "2rem" }}>
              <Space direction="vertical" align="center">
                <Text>You are currently clocked out</Text>
                <Button
                  type="primary"
                  onClick={() => (window.location.href = "/clock-in")}
                >
                  Clock In
                </Button>
              </Space>
            </Flex>
          )}
        </Card>

        {/* Dashboard Stats */}
        {userOrganization && (
          <Card
            title={
              <Space>
                <UserOutlined />
                <Title level={3} style={{ margin: 0 }}>
                  Your Stats
                </Title>
              </Space>
            }
          >
            {statsLoading ? (
              <Flex justify="center" align="center" style={{ padding: "2rem" }}>
                <Spin size="large" />
              </Flex>
            ) : (
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Hours This Month"
                    value={stats?.totalClockedInToday || 0}
                    suffix="hrs"
                    valueStyle={{ color: "#3f8600" }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Average Daily Hours"
                    value={stats?.averageHoursPerDay || 0}
                    precision={1}
                    suffix="hrs"
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title="Staff Online"
                    value={stats?.totalStaffClockedIn || 0}
                    valueStyle={{ color: "#cf1322" }}
                  />
                </Col>
              </Row>
            )}
          </Card>
        )}

        {/* Quick Actions */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card
              hoverable
              style={{ textAlign: "center", cursor: "pointer" }}
              onClick={() => (window.location.href = "/clock-in")}
            >
              <Space direction="vertical" align="center">
                <ClockCircleOutlined
                  style={{ fontSize: "32px", color: "#52c41a" }}
                />
                <Title level={4} style={{ margin: 0 }}>
                  Clock In
                </Title>
                <Text type="secondary">Start your shift</Text>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              hoverable
              style={{ textAlign: "center", cursor: "pointer" }}
              onClick={() => (window.location.href = "/clock-out")}
            >
              <Space direction="vertical" align="center">
                <ClockCircleOutlined
                  style={{ fontSize: "32px", color: "#ff4d4f" }}
                />
                <Title level={4} style={{ margin: 0 }}>
                  Clock Out
                </Title>
                <Text type="secondary">End your shift</Text>
              </Space>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              hoverable
              style={{ textAlign: "center", cursor: "pointer" }}
              onClick={() => (window.location.href = "/history")}
            >
              <Space direction="vertical" align="center">
                <HistoryOutlined
                  style={{ fontSize: "32px", color: "#1890ff" }}
                />
                <Title level={4} style={{ margin: 0 }}>
                  History
                </Title>
                <Text type="secondary">View past shifts</Text>
              </Space>
            </Card>
          </Col>

          {isManager && (
            <Col xs={24} sm={12} md={8}>
              <Card
                hoverable
                style={{ textAlign: "center", cursor: "pointer" }}
                onClick={() => (window.location.href = "/admin")}
              >
                <Space direction="vertical" align="center">
                  <UserOutlined
                    style={{ fontSize: "32px", color: "#1890ff" }}
                  />
                  <Title level={4} style={{ margin: 0 }}>
                    Manage Staff
                  </Title>
                  <Text type="secondary">Admin dashboard</Text>
                </Space>
              </Card>
            </Col>
          )}
        </Row>

        {/* Location Status */}
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
          {permissionStatus.granted && currentLocation ? (
            <Space direction="vertical">
              <Text>📍 Location detected</Text>
              <Text type="secondary">
                {currentLocation.latitude.toFixed(6)},{" "}
                {currentLocation.longitude.toFixed(6)}
              </Text>
            </Space>
          ) : permissionStatus.denied ? (
            <Space direction="vertical">
              <Text type="danger">❌ Location access denied</Text>
              <Text type="secondary">
                Please enable location access to use clock in/out features
              </Text>
            </Space>
          ) : (
            <Space direction="vertical">
              <Text type="warning">⚠️ Location access needed</Text>
              <Button
                onClick={() => refreshLocation(false)}
                style={{ marginTop: "8px" }}
              >
                Enable Location
              </Button>
            </Space>
          )}
        </Card>

        {/* Recent Activity */}
        {recentShifts.length > 0 && (
          <Card
            title={
              <Space>
                <HistoryOutlined />
                <Title level={3} style={{ margin: 0 }}>
                  Today&apos;s Activity
                </Title>
              </Space>
            }
          >
            {recentShifts
              .filter((shift: any) => isToday(new Date(shift.clockInTime)))
              .map((shift: any) => (
                <ShiftCard key={shift.id} shift={shift} showActions={false} />
              ))}
          </Card>
        )}
      </Space>
    </Layout>
  );
}
