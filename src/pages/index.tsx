import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  LoginOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Flex, Row, Space, Spin, Typography } from "antd";
import React from "react";

const { Title, Text } = Typography;

export default function Home() {
  const { user, login, isLoading } = useAuth();

  React.useEffect(() => {
    if (user) {
      window.location.href = "/dashboard";
    }
  }, [user]);

  if (isLoading) {
    return (
      <Layout>
        <Flex align="center" justify="center" style={{ padding: "2rem" }}>
          <Space direction="vertical" align="center">
            <Spin size="large" />
            <Text>Loading...</Text>
          </Space>
        </Flex>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout title="Welcome to Healthcare Shift Tracker">
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* Hero Section */}
            <Flex
              vertical
              align="center"
              gap="large"
              style={{ textAlign: "center" }}
            >
              <Space direction="vertical" align="center" size="large">
                <ClockCircleOutlined
                  style={{ fontSize: "64px", color: "#1890ff" }}
                />
                <Title level={1} style={{ margin: 0 }}>
                  Healthcare Shift Tracker
                </Title>
                <Text style={{ fontSize: "18px", color: "#666" }}>
                  Efficiently manage healthcare worker shifts with
                  location-based clock in/out
                </Text>
              </Space>

              {/* Features Grid */}
              <Row
                gutter={[24, 24]}
                style={{ width: "100%", marginTop: "2rem" }}
              >
                <Col xs={24} md={12}>
                  <Card hoverable style={{ height: "100%" }}>
                    <Space
                      direction="vertical"
                      align="center"
                      style={{ textAlign: "center" }}
                    >
                      <SafetyOutlined
                        style={{ fontSize: "48px", color: "#52c41a" }}
                      />
                      <Title level={3}>Secure Authentication</Title>
                      <Text style={{ color: "#666" }}>
                        Login with Auth0 for secure access to your shift
                        tracking
                      </Text>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card hoverable style={{ height: "100%" }}>
                    <Space
                      direction="vertical"
                      align="center"
                      style={{ textAlign: "center" }}
                    >
                      <EnvironmentOutlined
                        style={{ fontSize: "48px", color: "#1890ff" }}
                      />
                      <Title level={3}>Location-Based Tracking</Title>
                      <Text style={{ color: "#666" }}>
                        Clock in and out only when within the designated work
                        area
                      </Text>
                    </Space>
                  </Card>
                </Col>
              </Row>

              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                onClick={login}
                style={{ marginTop: "2rem" }}
              >
                Login to Get Started
              </Button>
            </Flex>
          </Space>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Flex align="center" justify="center" style={{ padding: "2rem" }}>
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text>Redirecting to dashboard...</Text>
        </Space>
      </Flex>
    </Layout>
  );
}
