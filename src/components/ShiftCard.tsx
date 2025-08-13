import { formatDuration, formatTime } from "@/lib/utils";
import { Shift, ShiftStatus } from "@/types";
import { ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Space, Tag, Typography } from "antd";
import React from "react";

const { Text, Title } = Typography;

interface ShiftCardProps {
  shift: Shift;
  onClockOut?: () => void;
  showActions?: boolean;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({
  shift,
  onClockOut,
  showActions = true,
}) => {
  const isActive = shift.status === ShiftStatus.CLOCKED_IN;
  const duration = shift.clockOutTime
    ? shift.duration || 0
    : Math.floor(
        (Date.now() - new Date(shift.clockInTime).getTime()) / (1000 * 60)
      );

  return (
    <Card
      style={{
        marginBottom: 16,
        backgroundColor: isActive ? "#f6ffed" : "#fafafa",
        borderColor: isActive ? "#52c41a" : "#d9d9d9",
      }}
      bodyStyle={{ padding: 20 }}
    >
      <Flex justify="space-between" align="flex-start">
        <Space direction="vertical" size="small" style={{ flex: 1 }}>
          <Flex align="center" gap="small">
            <Title level={5} style={{ margin: 0 }}>
              {isActive ? "Currently Clocked In" : "Completed Shift"}
            </Title>
            <Tag color={isActive ? "green" : "default"}>
              {isActive ? "Active" : "Completed"}
            </Tag>
          </Flex>

          <Space direction="vertical" size="small">
            <Flex align="center" gap="small">
              <ClockCircleOutlined style={{ color: "#1890ff" }} />
              <Text type="secondary">
                Started: {formatTime(shift.clockInTime)}
              </Text>
            </Flex>

            {shift.clockOutTime && (
              <Flex align="center" gap="small">
                <ClockCircleOutlined style={{ color: "#1890ff" }} />
                <Text type="secondary">
                  Ended: {formatTime(shift.clockOutTime)}
                </Text>
              </Flex>
            )}

            <Flex align="center" gap="small">
              <EnvironmentOutlined style={{ color: "#52c41a" }} />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {shift.clockInAddress ||
                  `${shift.clockInLatitude}, ${shift.clockInLongitude}`}
              </Text>
            </Flex>

            {shift.clockInNote && (
              <Text
                type="secondary"
                style={{ fontStyle: "italic", fontSize: "12px" }}
              >
                Note: {shift.clockInNote}
              </Text>
            )}
          </Space>
        </Space>

        <Space direction="vertical" align="end" size="small">
          <Text strong style={{ fontSize: "18px", color: "#1f4e79" }}>
            {formatDuration(duration)}
          </Text>

          {isActive && showActions && onClockOut && (
            <Button
              type="primary"
              danger
              size="small"
              onClick={onClockOut}
              icon={<ClockCircleOutlined />}
            >
              Clock Out
            </Button>
          )}
        </Space>
      </Flex>
    </Card>
  );
};
