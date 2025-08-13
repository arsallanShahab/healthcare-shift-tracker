import { Layout } from "@/components/Layout";
import {
  ASSIGN_USER_TO_ORGANIZATION,
  CREATE_ORGANIZATION,
  GET_ALL_USERS,
  GET_ORGANIZATIONS,
} from "@/lib/graphql/queries";
import {
  BankOutlined,
  EnvironmentOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import { useState } from "react";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Setup() {
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  const {
    data: organizationsData,
    refetch: refetchOrganizations,
    loading: orgsLoading,
    error: orgsError,
  } = useQuery(GET_ORGANIZATIONS);
  const {
    data: usersData,
    refetch: refetchUsers,
    loading: usersLoading,
    error: usersError,
  } = useQuery(GET_ALL_USERS);

  const [createOrganization, { loading: creatingOrg }] = useMutation(
    CREATE_ORGANIZATION,
    {
      onCompleted: () => {
        message.success("Organization created successfully!");
        form.resetFields();
        refetchOrganizations();
      },
      onError: (error) => {
        message.error(`Error creating organization: ${error.message}`);
      },
    }
  );

  const [assignUser, { loading: assigning }] = useMutation(
    ASSIGN_USER_TO_ORGANIZATION,
    {
      onCompleted: () => {
        message.success("User assigned to organization successfully!");
        assignForm.resetFields();
        refetchUsers();
        refetchOrganizations(); // Also refetch organizations to update user counts
      },
      onError: (error) => {
        message.error(`Error assigning user: ${error.message}`);
      },
    }
  );

  const handleCreateOrganization = async (values: any) => {
    await createOrganization({
      variables: {
        input: {
          name: values.name,
          centerLatitude: values.centerLatitude,
          centerLongitude: values.centerLongitude,
          allowedRadius: values.allowedRadius,
        },
      },
    });
  };

  const handleAssignUser = async (values: any) => {
    await assignUser({
      variables: {
        userId: values.userId,
        organizationId: values.organizationId,
      },
    });
  };

  const organizationColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Center Location",
      key: "location",
      render: (record: any) => (
        <span>
          {record.centerLatitude && record.centerLongitude
            ? `${record.centerLatitude.toFixed(
                4
              )}, ${record.centerLongitude.toFixed(4)}`
            : "Not set"}
        </span>
      ),
    },
    {
      title: "Allowed Radius",
      dataIndex: "allowedRadius",
      key: "allowedRadius",
      render: (radius: number) => `${radius}m`,
    },
    {
      title: "Staff Count",
      key: "staffCount",
      render: (record: any) => record.users?.length || 0,
    },
  ];

  const userColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Organization",
      key: "organization",
      render: (record: any) => {
        return record.organization?.name || "Unassigned";
      },
    },
  ];

  return (
    <Layout title="System Setup">
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={2} style={{ margin: 0 }}>
              <BankOutlined style={{ marginRight: "8px" }} />
              System Setup
            </Title>
          </div>

          {/* Create Organization */}
          <Card title="Create Organization" size="small">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateOrganization}
            >
              <Form.Item
                name="name"
                label="Organization Name"
                rules={[
                  { required: true, message: "Please enter organization name" },
                ]}
              >
                <Input placeholder="e.g., St. Mary's Hospital" />
              </Form.Item>

              <Form.Item
                name="centerLatitude"
                label="Center Latitude"
                rules={[{ required: true, message: "Please enter latitude" }]}
              >
                <InputNumber
                  placeholder="e.g., 40.7128"
                  style={{ width: "100%" }}
                  step={0.000001}
                />
              </Form.Item>

              <Form.Item
                name="centerLongitude"
                label="Center Longitude"
                rules={[{ required: true, message: "Please enter longitude" }]}
              >
                <InputNumber
                  placeholder="e.g., -74.0060"
                  style={{ width: "100%" }}
                  step={0.000001}
                />
              </Form.Item>

              <Form.Item
                name="allowedRadius"
                label="Allowed Radius (meters)"
                initialValue={2000}
                rules={[{ required: true, message: "Please enter radius" }]}
              >
                <InputNumber
                  placeholder="e.g., 2000"
                  style={{ width: "100%" }}
                  min={100}
                  max={10000}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={creatingOrg}
                icon={<PlusOutlined />}
              >
                Create Organization
              </Button>
            </Form>
          </Card>

          {/* Assign Users to Organizations */}
          {organizationsData?.organizations?.length > 0 && (
            <Card title="Assign User to Organization" size="small">
              <Form
                form={assignForm}
                layout="vertical"
                onFinish={handleAssignUser}
              >
                <Form.Item
                  name="userId"
                  label="Select User"
                  rules={[{ required: true, message: "Please select a user" }]}
                >
                  <Select placeholder="Select a user">
                    {usersData?.allUsers
                      ?.filter((user: any) => !user.organizationId)
                      ?.map((user: any) => (
                        <Option key={user.id} value={user.id}>
                          {user.name} ({user.email}) - {user.role}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="organizationId"
                  label="Select Organization"
                  rules={[
                    {
                      required: true,
                      message: "Please select an organization",
                    },
                  ]}
                >
                  <Select placeholder="Select an organization">
                    {organizationsData?.organizations?.map((org: any) => (
                      <Option key={org.id} value={org.id}>
                        {org.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={assigning}
                  icon={<EnvironmentOutlined />}
                >
                  Assign User
                </Button>
              </Form>
            </Card>
          )}

          <Divider />

          {/* Organizations List */}
          <Card title="Existing Organizations" size="small">
            <Table
              dataSource={organizationsData?.organizations || []}
              columns={organizationColumns}
              rowKey="id"
              pagination={false}
            />
          </Card>

          {/* Users List */}
          <Card title="All Users" size="small">
            <Table
              dataSource={usersData?.allUsers || []}
              columns={userColumns}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Space>
      </div>
    </Layout>
  );
}
