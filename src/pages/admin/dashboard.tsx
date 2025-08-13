import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  GET_CURRENTLY_CLOCKED_IN_STAFF,
  GET_DASHBOARD_STATS,
  GET_ORGANIZATION_STAFF,
} from "@/lib/graphql/queries";
import {
  BarChartOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import {
  Alert,
  Card,
  Col,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import React from "react";

const { Title, Text } = Typography;

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  shifts: any[];
}

interface DashboardStats {
  totalStaffClockedIn: number;
  averageHoursPerDay: number;
  totalClockedInToday: number;
  weeklyHoursByStaff: {
    userId: string;
    userName: string;
    totalHours: number;
  }[];
}

export default function AdminDashboard() {
  const { user, isManager } = useAuth();

  const { data: statsData, loading: statsLoading } = useQuery(
    GET_DASHBOARD_STATS,
    {
      variables: { organizationId: user?.organizationId },
      skip: !user?.organizationId,
    }
  );

  const { data: clockedInData, loading: clockedInLoading } = useQuery(
    GET_CURRENTLY_CLOCKED_IN_STAFF,
    {
      variables: { organizationId: user?.organizationId },
      skip: !user?.organizationId,
    }
  );

  const { data: staffData, loading: staffLoading } = useQuery(
    GET_ORGANIZATION_STAFF,
    {
      variables: { organizationId: user?.organizationId },
      skip: !user?.organizationId,
    }
  );

  if (!user) {
    return (
      <Layout>
        <Alert
          message="Authentication Required"
          description="Please log in to access the admin dashboard."
          type="warning"
          showIcon
        />
      </Layout>
    );
  }

  if (!isManager) {
    return (
      <Layout>
        <Alert
          message="Access Denied"
          description="You need manager privileges to access this dashboard."
          type="error"
          showIcon
        />
      </Layout>
    );
  }

  const stats: DashboardStats = statsData?.dashboardStats;
  const clockedInStaff = clockedInData?.currentlyClockedInStaff || [];
  const allStaff: StaffMember[] = staffData?.organizationStaff || [];

  const staffColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: StaffMember) => (
        <Space>
          <UserOutlined />
          <div>
            <div>{name || "No name"}</div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "MANAGER" ? "blue" : "green"}>{role}</Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: StaffMember) => {
        const isOnShift = clockedInStaff.some(
          (shift: any) => shift.userId === record.id
        );
        return (
          <Tag color={isOnShift ? "success" : "default"}>
            {isOnShift ? "On Shift" : "Off Duty"}
          </Tag>
        );
      },
    },
    {
      title: "Total Shifts",
      key: "totalShifts",
      render: (_: any, record: StaffMember) => record.shifts?.length || 0,
    },
  ];

  return (
    <Layout title="Admin Dashboard">
      <div style={{ padding: "1rem" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={2}>Organization Dashboard</Title>

          {/* Stats Overview */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Currently Clocked In"
                  value={stats?.totalStaffClockedIn || 0}
                  prefix={<ClockCircleOutlined style={{ color: "#52c41a" }} />}
                  loading={statsLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Staff"
                  value={allStaff.length}
                  prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
                  loading={staffLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Avg Hours/Day"
                  value={stats?.averageHoursPerDay || 0}
                  precision={1}
                  prefix={<BarChartOutlined style={{ color: "#faad14" }} />}
                  loading={statsLoading}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Clocked In Today"
                  value={stats?.totalClockedInToday || 0}
                  prefix={<ClockCircleOutlined style={{ color: "#722ed1" }} />}
                  loading={statsLoading}
                />
              </Card>
            </Col>
          </Row>

          {/* Currently Active Shifts */}
          <Card title="Currently Active Shifts">
            {clockedInLoading ? (
              <div>Loading active shifts...</div>
            ) : clockedInStaff.length > 0 ? (
              <Row gutter={[16, 16]}>
                {clockedInStaff.map((shift: any) => (
                  <Col xs={24} sm={12} md={8} key={shift.id}>
                    <Card size="small">
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Text strong>
                          {shift.user.name || shift.user.email}
                        </Text>
                        <Text type="secondary">
                          Started:{" "}
                          {new Date(shift.clockInTime).toLocaleTimeString()}
                        </Text>
                        <Text type="secondary">
                          Location: {shift.clockInAddress || "Unknown"}
                        </Text>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Text type="secondary">No staff currently clocked in</Text>
            )}
          </Card>

          {/* Staff Management */}
          <Card title="Staff Management">
            <Table
              columns={staffColumns}
              dataSource={allStaff}
              rowKey="id"
              loading={staffLoading}
              pagination={{ pageSize: 10 }}
            />
          </Card>

          {/* Weekly Hours Summary */}
          {stats?.weeklyHoursByStaff && stats.weeklyHoursByStaff.length > 0 && (
            <Card title="Weekly Hours Summary">
              <Row gutter={[16, 16]}>
                {stats.weeklyHoursByStaff.map((staffHours) => (
                  <Col xs={24} sm={12} md={8} key={staffHours.userId}>
                    <Card size="small">
                      <Statistic
                        title={staffHours.userName}
                        value={staffHours.totalHours}
                        precision={1}
                        suffix="hours"
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}
        </Space>
      </div>
    </Layout>
  );
}
