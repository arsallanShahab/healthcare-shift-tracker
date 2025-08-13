import { useAuth } from "@/contexts/AuthContext";
import {
  BankOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  LogoutOutlined,
  MenuOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
  Layout as AntLayout,
  Avatar,
  Button,
  Dropdown,
  Grid,
  Menu,
  Typography,
} from "antd";
import React from "react";

const { Header, Sider, Content } = AntLayout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title = "Healthcare Shift Tracker",
}) => {
  const { user, logout, isManager } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);
  const screens = useBreakpoint();

  const menuItems: MenuProps["items"] = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: <a href="/dashboard">Dashboard</a>,
    },
    {
      key: "/clock-in",
      icon: <ClockCircleOutlined />,
      label: <a href="/clock-in">Clock In</a>,
    },
    {
      key: "/clock-out",
      icon: <ClockCircleOutlined />,
      label: <a href="/clock-out">Clock Out</a>,
    },
    {
      key: "/history",
      icon: <HistoryOutlined />,
      label: <a href="/history">My History</a>,
    },
    {
      key: "/setup",
      icon: <ToolOutlined />,
      label: <a href="/setup">System Setup</a>,
    },
    ...(isManager
      ? [
          {
            key: "admin",
            icon: <TeamOutlined />,
            label: "Admin",
            children: [
              {
                key: "/admin/dashboard",
                icon: <DashboardOutlined />,
                label: <a href="/admin/dashboard">Admin Dashboard</a>,
              },
              {
                key: "/admin/organizations",
                icon: <BankOutlined />,
                label: <a href="/admin/organizations">Organizations</a>,
              },
              {
                key: "/admin/users",
                icon: <UserOutlined />,
                label: <a href="/admin/users">User Management</a>,
              },
            ],
          },
        ]
      : []),
  ];

  const userMenuItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: logout,
    },
  ];

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#1f4e79",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {user && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: "white" }}
            />
          )}
          <Title level={3} style={{ color: "white", margin: 0 }}>
            {title}
          </Title>
        </div>

        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ color: "white" }}>
              Hello, {user.name || user.email}
            </span>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar style={{ backgroundColor: "#87d068", cursor: "pointer" }}>
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </Avatar>
            </Dropdown>
          </div>
        )}
      </Header>

      <AntLayout>
        {user && (
          <Sider
            width={250}
            collapsedWidth={screens.md ? 80 : 0}
            collapsed={collapsed}
            style={{
              background: "#fff",
              boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
            }}
            breakpoint="md"
            onBreakpoint={(broken) => {
              setCollapsed(broken);
            }}
          >
            <Menu
              mode="inline"
              items={menuItems}
              style={{ borderRight: 0, height: "100%" }}
              theme="light"
            />
          </Sider>
        )}

        <Content
          style={{
            padding: "24px",
            backgroundColor: "#f5f5f5",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};
