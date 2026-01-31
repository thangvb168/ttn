import { ScheduleStatus } from "@/models/Schedule";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, List, message, Tag } from "antd";
import React, { useState } from "react";

// Mock Pending Data
const initialPending = [
  {
    id: "p1",
    title: "Phát thông báo tiêm chủng",
    user: "Nguyen Van A",
    createdAt: "2024-05-20 08:00",
    status: ScheduleStatus.PENDING_APPROVAL,
  },
  {
    id: "p2",
    title: "Lịch phát nhạc cuối tuần",
    user: "Tran Thi B",
    createdAt: "2024-05-21 09:00",
    status: ScheduleStatus.PENDING_APPROVAL,
  },
];

export const ApprovalQueue: React.FC = () => {
  const [data, setData] = useState(initialPending);

  const handleApprove = (id: string) => {
    message.success("Đã duyệt lịch phát!");
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReject = (id: string) => {
    message.info("Đã từ chối lịch phát!");
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Card
      title="Duyệt lịch chờ (Admin)"
      className="mt-4"
      extra={<Tag color="orange">{data.length} chờ duyệt</Tag>}
    >
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                type="text"
                icon={<CheckCircleOutlined style={{ color: "green" }} />}
                onClick={() => handleApprove(item.id)}
              >
                Duyệt
              </Button>,
              <Button
                type="text"
                icon={<CloseCircleOutlined style={{ color: "red" }} />}
                danger
                onClick={() => handleReject(item.id)}
              >
                Từ chối
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar style={{ backgroundColor: "#f56a00" }}>
                  {item.user[0]}
                </Avatar>
              }
              title={item.title}
              description={`Người tạo: ${item.user} | Ngày tạo: ${item.createdAt}`}
            />
          </List.Item>
        )}
      />
      {data.length === 0 && (
        <div className="text-center text-gray-400 py-4">
          Không có lịch nào cần duyệt
        </div>
      )}
    </Card>
  );
};
