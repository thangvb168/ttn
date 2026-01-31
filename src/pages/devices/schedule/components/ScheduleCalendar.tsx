import {
  Schedule,
  ScheduleSourceType,
  ScheduleStatus,
  ScheduleType,
} from "@/models/Schedule";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
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
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  onEdit,
}) => {
  const { data: schedules, isLoading } = useSchedules();
  const calendarRef = useRef<FullCalendar>(null);
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [viewType, setViewType] = useState<string>("timeGridWeek");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const events = schedules?.map((s) => {
    // Modern Color Scheme: Light BG + Strong Border
    const style = getEventStyles(s.status, s.type);
    const isExpanded = s.id === expandedId;

    return {
      id: s.id,
      title: s.title,
      start: s.startTime,
      end: s.endTime,
      backgroundColor: style.bg,
      borderColor: style.border,
      textColor: style.text,
      classNames: isExpanded ? ["is-expanded"] : [],
      extendedProps: {
        status: s.status,
        type: s.type,
        sourceType: s.sourceType,
        originalData: s,
        accentColor: style.border, // Pass accent color for inner usage
        isExpanded, // Pass state to render content
        onEdit, // Pass callback
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

  const handleEventClick = (info: any) => {
    // Toggle expansion logic
    const id = info.event.id;
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Card title="Lịch phát sóng" bordered={false} className="shadow-md">
      <Spin spinning={isLoading}>
        <div className="flex flex-col gap-4 mb-4">
          {/* Custom Toolbar */}
          <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
            <Space>
              <Button icon={<LeftOutlined />} onClick={handlePrev} />
              <Button icon={<RightOutlined />} onClick={handleNext} />
              <Button onClick={handleToday}>Hôm nay</Button>
              <DatePicker
                value={currentDate}
                onChange={handleDateChange}
                allowClear={false}
                format="DD/MM/YYYY"
                className="w-36"
              />
              <Text strong className="text-lg ml-2 capitalize">
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
              headerToolbar={false} // Hide default toolbar
              events={events} // Pass events here
              eventContent={renderEventContent}
              eventClick={handleEventClick} // Handle click
              locale="vi"
              firstDay={1} // Monday
              slotMinTime="00:00:00" // Allow full day view if needed
              slotMaxTime="24:00:00"
              allDaySlot={false}
              height="100%"
              // eventMinHeight={60} // REMOVED: Allow natural small size
              slotEventOverlap={false} // Avoid messy overlaps
              dayMaxEvents={true}
              // Sync internal state when view/dates change via interaction?
              datesSet={(arg) => setCurrentDate(dayjs(arg.view.currentStart))}
            />
            {/* Styles for expansion - Tweaked for Button Layout */}
            <style>{`
                .fc-event {
                    transition: all 0.2s ease;
                }
                .is-expanded {
                    z-index: 100 !important;
                    height: auto !important;
                    min-height: 80px !important; /* Reduced min-height */
                    box-shadow: 0 8px 20px rgba(0,0,0,0.3) !important;
                    padding-bottom: 8px !important;
                }
            `}</style>
          </div>
        </div>
      </Spin>
      <div className="mt-4 flex gap-4">
        {/* Legend updated to match new style if needed, or keep simple dots */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#34A853]"></div>
          <Text>Đang chạy</Text>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4285F4]"></div>
          <Text>Đã duyệt / Định kỳ</Text>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FBBC05]"></div>
          <Text>Chờ duyệt</Text>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#EA4335]"></div>
          <Text>Khẩn cấp / Từ chối</Text>
        </div>
      </div>
    </Card>
  );
};

import {
  AlertOutlined,
  AudioOutlined,
  LinkOutlined,
  SoundOutlined,
  TeamOutlined,
} from "@ant-design/icons";

function renderEventContent(eventInfo: any) {
  const { extendedProps, title } = eventInfo.event;
  const { timeText } = eventInfo;

  const schedule = extendedProps.originalData as Schedule;

  // Helper for Source Icon
  let sourceIcon = <AudioOutlined />;
  let sourceText = "File Audio";
  if (extendedProps.sourceType === ScheduleSourceType.STREAM) {
    sourceIcon = <LinkOutlined />;
    sourceText = "Tiếp sóng";
  } else if (extendedProps.sourceType === ScheduleSourceType.TTS) {
    sourceIcon = <SoundOutlined />;
    sourceText = "Chuyển văn bản (TTS)";
  }

  // Helper for Duration
  const start = dayjs(schedule.startTime);
  const end = schedule.endTime ? dayjs(schedule.endTime) : start.add(1, "hour"); // Default if missing
  const duration = end.diff(start, "minute");

  // Helper for Targets
  const targetCount =
    (schedule.targetUnitIds?.length || 0) +
    (schedule.targetDeviceIds?.length || 0);

  // Custom tooltip content
  const tooltipContent = (
    <div className="min-w-[250px] p-1">
      <div className="font-bold text-base mb-2 border-b pb-1 text-blue-600">
        {title}
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex gap-2">
          <span className="text-gray-500 w-20">Trạng thái:</span>
          <span className="font-medium">
            {getScheduleStatusLabel(extendedProps.status)}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-500 w-20">Thời gian:</span>
          <span>
            {timeText} ({duration} phút)
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-500 w-20">Nguồn phát:</span>
          <span className="flex items-center gap-1">
            {sourceIcon} {sourceText}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-500 w-20">Phạm vi:</span>
          <span className="flex items-center gap-1">
            <TeamOutlined />{" "}
            {targetCount > 0 ? `${targetCount} điểm phát` : "Toàn bộ hệ thống"}
          </span>
        </div>
      </div>

      {extendedProps.type === "EMERGENCY" && (
        <div className="mt-2 text-red-600 font-bold uppercase flex items-center gap-1">
          <AlertOutlined /> Lịch khẩn cấp
        </div>
      )}
    </div>
  );

  return (
    <Tooltip
      title={tooltipContent}
      placement="right"
      color="white"
      overlayInnerStyle={{ color: "black" }}
    >
      <div
        className="p-1 h-full flex flex-col relative rounded-md shadow-sm hover:shadow-md transition-shadow"
        style={{
          backgroundColor: extendedProps.accentColor, // Use solid color
          color: extendedProps.textColor, // Contrast text
          borderLeft: `3px solid rgba(0,0,0,0.1)`, // Subtle depth
          overflow: extendedProps.isExpanded ? "visible" : "hidden", // Show full content if expanded
        }}
      >
        <div className="font-semibold text-xs opacity-90 flex justify-between mb-0.5">
          {timeText}
          {extendedProps.type === "EMERGENCY" && (
            <AlertOutlined className="animate-pulse text-white" />
          )}
        </div>
        <div
          className={`font-bold text-sm leading-tight flex-1 ${
            extendedProps.isExpanded ? "" : "line-clamp-1"
          }`}
        >
          {title}
        </div>

        {/* Mini icon footer - HIDE when expanded */}
        {!extendedProps.isExpanded && (
          <div className={`mt-auto flex gap-2 opacity-80 text-base`}>
            {sourceIcon}
            {schedule.targetUnitIds?.length > 0 && <TeamOutlined />}
          </div>
        )}

        {/* Full details only when expanded - SIMPLIFIED: Only Button */}
        {extendedProps.isExpanded && extendedProps.onEdit && (
          <div className="mt-2 text-xs opacity-90 w-full">
            <button
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold px-3 py-1.5 rounded text-xs transition-colors w-full border border-gray-300 shadow-sm"
              onClick={(e) => {
                e.stopPropagation(); // Stop expansion toggle
                extendedProps.onEdit(schedule.id);
              }}
            >
              Xem chi tiết
            </button>
          </div>
        )}
      </div>
    </Tooltip>
  );
}

// Helper for Styles
const getEventStyles = (status: ScheduleStatus, type: ScheduleType) => {
  // Priority: Emergency -> Status
  if (type === ScheduleType.EMERGENCY) {
    return { bg: "#FEF2F2", border: "#DC2626", text: "#B91C1C" }; // Red (Emergency)
  }

  switch (status) {
    case ScheduleStatus.RUNNING:
      return { bg: "#ECFDF5", border: "#059669", text: "#047857" }; // Green
    case ScheduleStatus.APPROVED:
      // Split Approved vs Routine? Usually Routine is a Type.
      // If Type is Routine AND Approved -> Use a specific color (e.g. Blue)
      // If Type is One-Time AND Approved -> Maybe slightly different?
      // User asked "Split Approved / Routine".
      // Let's make "Approved" standard Blue.
      return { bg: "#EFF6FF", border: "#2563EB", text: "#1D4ED8" }; // Blue
    case ScheduleStatus.PENDING_APPROVAL:
      return { bg: "#FFFBEB", border: "#D97706", text: "#B45309" }; // Yellow
    case ScheduleStatus.REJECTED:
      // Separate from Emergency. Use Gray or Dark Orange.
      return { bg: "#F3F4F6", border: "#4B5563", text: "#374151" }; // Gray/Slate (Rejected/Inactive)
    default:
      return { bg: "#F3F4F6", border: "#9CA3AF", text: "#374151" };
  }
};

const getScheduleStatusLabel = (status: ScheduleStatus) => {
  switch (status) {
    case ScheduleStatus.RUNNING:
      return "Đang chạy";
    case ScheduleStatus.PENDING_APPROVAL:
      return "Chờ duyệt";
    case ScheduleStatus.APPROVED:
      return "Đã duyệt";
    case ScheduleStatus.REJECTED:
      return "Từ chối";
    default:
      return status;
  }
};
