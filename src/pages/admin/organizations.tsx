import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  CREATE_LOCATION,
  CREATE_ORGANIZATION,
  GET_LOCATIONS,
  GET_ORGANIZATIONS,
} from "@/lib/graphql/queries";
import {
  BankOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import React, { useState } from "react";

const { Title, Text } = Typography;

interface Organization {
  id: string;
  name: string;
  allowedRadius: number;
  centerLatitude?: number;
  centerLongitude?: number;
  isActive: boolean;
  users: any[];
  locations: any[];
}

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
  };
}

export default function OrganizationManagement() {
  const { user, isManager } = useAuth();
  const [isOrgModalVisible, setIsOrgModalVisible] = useState(false);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [locationMode, setLocationMode] = useState<"create" | "select">(
    "create"
  );

  const [orgForm] = Form.useForm();
  const [locationForm] = Form.useForm();

  const {
    data: orgsData,
    loading: orgsLoading,
    refetch: refetchOrgs,
  } = useQuery(GET_ORGANIZATIONS);
  const currentOrgId = selectedOrg || user?.organizationId;

  const {
    data: locationsData,
    loading: locationsLoading,
    refetch: refetchLocations,
  } = useQuery(GET_LOCATIONS, {
    variables: { organizationId: currentOrgId! },
    skip: !currentOrgId,
  });

  const [createOrganization, { loading: creatingOrg }] = useMutation(
    CREATE_ORGANIZATION,
    {
      onCompleted: () => {
        message.success("Organization created successfully!");
        setIsOrgModalVisible(false);
        orgForm.resetFields();
        refetchOrgs();
      },
      onError: (error) => {
        message.error(`Error creating organization: ${error.message}`);
      },
    }
  );

  const [createLocation, { loading: creatingLocation }] = useMutation(
    CREATE_LOCATION,
    {
      onCompleted: () => {
        message.success("Location created successfully!");
        setIsLocationModalVisible(false);
        locationForm.resetFields();
        refetchLocations();
      },
      onError: (error) => {
        message.error(`Error creating location: ${error.message}`);
      },
    }
  );

  if (!user) {
    return (
      <Layout>
        <Alert
          message="Authentication Required"
          description="Please log in to access organization management."
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
          description="You need manager privileges to manage organizations."
          type="error"
          showIcon
        />
      </Layout>
    );
  }

  const organizations: Organization[] = orgsData?.organizations || [];
  const locations: Location[] = locationsData?.locations || [];

  const currentOrganization = organizations.find(
    (org) => org.id === (selectedOrg || user?.organizationId)
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

  const handleCreateLocation = async (values: any) => {
    await createLocation({
      variables: {
        input: {
          organizationId: selectedOrg || user?.organizationId,
          name: values.name,
          latitude: values.latitude,
          longitude: values.longitude,
          radius: values.radius,
        },
      },
    });
  };

  const orgColumns = [
    {
      title: "Organization",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Organization) => (
        <Space>
          <BankOutlined />
          <div>
            <div>{name}</div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.users?.length || 0} staff members
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Allowed Radius",
      dataIndex: "allowedRadius",
      key: "allowedRadius",
      render: (radius: number) => `${radius}m`,
    },
    {
      title: "Center Location",
      key: "center",
      render: (_: any, record: Organization) => {
        if (record.centerLatitude && record.centerLongitude) {
          return `${record.centerLatitude.toFixed(
            4
          )}, ${record.centerLongitude.toFixed(4)}`;
        }
        return "Not set";
      },
    },
    {
      title: "Locations",
      dataIndex: "locations",
      key: "locations",
      render: (locations: any[]) => locations?.length || 0,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Organization) => (
        <Button
          type="link"
          icon={<EnvironmentOutlined />}
          onClick={() => {
            setSelectedOrg(record.id);
            setIsLocationModalVisible(true);
          }}
        >
          Add Location
        </Button>
      ),
    },
  ];

  const locationColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <Space>
          <EnvironmentOutlined />
          {name}
        </Space>
      ),
    },
    {
      title: "Coordinates",
      key: "coordinates",
      render: (_: any, record: Location) =>
        `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}`,
    },
    {
      title: "Radius",
      dataIndex: "radius",
      key: "radius",
      render: (radius: number) => `${radius}m`,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  return (
    <Layout title="Organization Management">
      <div style={{ padding: "1rem" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={2}>Organization Management</Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsOrgModalVisible(true)}
            >
              Create Organization
            </Button>
          </div>

          {/* Organizations Table */}
          <Card title="Organizations">
            <Table
              columns={orgColumns}
              dataSource={organizations}
              rowKey="id"
              loading={orgsLoading}
              pagination={{ pageSize: 10 }}
            />
          </Card>

          {/* Locations Table */}
          <Card
            title={
              <Space>
                <span>Locations</span>
                {currentOrganization && (
                  <Tag color="blue">{currentOrganization.name}</Tag>
                )}
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsLocationModalVisible(true)}
                disabled={!user?.organizationId}
              >
                Add Location
              </Button>
            }
          >
            <Table
              columns={locationColumns}
              dataSource={locations}
              rowKey="id"
              loading={locationsLoading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Space>
      </div>

      {/* Create Organization Modal */}
      <Modal
        title="Create New Organization"
        open={isOrgModalVisible}
        onCancel={() => setIsOrgModalVisible(false)}
        footer={null}
      >
        <Form
          form={orgForm}
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
            <Input placeholder="Enter organization name" />
          </Form.Item>

          <Form.Item
            name="allowedRadius"
            label="Allowed Radius (meters)"
            rules={[{ required: true, message: "Please enter allowed radius" }]}
          >
            <InputNumber
              min={50}
              max={10000}
              placeholder="2000"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="centerLatitude" label="Center Latitude">
                <InputNumber
                  min={-90}
                  max={90}
                  step={0.000001}
                  placeholder="40.7128"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="centerLongitude" label="Center Longitude">
                <InputNumber
                  min={-180}
                  max={180}
                  step={0.000001}
                  placeholder="-74.0060"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button onClick={() => setIsOrgModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={creatingOrg}>
                Create Organization
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Location Modal */}
      <Modal
        title="Add New Location"
        open={isLocationModalVisible}
        onCancel={() => {
          setIsLocationModalVisible(false);
          setLocationMode("create");
          locationForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        {/* Show existing locations for reference */}
        {locations.length > 0 && (
          <Card
            title="Existing Locations"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {locations.map((location) => (
                <div
                  key={location.id}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #f0f0f0",
                    marginBottom: 8,
                    borderRadius: 6,
                    backgroundColor: "#fafafa",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setLocationMode("select");
                    locationForm.setFieldsValue({
                      name: location.name,
                      latitude: location.latitude,
                      longitude: location.longitude,
                      radius: location.radius,
                    });
                  }}
                >
                  <Space>
                    <EnvironmentOutlined />
                    <div>
                      <div style={{ fontWeight: 500 }}>{location.name}</div>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {location.organization?.name} •{" "}
                        {location.latitude.toFixed(4)},{" "}
                        {location.longitude.toFixed(4)} • {location.radius}m
                        radius
                      </Text>
                    </div>
                  </Space>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Form
          form={locationForm}
          layout="vertical"
          onFinish={handleCreateLocation}
        >
          <Form.Item label="Location Option">
            <Radio.Group
              value={locationMode}
              onChange={(e) => setLocationMode(e.target.value)}
            >
              <Radio value="create">Create New Location</Radio>
              {locations.length > 0 && (
                <Radio value="select">Use Existing Location as Template</Radio>
              )}
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="name"
            label="Location Name"
            rules={[{ required: true, message: "Please enter location name" }]}
          >
            <Input placeholder="Main Hospital, Building A, etc." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="latitude"
                label="Latitude"
                rules={[{ required: true, message: "Please enter latitude" }]}
              >
                <InputNumber
                  min={-90}
                  max={90}
                  step={0.000001}
                  placeholder="40.7128"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="longitude"
                label="Longitude"
                rules={[{ required: true, message: "Please enter longitude" }]}
              >
                <InputNumber
                  min={-180}
                  max={180}
                  step={0.000001}
                  placeholder="-74.0060"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="radius"
            label="Check-in Radius (meters)"
            rules={[{ required: true, message: "Please enter radius" }]}
          >
            <InputNumber
              min={10}
              max={5000}
              placeholder="100"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setIsLocationModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={creatingLocation}
              >
                Add Location
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
