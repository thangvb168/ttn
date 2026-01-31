import { mockUnits } from "@/mocks/mockUnit";
import { Schedule } from "@/models/Schedule";
import { UnitType } from "@/models/Unit";
import { buildTree } from "@/pages/devices/list/utils/build-tree";
import {
  AppstoreOutlined,
  AudioOutlined,
  BarsOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Badge, Button, Modal, Segmented, TreeSelect } from "antd";
import { useMemo, useState } from "react";
import { ApprovalQueue } from "./components/ApprovalQueue";
import { ConflictListModal } from "./components/ConflictListModal";
import { LiveBroadcastModal } from "./components/LiveBroadcastModal";
import { ScheduleCalendar } from "./components/ScheduleCalendar";
import { ScheduleDetailModal } from "./components/ScheduleDetailModal";
import { ScheduleForm } from "./components/ScheduleForm";
import { ScheduleListTable } from "./components/ScheduleListTable";
import { useConflicts } from "./hooks/useConflicts";
import { useSchedules } from "./hooks/useSchedules";

// Create a client
const queryClient = new QueryClient();

// Conflict Button Component with Badge
const ConflictButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { data: conflicts } = useConflicts();
  const conflictCount = conflicts?.length || 0;
  const highSeverityCount =
    conflicts?.filter((c) => c.severity === "HIGH").length || 0;

  return (
    <Badge
      count={conflictCount}
      offset={[10, 0]}
      showZero={false}
      className="mr-4"
    >
      <Button
        icon={<ExclamationCircleOutlined />}
        onClick={onClick}
        danger={highSeverityCount > 0}
      >
        Cảnh báo xung đột
      </Button>
    </Badge>
  );
};

const SchedulePageContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(
    undefined
  );
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [isLiveBroadcastModalOpen, setIsLiveBroadcastModalOpen] =
    useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState<Schedule | undefined>(
    undefined
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "table">("table");
  const [scheduleFilter, setScheduleFilter] = useState<
    "all" | "unit" | "relay"
  >("all");

  const { data: schedules } = useSchedules();
  const { data: allConflicts } = useConflicts();

  const treeData = useMemo(() => {
    return buildTree(
      mockUnits.getAll().filter((u) => u.type !== UnitType.EMPLOYEE)
    );
  }, []);

  return (
    <PageContainer
      title="Quản lý lịch phát"
      extra={[
        <ConflictButton
          key="conflicts"
          onClick={() => setIsConflictModalOpen(true)}
        />,
        <Button
          key="approval"
          icon={<HistoryOutlined />}
          onClick={() => setIsApprovalModalOpen(true)}
          className="mr-4"
        >
          Danh sách chờ duyệt
        </Button>,
        <Button
          key="live-broadcast"
          type="primary"
          danger
          icon={<AudioOutlined />}
          onClick={() => setIsLiveBroadcastModalOpen(true)}
          className="mr-4"
        >
          Phát trực tiếp
        </Button>,
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Tạo lịch mới
        </Button>,
      ]}
    >
      <div className="flex justify-between items-center mb-4 gap-4">
        {/* Schedule Filter Segment */}
        <div className="flex gap-4 items-center">
          <Segmented
            value={scheduleFilter}
            onChange={(value) =>
              setScheduleFilter(value as "all" | "unit" | "relay")
            }
            options={[
              { label: "Tất cả", value: "all" },
              { label: "Đơn vị", value: "unit" },
              { label: "Tiếp sóng", value: "relay" },
            ]}
          />
          <TreeSelect
            showSearch
            style={{ width: 300 }}
            value={selectedUnitId}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            placeholder="Chọn đơn vị quản lý"
            allowClear
            treeDefaultExpandAll
            onChange={setSelectedUnitId}
            treeData={treeData}
          />
        </div>

        {/* View Switcher */}
        <Segmented
          value={viewMode}
          onChange={(v) => setViewMode(v as "calendar" | "table")}
          options={[
            {
              label: "Lịch biểu",
              value: "calendar",
              icon: <AppstoreOutlined />,
            },
            { label: "Danh sách", value: "table", icon: <BarsOutlined /> },
          ]}
        />
      </div>

      {/* Main Content */}
      {viewMode === "calendar" ? (
        <ScheduleCalendar
          onEdit={(id) => {
            const schedule = schedules?.find((s) => s.id === id);
            setEditingSchedule(schedule);
            setIsModalOpen(true);
          }}
          selectedUnitId={selectedUnitId}
          scheduleFilter={scheduleFilter}
        />
      ) : (
        <ScheduleListTable
          onEdit={(schedule) => {
            setEditingSchedule(schedule);
            setIsModalOpen(true);
          }}
          onView={(schedule) => {
            setViewingSchedule(schedule);
            setIsDetailModalOpen(true);
          }}
          selectedUnitId={selectedUnitId}
          scheduleFilter={scheduleFilter}
        />
      )}

      <ScheduleForm
        open={isModalOpen}
        initialValues={editingSchedule}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingSchedule(undefined);
        }}
        onSubmit={(values) => {
          console.log("Submit:", values);
          setIsModalOpen(false);
          setEditingSchedule(undefined);
        }}
      />

      <Modal
        title="Duyệt lịch chờ"
        open={isApprovalModalOpen}
        onCancel={() => setIsApprovalModalOpen(false)}
        footer={null}
        width={700}
      >
        <ApprovalQueue />
      </Modal>

      <Modal
        title="Danh sách lịch xung đột"
        open={isConflictModalOpen}
        onCancel={() => setIsConflictModalOpen(false)}
        footer={null}
        width={900}
      >
        <ConflictListModal
          conflicts={allConflicts || []}
          schedules={schedules || []}
        />
      </Modal>

      <LiveBroadcastModal
        open={isLiveBroadcastModalOpen}
        onClose={() => setIsLiveBroadcastModalOpen(false)}
      />

      <ScheduleDetailModal
        open={isDetailModalOpen}
        schedule={viewingSchedule || null}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingSchedule(undefined);
        }}
        onEdit={(schedule) => {
          setEditingSchedule(schedule);
          setIsModalOpen(true);
        }}
      />
    </PageContainer>
  );
};

const SchedulePage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SchedulePageContent />
    </QueryClientProvider>
  );
};

export default SchedulePage;
