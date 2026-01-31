import {
  Schedule,
  ScheduleSourceType,
  ScheduleStatus,
  ScheduleType,
} from "@/models/Schedule";
import {
  AlertOutlined,
  AudioOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FlagOutlined,
  LeftOutlined,
  LinkOutlined,
  RightOutlined,
  SoundOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
  Button,
  Card,
  DatePicker,
  Segmented,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useRef, useState } from "react";
import { useSchedules } from "../hooks/useSchedules";

dayjs.locale("vi");
const { Text } = Typography;

interface ScheduleCalendarProps {
  onEdit?: (id: string) => void;
  selectedUnitId?: string | null;
  scheduleFilter?: "all" | "unit" | "relay";
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  onEdit,
  selectedUnitId,
  scheduleFilter = "all",
}) => {
  const { data: schedules, isLoading } = useSchedules();
  const calendarRef = useRef<FullCalendar>(null);
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [viewType, setViewType] = useState<string>("timeGridWeek");

  // Import mockDevices and mockUnits for filtering
  const mockDevices = require("@/mocks/mockDevice").mockDevices;
  const mockUnits = require("@/mocks/mockUnit").mockUnits;

  // Get all child unit IDs recursively (same logic as ScheduleListTable)
  const getAllChildUnitIds = (unitId: string): string[] => {
    const allUnits = mockUnits.getAll();
    const childIds: string[] = [unitId];

    const findChildren = (parentId: string) => {
      const children = allUnits.filter((u: any) => u.parentId === parentId);
      children.forEach((child: any) => {
        childIds.push(child.id);
        findChildren(child.id);
      });
    };

    findChildren(unitId);
    return childIds;
  };

  // Filter by unit
  const filteredByUnit = (() => {
    if (!selectedUnitId || !schedules) return schedules;

    const allUnitIds = getAllChildUnitIds(selectedUnitId);

    return schedules.filter((schedule) => {
      if (allUnitIds.includes(schedule.ownerUnitId)) return true;
      if (schedule.targetUnitIds.some((id) => allUnitIds.includes(id)))
        return true;

      const unitDevices = mockDevices
        .getAll()
        .filter((d: any) => allUnitIds.includes(d.unitId));
      const unitDeviceIds = unitDevices.map((d: any) => d.id);
      if (schedule.targetDeviceIds.some((id) => unitDeviceIds.includes(id)))
        return true;

      return false;
    });
  })();

  // Filter by segment
  const filteredSchedules = (() => {
    if (!filteredByUnit) return [];

    switch (scheduleFilter) {
      case "all":
        return filteredByUnit;
      case "unit":
        return filteredByUnit.filter(
          (s) => s.sourceType !== ScheduleSourceType.RELAY
        );
      case "relay":
        return filteredByUnit.filter(
          (s) => s.sourceType === ScheduleSourceType.RELAY
        );
      default:
        return filteredByUnit;
    }
  })();

  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.prev();
    setCurrentDate(dayjs(calendarApi?.getDate()));
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.next();
    setCurrentDate(dayjs(calendarApi?.getDate()));
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.today();
    setCurrentDate(dayjs(calendarApi?.getDate()));
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      const calendarApi = calendarRef.current?.getApi();
      calendarApi?.gotoDate(date.toDate());
      setCurrentDate(date);
    }
  };

  const handleViewChange = (value: string) => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.changeView(value);
    setViewType(value);
  };

  const events = filteredSchedules?.map((s) => {
    const style = getEventStyles(s.status, s.type);

    return {
      id: s.id,
      title: s.title,
      start: s.startTime,
      end: s.endTime,
      backgroundColor: style.bg,
      borderColor: style.border,
      textColor: style.text,
      extendedProps: {
        status: s.status,
        type: s.type,
        sourceType: s.sourceType,
        originalData: s,
        accentColor: style.border,
        onEdit,
      },
      // For recurring events
      daysOfWeek: s.daysOfWeek,
      ...(s.type === ScheduleType.ROUTINE && s.daysOfWeek
        ? {
            startTime: s.startTime.toTimeString().slice(0, 8),
            endTime: s.endTime?.toTimeString().slice(0, 8),
            startRecur: s.startTime,
          }
        : {}),
    };
  });

  return (
    <Card title="Lịch phát sóng" bordered={false} className="shadow-md">
      <Spin spinning={isLoading}>
        <div className="flex flex-col gap-4 mb-4">
          {/* Custom Toolbar */}
          <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100 shadow-sm">
            <Space size="middle">
              <Button icon={<LeftOutlined />} onClick={handlePrev} />
              <Button icon={<RightOutlined />} onClick={handleNext} />
              <Button type="primary" ghost onClick={handleToday}>
                Hôm nay
              </Button>
              <DatePicker
                value={currentDate}
                onChange={handleDateChange}
                allowClear={false}
                format="DD/MM/YYYY"
                className="w-36"
              />
              <Text strong className="text-lg ml-2 capitalize text-blue-900">
                {currentDate.format("MMMM YYYY")}
              </Text>
            </Space>

            <Segmented
              value={viewType}
              onChange={handleViewChange}
              options={[
                { label: "Tháng", value: "dayGridMonth" },
                { label: "Tuần", value: "timeGridWeek" },
                { label: "Ngày", value: "timeGridDay" },
              ]}
            />
          </div>

          <div className="h-[600px]">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={false}
              events={events}
              eventContent={renderEventContent}
              locale="vi"
              firstDay={1}
              slotMinTime="00:00:00"
              slotMaxTime="24:00:00"
              allDaySlot={false}
              height="100%"
              slotEventOverlap={false}
              dayMaxEvents={true}
              datesSet={(arg) => setCurrentDate(dayjs(arg.view.currentStart))}
            />
            <style>{`
                .fc-event {
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                .fc-event:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                }
            `}</style>
          </div>
        </div>
      </Spin>

      {/* Updated Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <Text strong className="block mb-3 text-gray-700">
          Chú thích trạng thái:
        </Text>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <LegendItem color="#10B981" label="Đang chạy" />
          <LegendItem color="#06B6D4" label="Sẵn sàng" />
          <LegendItem color="#3B82F6" label="Đã hoàn thành" />
          <LegendItem color="#2563EB" label="Đã duyệt" />
          <LegendItem color="#F59E0B" label="Chờ duyệt" />
          <LegendItem color="#9CA3AF" label="Nháp" />
          <LegendItem color="#64748B" label="Đã hủy" />
          <LegendItem color="#DC2626" label="Khẩn cấp / Từ chối" />
        </div>
      </div>
    </Card>
  );
};

// Legend Item Component
const LegendItem: React.FC<{ color: string; label: string }> = ({
  color,
  label,
}) => (
  <div className="flex items-center gap-2">
    <div
      className="w-3 h-3 rounded-full shadow-sm"
      style={{ backgroundColor: color }}
    ></div>
    <Text className="text-sm text-gray-600">{label}</Text>
  </div>
);

// Event Content Renderer
function renderEventContent(eventInfo: any) {
  const { extendedProps, title } = eventInfo.event;
  const { timeText } = eventInfo;
  const schedule = extendedProps.originalData as Schedule;

  // Source Icon & Text
  const sourceInfo = getSourceInfo(schedule.sourceType);

  // Duration
  const start = dayjs(schedule.startTime);
  const end = schedule.endTime ? dayjs(schedule.endTime) : start.add(1, "hour");
  const duration = end.diff(start, "minute");

  // Target Count
  const targetCount =
    (schedule.targetUnitIds?.length || 0) +
    (schedule.targetDeviceIds?.length || 0);

  // Priority Badge
  const priorityBadge = getPriorityBadge(schedule.priority);

  // Relay Info
  const relayInfo =
    schedule.sourceType === ScheduleSourceType.RELAY
      ? getRelayInfo(schedule)
      : null;

  // Tooltip Content with Action Buttons
  const tooltipContent = (
    <div className="min-w-[280px] max-w-[350px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3 pb-2 border-b border-gray-200">
        <div className="flex-1">
          <div className="font-bold text-base text-blue-700 mb-1">{title}</div>
          <div className="flex gap-2 flex-wrap">
            <Tag color={getStatusColor(schedule.status)} className="text-xs">
              {getScheduleStatusLabel(schedule.status)}
            </Tag>
            {schedule.type === ScheduleType.EMERGENCY && (
              <Tag color="red" icon={<AlertOutlined />} className="text-xs">
                KHẨN CẤP
              </Tag>
            )}
            {priorityBadge}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm mb-3">
        <DetailRow
          icon={<ClockCircleOutlined />}
          label="Thời gian"
          value={`${timeText} (${duration} phút)`}
        />
        <DetailRow
          icon={sourceInfo.icon}
          label="Nguồn phát"
          value={sourceInfo.text}
        />
        <DetailRow
          icon={<TeamOutlined />}
          label="Phạm vi"
          value={
            targetCount > 0 ? `${targetCount} điểm phát` : "Toàn bộ hệ thống"
          }
        />

        {relayInfo && (
          <DetailRow
            icon={<ThunderboltOutlined />}
            label="Tiếp sóng"
            value={relayInfo}
          />
        )}

        {schedule.description && (
          <div className="pt-2 border-t border-gray-100">
            <Text className="text-xs text-gray-500 italic">
              {schedule.description}
            </Text>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {extendedProps.onEdit && (
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              extendedProps.onEdit(schedule.id);
            }}
            className="flex-1"
          >
            Xem chi tiết
          </Button>
        </div>
      )}
    </div>
  );

  // Event Card Display
  return (
    <Tooltip
      title={tooltipContent}
      placement="rightTop"
      color="white"
      overlayInnerStyle={{
        color: "black",
        padding: "12px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
      overlayStyle={{ maxWidth: "400px" }}
    >
      <div
        className="p-1.5 h-full flex flex-col rounded-md shadow-sm hover:shadow-md transition-all cursor-pointer"
        style={{
          backgroundColor: extendedProps.accentColor,
          color: "#FFFFFF",
          borderLeft: `4px solid rgba(0,0,0,0.2)`,
        }}
      >
        {/* Time & Priority */}
        <div className="font-semibold text-xs opacity-95 flex justify-between items-center mb-1">
          <span>{timeText}</span>
          <div className="flex gap-1 items-center">
            {schedule.priority >= 8 && (
              <FlagOutlined className="text-white animate-pulse" />
            )}
            {schedule.type === ScheduleType.EMERGENCY && (
              <AlertOutlined className="text-white animate-pulse" />
            )}
          </div>
        </div>

        {/* Title */}
        <div className="font-bold text-sm leading-tight flex-1 line-clamp-2 mb-1">
          {title}
        </div>

        {/* Mini Icons Footer */}
        <div className="mt-auto flex gap-2 opacity-90 text-xs items-center">
          {sourceInfo.icon}
          {targetCount > 0 && (
            <span className="flex items-center gap-0.5">
              <TeamOutlined />
              <span className="text-[10px]">{targetCount}</span>
            </span>
          )}
          {schedule.sourceType === ScheduleSourceType.RELAY && (
            <ThunderboltOutlined />
          )}
        </div>
      </div>
    </Tooltip>
  );
}

// Helper Components
const DetailRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex gap-2 items-start">
    <span className="text-gray-400 mt-0.5">{icon}</span>
    <div className="flex-1 flex gap-2">
      <span className="text-gray-500 font-medium min-w-[80px]">{label}:</span>
      <span className="text-gray-700 flex-1">{value}</span>
    </div>
  </div>
);

// Helper Functions
const getSourceInfo = (sourceType: ScheduleSourceType) => {
  switch (sourceType) {
    case ScheduleSourceType.STREAM:
      return { icon: <LinkOutlined />, text: "Tiếp sóng trực tiếp" };
    case ScheduleSourceType.TTS:
      return { icon: <SoundOutlined />, text: "Chuyển văn bản (TTS)" };
    case ScheduleSourceType.RELAY:
      return { icon: <ThunderboltOutlined />, text: "Tiếp sóng từ cấp trên" };
    case ScheduleSourceType.FILE:
    default:
      return { icon: <AudioOutlined />, text: "File âm thanh" };
  }
};

const getPriorityBadge = (priority: number) => {
  if (priority >= 8) {
    return (
      <Tag color="red" icon={<FlagOutlined />} className="text-xs">
        Ưu tiên cao
      </Tag>
    );
  }
  if (priority >= 5) {
    return (
      <Tag color="orange" className="text-xs">
        Ưu tiên TB
      </Tag>
    );
  }
  return null;
};

const getRelayInfo = (schedule: Schedule) => {
  const parts = [];
  if (schedule.relayFromLevel) {
    const levelMap = {
      PROVINCE: "Tỉnh",
      DISTRICT: "Huyện",
      COMMUNE: "Xã",
    };
    parts.push(`Từ cấp ${levelMap[schedule.relayFromLevel]}`);
  }
  if (schedule.sourceUnitId) {
    parts.push(`Đơn vị: ${schedule.sourceUnitId}`);
  }
  return parts.join(" • ") || "Tiếp sóng từ cấp trên";
};

const getEventStyles = (status: ScheduleStatus, type: ScheduleType) => {
  // Emergency overrides all
  if (type === ScheduleType.EMERGENCY) {
    return { bg: "#FEE2E2", border: "#DC2626", text: "#991B1B" };
  }

  switch (status) {
    case ScheduleStatus.RUNNING:
      return { bg: "#D1FAE5", border: "#10B981", text: "#065F46" };
    case ScheduleStatus.READY:
      return { bg: "#CFFAFE", border: "#06B6D4", text: "#164E63" };
    case ScheduleStatus.COMPLETED:
      return { bg: "#DBEAFE", border: "#3B82F6", text: "#1E40AF" };
    case ScheduleStatus.APPROVED:
      return { bg: "#EFF6FF", border: "#2563EB", text: "#1E3A8A" };
    case ScheduleStatus.PENDING_APPROVAL:
      return { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" };
    case ScheduleStatus.DRAFT:
      return { bg: "#F3F4F6", border: "#9CA3AF", text: "#374151" };
    case ScheduleStatus.CANCELED:
      return { bg: "#F1F5F9", border: "#64748B", text: "#334155" };
    case ScheduleStatus.REJECTED:
      return { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" };
    default:
      return { bg: "#F9FAFB", border: "#D1D5DB", text: "#6B7280" };
  }
};

const getStatusColor = (status: ScheduleStatus) => {
  switch (status) {
    case ScheduleStatus.RUNNING:
      return "green";
    case ScheduleStatus.READY:
      return "cyan";
    case ScheduleStatus.COMPLETED:
      return "blue";
    case ScheduleStatus.APPROVED:
      return "blue";
    case ScheduleStatus.PENDING_APPROVAL:
      return "orange";
    case ScheduleStatus.DRAFT:
      return "default";
    case ScheduleStatus.CANCELED:
      return "default";
    case ScheduleStatus.REJECTED:
      return "red";
    default:
      return "default";
  }
};

const getScheduleStatusLabel = (status: ScheduleStatus) => {
  switch (status) {
    case ScheduleStatus.RUNNING:
      return "Đang chạy";
    case ScheduleStatus.READY:
      return "Sẵn sàng";
    case ScheduleStatus.COMPLETED:
      return "Đã hoàn thành";
    case ScheduleStatus.PENDING_APPROVAL:
      return "Chờ duyệt";
    case ScheduleStatus.APPROVED:
      return "Đã duyệt";
    case ScheduleStatus.DRAFT:
      return "Nháp";
    case ScheduleStatus.CANCELED:
      return "Đã hủy";
    case ScheduleStatus.REJECTED:
      return "Từ chối";
    default:
      return status;
  }
};
