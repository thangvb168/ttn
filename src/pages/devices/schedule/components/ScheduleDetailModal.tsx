import { mockDevices } from "@/mocks/mockDevice";
import { mockUnits } from "@/mocks/mockUnit";
import {
  Schedule,
  ScheduleSourceType,
  ScheduleStatus,
  ScheduleType,
} from "@/models/Schedule";
import {
  AlertOutlined,
  AudioOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FlagOutlined,
  LinkOutlined,
  SoundOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Button, Descriptions, Divider, Modal, Space, Tag } from "antd";
import dayjs from "dayjs";
import React from "react";

interface ScheduleDetailModalProps {
  open: boolean;
  schedule: Schedule | null;
  onClose: () => void;
  onEdit?: (schedule: Schedule) => void;
}

export const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({
  open,
  schedule,
  onClose,
  onEdit,
}) => {
  if (!schedule) return null;

  // Get status config
  const getStatusConfig = (status: ScheduleStatus) => {
    const configs: Record<
      ScheduleStatus,
      { color: string; text: string; icon?: React.ReactNode }
    > = {
      [ScheduleStatus.DRAFT]: { color: "default", text: "Nháp" },
      [ScheduleStatus.PENDING_APPROVAL]: {
        color: "orange",
        text: "Chờ duyệt",
      },
      [ScheduleStatus.READY]: { color: "cyan", text: "Sẵn sàng" },
      [ScheduleStatus.RUNNING]: { color: "green", text: "Đang chạy" },
      [ScheduleStatus.COMPLETED]: { color: "blue", text: "Đã hoàn thành" },
      [ScheduleStatus.APPROVED]: { color: "blue", text: "Đã duyệt" },
      [ScheduleStatus.CANCELED]: { color: "default", text: "Đã hủy" },
      [ScheduleStatus.REJECTED]: { color: "red", text: "Từ chối" },
    };
    return configs[status];
  };

  // Get source icon
  const getSourceIcon = (sourceType: ScheduleSourceType) => {
    const icons: Record<ScheduleSourceType, React.ReactNode> = {
      [ScheduleSourceType.FILE]: <AudioOutlined />,
      [ScheduleSourceType.STREAM]: <LinkOutlined />,
      [ScheduleSourceType.TTS]: <SoundOutlined />,
      [ScheduleSourceType.RELAY]: <ThunderboltOutlined />,
    };
    return icons[sourceType];
  };

  // Get source text
  const getSourceText = (sourceType: ScheduleSourceType) => {
    const texts: Record<ScheduleSourceType, string> = {
      [ScheduleSourceType.FILE]: "File âm thanh",
      [ScheduleSourceType.STREAM]: "Tiếp sóng trực tiếp",
      [ScheduleSourceType.TTS]: "Text-to-Speech",
      [ScheduleSourceType.RELAY]: "Tiếp sóng từ cấp trên",
    };
    return texts[sourceType];
  };

  // Get unit names
  const getUnitNames = (unitIds: string[]) => {
    const allUnits = mockUnits.getAll();
    return unitIds
      .map((id) => {
        const unit = allUnits.find((u) => u.id === id);
        return unit?.name || id;
      })
      .join(", ");
  };

  // Get device names
  const getDeviceNames = (deviceIds: string[]) => {
    const allDevices = mockDevices.getAll();
    return deviceIds
      .map((id) => {
        const device = allDevices.find((d) => d.id === id);
        return device?.name || id;
      })
      .join(", ");
  };

  // Get owner unit name
  const getOwnerUnitName = (unitId: string) => {
    const unit = mockUnits.getAll().find((u) => u.id === unitId);
    return unit?.name || unitId;
  };

  const statusConfig = getStatusConfig(schedule.status);
  const duration = schedule.endTime
    ? dayjs(schedule.endTime).diff(dayjs(schedule.startTime), "minute")
    : 0;

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <CalendarOutlined className="text-2xl text-blue-500" />
          <div>
            <div className="text-lg font-semibold">{schedule.title}</div>
            <div className="text-sm font-normal text-gray-500">
              Chi tiết lịch phát
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={800}
      footer={
        <Space>
          <Button onClick={onClose}>Đóng</Button>
          {onEdit && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                onEdit(schedule);
                onClose();
              }}
            >
              Chỉnh sửa
            </Button>
          )}
        </Space>
      }
    >
      <div className="space-y-4">
        {/* Status and Type Tags */}
        <div className="flex gap-2 flex-wrap">
          <Tag color={statusConfig.color} className="text-sm px-3 py-1">
            {statusConfig.text}
          </Tag>
          {schedule.type === ScheduleType.ROUTINE && (
            <Tag color="blue" className="text-sm px-3 py-1">
              Định kỳ
            </Tag>
          )}
          {schedule.type === ScheduleType.ONE_TIME && (
            <Tag className="text-sm px-3 py-1">Một lần</Tag>
          )}
          {schedule.type === ScheduleType.EMERGENCY && (
            <Tag
              color="red"
              icon={<AlertOutlined />}
              className="text-sm px-3 py-1"
            >
              KHẨN CẤP
            </Tag>
          )}
          {schedule.priority >= 8 && (
            <Tag
              color="red"
              icon={<FlagOutlined />}
              className="text-sm px-3 py-1"
            >
              Ưu tiên cao ({schedule.priority})
            </Tag>
          )}
        </div>

        <Divider className="my-4" />

        {/* Basic Information */}
        <Descriptions title="Thông tin cơ bản" bordered column={2} size="small">
          <Descriptions.Item label="ID" span={2}>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
              {schedule.id}
            </code>
          </Descriptions.Item>

          <Descriptions.Item label="Đơn vị quản lý" span={2}>
            {getOwnerUnitName(schedule.ownerUnitId)}
          </Descriptions.Item>

          {schedule.description && (
            <Descriptions.Item label="Mô tả" span={2}>
              {schedule.description}
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Độ ưu tiên">
            {schedule.priority}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày tạo">
            {dayjs(schedule.createdAt).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>

          {schedule.approvedBy && (
            <Descriptions.Item label="Người duyệt" span={2}>
              {schedule.approvedBy}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider className="my-4" />

        {/* Time Information */}
        <Descriptions
          title="Thời gian phát sóng"
          bordered
          column={2}
          size="small"
        >
          <Descriptions.Item
            label={
              <span>
                <ClockCircleOutlined className="mr-2" />
                Bắt đầu
              </span>
            }
          >
            {dayjs(schedule.startTime).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span>
                <ClockCircleOutlined className="mr-2" />
                Kết thúc
              </span>
            }
          >
            {schedule.endTime
              ? dayjs(schedule.endTime).format("DD/MM/YYYY HH:mm")
              : "Không xác định"}
          </Descriptions.Item>

          <Descriptions.Item label="Thời lượng" span={2}>
            {duration > 0 ? `${duration} phút` : "Không xác định"}
          </Descriptions.Item>

          {schedule.type === ScheduleType.ROUTINE && schedule.daysOfWeek && (
            <Descriptions.Item label="Ngày lặp lại" span={2}>
              {schedule.daysOfWeek
                .map((day) => {
                  const days = [
                    "Chủ nhật",
                    "Thứ 2",
                    "Thứ 3",
                    "Thứ 4",
                    "Thứ 5",
                    "Thứ 6",
                    "Thứ 7",
                  ];
                  return days[day];
                })
                .join(", ")}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider className="my-4" />

        {/* Source Information */}
        <Descriptions title="Nguồn phát sóng" bordered column={1} size="small">
          <Descriptions.Item label="Loại nguồn">
            <Space>
              {getSourceIcon(schedule.sourceType)}
              {getSourceText(schedule.sourceType)}
            </Space>
          </Descriptions.Item>

          {schedule.sourceType === ScheduleSourceType.FILE && (
            <Descriptions.Item label="File âm thanh">
              <a
                href={schedule.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                {schedule.sourceUrl}
              </a>
            </Descriptions.Item>
          )}

          {schedule.sourceType === ScheduleSourceType.STREAM && (
            <Descriptions.Item label="URL Stream">
              <a
                href={schedule.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                {schedule.sourceUrl}
              </a>
            </Descriptions.Item>
          )}

          {schedule.sourceType === ScheduleSourceType.TTS && (
            <Descriptions.Item label="Nội dung TTS">
              <div className="bg-gray-50 p-2 rounded border border-gray-200">
                {schedule.ttsContent}
              </div>
            </Descriptions.Item>
          )}

          {schedule.sourceType === ScheduleSourceType.RELAY && (
            <>
              <Descriptions.Item label="Tiếp sóng từ">
                {schedule.sourceUnitId
                  ? getOwnerUnitName(schedule.sourceUnitId)
                  : "N/A"}
              </Descriptions.Item>
              {schedule.relayFromLevel && (
                <Descriptions.Item label="Cấp tiếp sóng">
                  {schedule.relayFromLevel}
                </Descriptions.Item>
              )}
            </>
          )}
        </Descriptions>

        <Divider className="my-4" />

        {/* Target Information */}
        <Descriptions
          title="Phạm vi phát sóng"
          bordered
          column={1}
          size="small"
        >
          {schedule.targetUnitIds.length === 0 &&
          schedule.targetDeviceIds.length === 0 ? (
            <Descriptions.Item label="Phạm vi">
              <Tag color="blue" icon={<TeamOutlined />}>
                Toàn bộ hệ thống
              </Tag>
            </Descriptions.Item>
          ) : (
            <>
              {schedule.targetUnitIds.length > 0 && (
                <Descriptions.Item
                  label={`Đơn vị (${schedule.targetUnitIds.length})`}
                >
                  <div className="max-h-32 overflow-y-auto">
                    {getUnitNames(schedule.targetUnitIds)}
                  </div>
                </Descriptions.Item>
              )}

              {schedule.targetDeviceIds.length > 0 && (
                <Descriptions.Item
                  label={`Thiết bị (${schedule.targetDeviceIds.length})`}
                >
                  <div className="max-h-32 overflow-y-auto">
                    {getDeviceNames(schedule.targetDeviceIds)}
                  </div>
                </Descriptions.Item>
              )}
            </>
          )}
        </Descriptions>
      </div>
    </Modal>
  );
};
