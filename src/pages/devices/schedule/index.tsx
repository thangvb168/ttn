// import { mockSchedules } from "@/mocks/mockSchedule"; // Removed as we import from hook now
import { mockUnits } from "@/mocks/mockUnit";
import { Schedule } from "@/models/Schedule";
import { UnitType } from "@/models/Unit";
import { buildTree } from "@/pages/devices/list/utils/build-tree";
import {
  AppstoreOutlined,
  BarsOutlined,
  HistoryOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { PageContainer } from "@ant-design/pro-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button, Modal, Segmented, TreeSelect } from "antd";
import { useMemo, useState } from "react";
import { ApprovalQueue } from "./components/ApprovalQueue";
import { ScheduleCalendar } from "./components/ScheduleCalendar";
import { ScheduleForm } from "./components/ScheduleForm";
import { ScheduleListTable } from "./components/ScheduleListTable";
import { mockSchedules } from "./hooks/useSchedules";

// Create a client
const queryClient = new QueryClient();

const SchedulePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(
    undefined
  );
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("mien-bac");
  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar");

  const treeData = useMemo(() => {
    return buildTree(
      mockUnits.getAll().filter((u) => u.type !== UnitType.EMPLOYEE)
    );
  }, []);

  return (
    <PageContainer
      title="Quản lý lịch phát"
      extra={[
        <Button
          key="approval"
          icon={<HistoryOutlined />}
          onClick={() => setIsApprovalModalOpen(true)}
        >
          Danh sách chờ duyệt
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
      <QueryClientProvider client={queryClient}>
        <div className="flex justify-between items-center mb-4 gap-4">
          {/* Unit Filter */}
          <div className="flex-1">
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
              const schedule = mockSchedules.find((s) => s.id === id);
              setEditingSchedule(schedule);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <ScheduleListTable />
        )}

        <ScheduleForm
          open={isModalOpen}
          initialValues={editingSchedule} // Pass editing data
          onCancel={() => {
            setIsModalOpen(false);
            setEditingSchedule(undefined); // Reset on close
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
      </QueryClientProvider>
    </PageContainer>
  );
};

export default SchedulePage;
