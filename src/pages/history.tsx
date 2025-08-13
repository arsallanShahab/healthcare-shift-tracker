import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { GET_MY_SHIFTS } from "@/lib/graphql/queries";
import { formatTime } from "@/lib/utils";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Flex,
  Pagination,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import React, { useState } from "react";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ShiftRecord {
  id: string;
  status: string;
  clockInTime: string;
  clockOutTime?: string;
  clockInAddress?: string;
  clockOutAddress?: string;
  clockInNote?: string;
  clockOutNote?: string;
  duration?: number;
}

export default function History() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );

  const {
    data: shiftsData,
    loading: shiftsLoading,
    refetch,
  } = useQuery(GET_MY_SHIFTS, {
    variables: {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    },
  });

  const shifts = shiftsData?.myShifts || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refetch({
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDateFilter = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  ) => {
    const validDateRange =
      dates && dates[0] && dates[1]
        ? ([dates[0], dates[1]] as [dayjs.Dayjs, dayjs.Dayjs])
        : null;
    setDateRange(validDateRange);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CLOCKED_IN":
        return "processing";
      case "CLOCKED_OUT":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CLOCKED_IN":
        return "In Progress";
      case "CLOCKED_OUT":
        return "Completed";
      default:
        return status;
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const columns: ColumnsType<ShiftRecord> = [
    {
      title: "Date",
      dataIndex: "clockInTime",
      key: "date",
      render: (clockInTime: string) => (
        <Space direction="vertical" size={0}>
          <Text strong>{dayjs(clockInTime).format("MMM DD, YYYY")}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {dayjs(clockInTime).format("dddd")}
          </Text>
        </Space>
      ),
      sorter: (a, b) =>
        dayjs(a.clockInTime).valueOf() - dayjs(b.clockInTime).valueOf(),
      defaultSortOrder: "descend",
    },
    {
      title: "Clock In",
      dataIndex: "clockInTime",
      key: "clockIn",
      render: (clockInTime: string) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(clockInTime).format("HH:mm")}</Text>
        </Space>
      ),
    },
    {
      title: "Clock Out",
      dataIndex: "clockOutTime",
      key: "clockOut",
      render: (clockOutTime?: string) => (
        <Space direction="vertical" size={0}>
          <Text>
            {clockOutTime ? dayjs(clockOutTime).format("HH:mm") : "—"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (duration?: number) => <Text>{formatDuration(duration)}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      filters: [
        { text: "All", value: "ALL" },
        { text: "In Progress", value: "CLOCKED_IN" },
        { text: "Completed", value: "CLOCKED_OUT" },
      ],
      onFilter: (value, record) => value === "ALL" || record.status === value,
    },
    {
      title: "Location",
      key: "location",
      render: (record: ShiftRecord) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: "12px" }}>
            <EnvironmentOutlined style={{ marginRight: "4px" }} />
            In: {record.clockInAddress || "N/A"}
          </Text>
          {record.clockOutAddress && (
            <Text style={{ fontSize: "12px" }}>
              <EnvironmentOutlined style={{ marginRight: "4px" }} />
              Out: {record.clockOutAddress}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Notes",
      key: "notes",
      render: (record: ShiftRecord) => (
        <Space direction="vertical" size={0}>
          {record.clockInNote && (
            <Text style={{ fontSize: "12px" }}>In: {record.clockInNote}</Text>
          )}
          {record.clockOutNote && (
            <Text style={{ fontSize: "12px" }}>Out: {record.clockOutNote}</Text>
          )}
          {!record.clockInNote && !record.clockOutNote && <Text>—</Text>}
        </Space>
      ),
    },
  ];

  if (!user) {
    return (
      <Layout>
        <Flex align="center" justify="center" style={{ padding: "2rem" }}>
          <Text>Please log in to view your shift history.</Text>
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout title="Shift History">
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
              <CalendarOutlined style={{ marginRight: "8px" }} />
              Shift History
            </Title>
          </div>

          {/* Filters */}
          <Card>
            <Space wrap>
              <div>
                <Text style={{ marginRight: "8px" }}>Filter by Status:</Text>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  style={{ width: 140 }}
                >
                  <Option value="ALL">All Shifts</Option>
                  <Option value="CLOCKED_IN">In Progress</Option>
                  <Option value="CLOCKED_OUT">Completed</Option>
                </Select>
              </div>
              <div>
                <Text style={{ marginRight: "8px" }}>Filter by Date:</Text>
                <RangePicker
                  value={dateRange}
                  onChange={handleDateFilter}
                  format="MMM DD, YYYY"
                  allowClear
                />
              </div>
            </Space>
          </Card>

          {/* Shifts Table */}
          <Card>
            {shiftsLoading ? (
              <Flex justify="center" align="center" style={{ padding: "3rem" }}>
                <Spin size="large" />
                <Text style={{ marginLeft: "1rem" }}>
                  Loading shift history...
                </Text>
              </Flex>
            ) : shifts.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No shifts found"
                style={{ padding: "3rem" }}
              >
                <Button type="primary" href="/clock-in">
                  <ClockCircleOutlined />
                  Start Your First Shift
                </Button>
              </Empty>
            ) : (
              <>
                <Table
                  columns={columns}
                  dataSource={shifts}
                  rowKey="id"
                  pagination={false}
                  scroll={{ x: 800 }}
                />
                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={shifts.length * 2}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    showQuickJumper
                    showTotal={(total, range) =>
                      `${range[0]}-${range[1]} of ${total} shifts`
                    }
                  />
                </div>
              </>
            )}
          </Card>

          {/* Summary Statistics */}
          <Card title="This Month Summary">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  padding: "1rem",
                  backgroundColor: "#f6ffed",
                  borderRadius: "6px",
                }}
              >
                <Title level={3} style={{ margin: 0, color: "#52c41a" }}>
                  {shifts.filter((s: any) => s.status === "CLOCKED_OUT").length}
                </Title>
                <Text>Completed Shifts</Text>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "1rem",
                  backgroundColor: "#fff7e6",
                  borderRadius: "6px",
                }}
              >
                <Title level={3} style={{ margin: 0, color: "#fa8c16" }}>
                  {Math.round(
                    shifts
                      .filter((s: any) => s.duration)
                      .reduce(
                        (acc: number, s: any) => acc + (s.duration || 0),
                        0
                      ) / 60
                  )}
                  h
                </Title>
                <Text>Total Hours</Text>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "1rem",
                  backgroundColor: "#e6f7ff",
                  borderRadius: "6px",
                }}
              >
                <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                  {shifts.filter((s: any) => s.status === "CLOCKED_IN").length}
                </Title>
                <Text>Active Shifts</Text>
              </div>
            </div>
          </Card>
        </Space>
      </div>
    </Layout>
  );
}
