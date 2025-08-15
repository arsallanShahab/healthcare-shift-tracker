import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  GET_ORGANIZATION_STAFF,
  UPDATE_USER_ROLE,
} from "@/lib/graphql/queries";
import { UserRole } from "@/types";
import { CrownOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Card,
  Flex,
  message,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import React from "react";

const { Title, Text } = Typography;
const { Option } = Select;

export default function UsersManagement() {
  const { user, isManager, isLoading } = useAuth();
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);

  const { data, loading, refetch } = useQuery(GET_ORGANIZATION_STAFF, {
    variables: { organizationId: user?.organizationId || "" },
    skip: !user?.organizationId,
  });

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole({
        variables: { userId, role: newRole },
      });
      message.success("User role updated successfully!");
      refetch();
    } catch (error) {
      message.error("Failed to update user role");
      console.error(error);
    }
  };

  const getRoleTag = (role: UserRole) => {
    switch (role) {
      case UserRole.MANAGER:
        return (
          <Tag color="gold" icon={<CrownOutlined />}>
            Manager
          </Tag>
        );
      case UserRole.CARE_WORKER:
        return (
          <Tag color="blue" icon={<TeamOutlined />}>
            Care Worker
          </Tag>
        );
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <Space>
          <UserOutlined />
          <div>
            <div style={{ fontWeight: 500 }}>{name || "No name"}</div>
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
      render: (role: UserRole) => getRoleTag(role),
    },
    {
      title: "Join Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Total Shifts",
      dataIndex: "shifts",
      key: "totalShifts",
      render: (shifts: any[]) => shifts?.length || 0,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Select
            value={record.role}
            style={{ width: 140 }}
            onChange={(newRole) => handleRoleUpdate(record.id, newRole)}
            disabled={record.id === user?.id}
          >
            <Option value={UserRole.CARE_WORKER}>
              <TeamOutlined /> Care Worker
            </Option>
            <Option value={UserRole.MANAGER}>
              <CrownOutlined /> Manager
            </Option>
          </Select>
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Layout>
        <Flex align="center" justify="center" style={{ padding: "2rem" }}>
          <Spin />
        </Flex>
      </Layout>
    );
  }

  if (!isManager) {
    return (
      <Layout>
        <Card>
          <Text type="danger">
            Access denied. Only managers can view this page.
          </Text>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title="User Management">
      <div style={{ padding: "24px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Card>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Title level={2}>
                  <UserOutlined /> User Management
                </Title>
                <Text type="secondary">
                  Manage user roles and permissions for your organization
                </Text>
              </div>

              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f6f8fa",
                  borderRadius: "8px",
                }}
              >
                <Title level={4}>Role Descriptions:</Title>
                <div style={{ marginBottom: "8px" }}>
                  <Tag color="gold" icon={<CrownOutlined />}>
                    Manager
                  </Tag>
                  <Text>
                    Can manage staff, view all shifts, access admin dashboard
                  </Text>
                </div>
                <div>
                  <Tag color="blue" icon={<TeamOutlined />}>
                    Care Worker
                  </Tag>
                  <Text>Can clock in/out, view own shifts</Text>
                </div>
              </div>

              <Table
                columns={columns}
                dataSource={data?.organizationStaff || []}
                loading={loading}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} users`,
                }}
              />
            </Space>
          </Card>
        </Space>
      </div>
    </Layout>
  );
}
