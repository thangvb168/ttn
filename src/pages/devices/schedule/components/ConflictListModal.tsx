import { Schedule } from "@/models/Schedule";
import { ClockCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { Alert, Empty, Table, Tag } from "antd";
import dayjs from "dayjs";
import React from "react";
import { ScheduleConflict } from "../utils/conflictDetection";

interface ConflictListModalProps {
  conflicts: ScheduleConflict[];
  schedules: Schedule[];
}

interface ConflictTableRecord {
  key: number;
  conflict: ScheduleConflict;
  schedule1: Schedule | undefined;
  schedule2: Schedule | undefined;
}

export const ConflictListModal: React.FC<ConflictListModalProps> = ({
  conflicts,
  schedules,
}) => {
  if (conflicts.length === 0) {
    return (
      <Empty
        description="Không có xung đột nào"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  // Create a map for quick schedule lookup
  const scheduleMap = new Map(schedules.map((s) => [s.id, s]));

  // Transform conflicts into table data
  const dataSource: ConflictTableRecord[] = conflicts.map((conflict, index) => {
    const schedule1 = scheduleMap.get(conflict.scheduleId);
    const schedule2 = scheduleMap.get(conflict.conflictingScheduleId);

    return {
      key: index,
      conflict,
      schedule1,
      schedule2,
    };
  });

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Lịch 1",
      key: "schedule1",
      render: (_: any, record: ConflictTableRecord) => (
        <div>
          <div className="font-semibold">{record.schedule1?.title}</div>
          <div className="text-xs text-gray-500">
            <ClockCircleOutlined className="mr-1" />
            {dayjs(record.schedule1?.startTime).format("DD/MM/YYYY HH:mm")}
          </div>
        </div>
      ),
    },
    {
      title: "Lịch 2",
      key: "schedule2",
      render: (_: any, record: ConflictTableRecord) => (
        <div>
          <div className="font-semibold">{record.schedule2?.title}</div>
          <div className="text-xs text-gray-500">
            <ClockCircleOutlined className="mr-1" />
            {dayjs(record.schedule2?.startTime).format("DD/MM/YYYY HH:mm")}
          </div>
        </div>
      ),
    },
    {
      title: "Lý do",
      key: "reason",
      render: (_: any, record: ConflictTableRecord) => {
        const reasonMap: Record<ScheduleConflict["reason"], string> = {
          TIME_OVERLAP: "Trùng thời gian",
          DEVICE_OVERLAP: "Trùng thiết bị",
          RELAY_OVERRIDE: "Lịch tiếp sóng ghi đè",
        };
        return (
          <div>
            <div>{reasonMap[record.conflict.reason]}</div>
            <div className="text-xs text-gray-600 mt-1">
              {record.conflict.description}
            </div>
          </div>
        );
      },
    },
    {
      title: "Mức độ",
      key: "severity",
      width: 100,
      render: (_: any, record: ConflictTableRecord) => {
        const severityConfig: Record<
          ScheduleConflict["severity"],
          { color: string; text: string; icon: React.ReactNode }
        > = {
          HIGH: { color: "red", text: "Cao", icon: <WarningOutlined /> },
          MEDIUM: { color: "orange", text: "Trung bình", icon: null },
          LOW: { color: "blue", text: "Thấp", icon: null },
        };
        const config = severityConfig[record.conflict.severity];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
  ];

  const highSeverityCount = conflicts.filter(
    (c) => c.severity === "HIGH"
  ).length;

  return (
    <div>
      {highSeverityCount > 0 && (
        <Alert
          message={`Có ${highSeverityCount} xung đột mức độ cao cần xử lý`}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
        scroll={{ y: 400 }}
      />
    </div>
  );
};
