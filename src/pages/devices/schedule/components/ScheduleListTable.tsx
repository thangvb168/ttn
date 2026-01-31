import { Schedule, ScheduleStatus } from "@/models/Schedule";
import {
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Button, Popconfirm, Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import React from "react";
import { useSchedules } from "../hooks/useSchedules";

export const ScheduleListTable: React.FC = () => {
  const { data: schedules, isLoading } = useSchedules();

  const columns = [
    {
      title: "Tên lịch phát",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: ScheduleStatus) => {
        let color = "default";
        let text = "N/A";
        switch (status) {
          case ScheduleStatus.RUNNING:
            color = "green";
            text = "Đang chạy";
            break;
          case ScheduleStatus.PENDING_APPROVAL:
            color = "gold";
            text = "Chờ duyệt";
            break;
          case ScheduleStatus.APPROVED:
            color = "blue";
            text = "Đã duyệt";
            break;
          case ScheduleStatus.REJECTED:
            color = "red";
            text = "Đã từ chối";
            break;
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startTime",
      key: "startTime",
      render: (date: Date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Nguồn phát",
      key: "source",
      render: (_: any, record: Schedule) => <span>{record.sourceType}</span>,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: Schedule) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} />
          <Popconfirm title="Bạn có chắc chắn muốn xóa?">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
          {record.status !== ScheduleStatus.RUNNING && (
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              title="Phát ngay"
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={schedules}
      columns={columns}
      rowKey="id"
      loading={isLoading}
    />
  );
};
