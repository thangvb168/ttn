import { mockDevices } from "@/mocks/mockDevice";
import { mockUnits } from "@/mocks/mockUnit";
import {
  Schedule,
  ScheduleSourceType,
  ScheduleStatus,
  ScheduleType,
} from "@/models/Schedule";
import {
  AudioOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  EyeOutlined,
  FlagOutlined,
  LinkOutlined,
  SoundOutlined,
  StopOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import type { MenuProps, TableColumnsType } from "antd";
import {
  Badge,
  Button,
  Dropdown,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import {
  useApproveSchedule,
  useBulkDeleteSchedules,
  useCancelSchedule,
  useDeleteSchedule,
  useRejectSchedule,
} from "../hooks/useScheduleMutations";
import { useSchedules } from "../hooks/useSchedules";
import { getAvailableActions } from "../utils/scheduleActions";

interface ScheduleListTableProps {
  onEdit?: (schedule: Schedule) => void;
  onView?: (schedule: Schedule) => void;
  selectedUnitId?: string | null;
  scheduleFilter?: "all" | "unit" | "relay";
}

export const ScheduleListTable: React.FC<ScheduleListTableProps> = ({
  onEdit,
  onView,
  selectedUnitId,
  scheduleFilter = "all",
}) => {
  const { data: schedules, isLoading } = useSchedules();
  const deleteMutation = useDeleteSchedule();
  const cancelMutation = useCancelSchedule();
  const approveMutation = useApproveSchedule();
  const rejectMutation = useRejectSchedule();
  const bulkDeleteMutation = useBulkDeleteSchedules();

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");

  // Filter by unit
  // Get all child unit IDs recursively
  const getAllChildUnitIds = (unitId: string): string[] => {
    const allUnits = mockUnits.getAll();
    const childIds: string[] = [unitId]; // Include the unit itself

    const findChildren = (parentId: string) => {
      const children = allUnits.filter((u) => u.parentId === parentId);
      children.forEach((child) => {
        childIds.push(child.id);
        findChildren(child.id); // Recursive
      });
    };

    findChildren(unitId);
    return childIds;
  };

  // Filter by unit
  const filteredByUnit = useMemo(() => {
    if (!selectedUnitId || !schedules) return schedules;

    // Get all child unit IDs (including selected unit)
    const allUnitIds = getAllChildUnitIds(selectedUnitId);

    return schedules.filter((schedule) => {
      // Check if schedule belongs to selected unit or any child unit
      if (allUnitIds.includes(schedule.ownerUnitId)) return true;

      // Check if schedule targets this unit or any child unit
      if (schedule.targetUnitIds.some((id) => allUnitIds.includes(id)))
        return true;

      // Check if schedule targets devices in this unit or any child unit
      const unitDevices = mockDevices
        .getAll()
        .filter((d) => allUnitIds.includes(d.unitId));
      const unitDeviceIds = unitDevices.map((d) => d.id);
      if (schedule.targetDeviceIds.some((id) => unitDeviceIds.includes(id)))
        return true;

      return false;
    });
  }, [schedules, selectedUnitId]);

  // Filter by segment
  const filteredBySegment = useMemo(() => {
    if (!filteredByUnit) return [];

    switch (scheduleFilter) {
      case "all":
        return filteredByUnit;

      case "unit":
        // Chỉ lịch của đơn vị (không phải relay)
        return filteredByUnit.filter(
          (s) => s.sourceType !== ScheduleSourceType.RELAY
        );

      case "relay":
        // Chỉ lịch tiếp sóng
        return filteredByUnit.filter(
          (s) => s.sourceType === ScheduleSourceType.RELAY
        );

      default:
        return filteredByUnit;
    }
  }, [filteredByUnit, scheduleFilter]);

  // Filter by search
  const filteredData = useMemo(() => {
    if (!searchText) return filteredBySegment;

    const lowerSearch = searchText.toLowerCase();
    return filteredBySegment.filter(
      (s) =>
        s.title.toLowerCase().includes(lowerSearch) ||
        s.description?.toLowerCase().includes(lowerSearch) ||
        s.id.toLowerCase().includes(lowerSearch)
    );
  }, [filteredBySegment, searchText]);

  // Handle menu click
  const handleMenuClick = (key: string, record: Schedule) => {
    switch (key) {
      case "view":
        onView?.(record);
        break;

      case "edit":
        onEdit?.(record);
        break;

      case "approve":
        Modal.confirm({
          title: "Duyệt lịch phát?",
          content: `Bạn có chắc chắn muốn duyệt lịch "${record.title}"?`,
          okText: "Duyệt",
          cancelText: "Hủy",
          onOk: () => approveMutation.mutate(record.id),
        });
        break;

      case "reject":
        Modal.confirm({
          title: "Từ chối lịch phát?",
          content: `Bạn có chắc chắn muốn từ chối lịch "${record.title}"?`,
          okText: "Từ chối",
          okType: "danger",
          cancelText: "Hủy",
          onOk: () => rejectMutation.mutate(record.id),
        });
        break;

      case "cancel":
        Modal.confirm({
          title: "Hủy lịch phát?",
          content: `Bạn có chắc chắn muốn hủy lịch "${record.title}"?`,
          okText: "Hủy lịch",
          okType: "danger",
          cancelText: "Đóng",
          onOk: () => cancelMutation.mutate(record.id),
        });
        break;

      case "delete":
        Modal.confirm({
          title: "Xóa lịch phát?",
          content: `Bạn có chắc chắn muốn xóa lịch "${record.title}"? Hành động này không thể hoàn tác.`,
          okText: "Xóa",
          okType: "danger",
          cancelText: "Hủy",
          onOk: () => deleteMutation.mutate(record.id),
        });
        break;
    }
  };

  // Get menu items based on status
  const getMenuItems = (schedule: Schedule): MenuProps["items"] => {
    const actions = getAvailableActions(schedule.status);
    const items: MenuProps["items"] = [];

    // Xem chi tiết
    if (actions.canView) {
      items.push({
        key: "view",
        icon: <EyeOutlined />,
        label: "Xem chi tiết",
      });
    }

    // Sửa
    if (actions.canEdit) {
      items.push({
        key: "edit",
        icon: <EditOutlined />,
        label: "Chỉnh sửa",
      });
    }

    // Divider
    if (
      items.length > 0 &&
      (actions.canDelete ||
        actions.canCancel ||
        actions.canApprove ||
        actions.canReject)
    ) {
      items.push({ type: "divider" });
    }

    // Duyệt
    if (actions.canApprove) {
      items.push({
        key: "approve",
        icon: <CheckCircleOutlined />,
        label: "Duyệt",
      });
    }

    // Từ chối
    if (actions.canReject) {
      items.push({
        key: "reject",
        icon: <CloseCircleOutlined />,
        label: "Từ chối",
        danger: true,
      });
    }

    // Hủy
    if (actions.canCancel) {
      items.push({
        key: "cancel",
        icon: <StopOutlined />,
        label: "Hủy lịch",
        danger: true,
      });
    }

    // Xóa
    if (actions.canDelete) {
      if (items.length > 0) {
        items.push({ type: "divider" });
      }
      items.push({
        key: "delete",
        icon: <DeleteOutlined />,
        label: "Xóa",
        danger: true,
      });
    }

    return items;
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    Modal.confirm({
      title: `Xóa ${selectedRowKeys.length} lịch phát?`,
      content:
        "Bạn có chắc chắn muốn xóa các lịch đã chọn? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        bulkDeleteMutation.mutate(selectedRowKeys);
        setSelectedRowKeys([]);
      },
    });
  };

  // Row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
    getCheckboxProps: (record: Schedule) => ({
      disabled: [
        ScheduleStatus.COMPLETED,
        ScheduleStatus.CANCELED,
        ScheduleStatus.RUNNING,
      ].includes(record.status),
    }),
  };

  // Columns definition
  const columns: TableColumnsType<Schedule> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      fixed: "left",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Tên lịch phát",
      dataIndex: "title",
      key: "title",
      width: 250,
      fixed: "left",
      render: (text: string, record: Schedule) => (
        <div>
          <div className="font-semibold">{text}</div>
          {record.description && (
            <div className="text-xs text-gray-500 line-clamp-1">
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Loại lịch",
      dataIndex: "type",
      key: "type",
      width: 120,
      filters: [
        { text: "Định kỳ", value: ScheduleType.ROUTINE },
        { text: "Một lần", value: ScheduleType.ONE_TIME },
        { text: "Khẩn cấp", value: ScheduleType.EMERGENCY },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type: ScheduleType) => {
        switch (type) {
          case ScheduleType.ROUTINE:
            return <Tag color="blue">Định kỳ</Tag>;
          case ScheduleType.ONE_TIME:
            return <Tag>Một lần</Tag>;
          case ScheduleType.EMERGENCY:
            return (
              <Tag color="red" icon={<FlagOutlined />}>
                Khẩn cấp
              </Tag>
            );
          default:
            return <Tag>{type}</Tag>;
        }
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      filters: [
        { text: "Nháp", value: ScheduleStatus.DRAFT },
        { text: "Chờ duyệt", value: ScheduleStatus.PENDING_APPROVAL },
        { text: "Sẵn sàng", value: ScheduleStatus.READY },
        { text: "Đang chạy", value: ScheduleStatus.RUNNING },
        { text: "Đã hoàn thành", value: ScheduleStatus.COMPLETED },
        { text: "Đã duyệt", value: ScheduleStatus.APPROVED },
        { text: "Đã hủy", value: ScheduleStatus.CANCELED },
        { text: "Từ chối", value: ScheduleStatus.REJECTED },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: ScheduleStatus) => {
        const statusConfig: Record<
          ScheduleStatus,
          { color: string; text: string }
        > = {
          [ScheduleStatus.DRAFT]: { color: "default", text: "Nháp" },
          [ScheduleStatus.PENDING_APPROVAL]: {
            color: "orange",
            text: "Chờ duyệt",
          },
          [ScheduleStatus.READY]: { color: "cyan", text: "Sẵn sàng" },
          [ScheduleStatus.RUNNING]: { color: "green", text: "Đang chạy" },
          [ScheduleStatus.COMPLETED]: {
            color: "blue",
            text: "Đã hoàn thành",
          },
          [ScheduleStatus.APPROVED]: { color: "blue", text: "Đã duyệt" },
          [ScheduleStatus.CANCELED]: { color: "default", text: "Đã hủy" },
          [ScheduleStatus.REJECTED]: { color: "red", text: "Từ chối" },
        };

        const config = statusConfig[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "Ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      sorter: (a, b) => b.priority - a.priority,
      render: (priority: number) => {
        if (priority >= 8) {
          return (
            <Badge count={priority} style={{ backgroundColor: "#f5222d" }}>
              <Tag color="red" icon={<FlagOutlined />}>
                Cao
              </Tag>
            </Badge>
          );
        }
        if (priority >= 5) {
          return <Tag color="orange">TB</Tag>;
        }
        return <span className="text-gray-400">{priority}</span>;
      },
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startTime",
      key: "startTime",
      width: 150,
      sorter: (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      defaultSortOrder: "descend",
      render: (date: Date) => (
        <span>{dayjs(date).format("DD/MM/YYYY HH:mm")}</span>
      ),
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "endTime",
      key: "endTime",
      width: 150,
      render: (date: Date | undefined) =>
        date ? (
          <span>{dayjs(date).format("DD/MM/YYYY HH:mm")}</span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: "Thời lượng",
      key: "duration",
      width: 100,
      render: (_: any, record: Schedule) => {
        if (!record.endTime) return <span className="text-gray-400">-</span>;
        const duration = dayjs(record.endTime).diff(
          dayjs(record.startTime),
          "minute"
        );
        return <span>{duration} phút</span>;
      },
    },
    {
      title: "Nguồn phát",
      dataIndex: "sourceType",
      key: "sourceType",
      width: 150,
      filters: [
        { text: "File âm thanh", value: ScheduleSourceType.FILE },
        { text: "Tiếp sóng", value: ScheduleSourceType.STREAM },
        { text: "TTS", value: ScheduleSourceType.TTS },
        { text: "Relay", value: ScheduleSourceType.RELAY },
      ],
      onFilter: (value, record) => record.sourceType === value,
      render: (sourceType: ScheduleSourceType) => {
        const sourceConfig: Record<
          ScheduleSourceType,
          { icon: React.ReactNode; text: string; color?: string }
        > = {
          [ScheduleSourceType.FILE]: {
            icon: <AudioOutlined />,
            text: "File âm thanh",
          },
          [ScheduleSourceType.STREAM]: {
            icon: <LinkOutlined />,
            text: "Tiếp sóng",
          },
          [ScheduleSourceType.TTS]: {
            icon: <SoundOutlined />,
            text: "TTS",
          },
          [ScheduleSourceType.RELAY]: {
            icon: <ThunderboltOutlined />,
            text: "Relay",
            color: "purple",
          },
        };

        const config = sourceConfig[sourceType];
        return (
          <span>
            {config.icon} <span className="ml-1">{config.text}</span>
          </span>
        );
      },
    },
    {
      title: "Phạm vi",
      key: "target",
      width: 120,
      render: (_: any, record: Schedule) => {
        const unitCount = record.targetUnitIds.length;
        const deviceCount = record.targetDeviceIds.length;
        const total = unitCount + deviceCount;

        if (total === 0) {
          return <Tag color="blue">Toàn hệ thống</Tag>;
        }

        // Get unit names
        const allUnits = mockUnits.getAll();
        const unitNames = record.targetUnitIds
          .map((id) => {
            const unit = allUnits.find((u) => u.id === id);
            return unit?.name || id;
          })
          .slice(0, 10); // Limit to 10

        // Get device names
        const allDevices = mockDevices.getAll();
        const deviceNames = record.targetDeviceIds
          .map((id) => {
            const device = allDevices.find((d) => d.id === id);
            return device?.name || id;
          })
          .slice(0, 10); // Limit to 10

        const tooltipContent = (
          <div className="max-h-60 overflow-y-auto">
            {unitCount > 0 && (
              <div className="mb-2">
                <div className="font-semibold text-blue-300 mb-1">
                  📍 Đơn vị ({unitCount}):
                </div>
                <ul className="list-disc list-inside text-xs space-y-0.5">
                  {unitNames.map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                  {unitCount > 10 && (
                    <li className="text-gray-400">
                      ... và {unitCount - 10} đơn vị khác
                    </li>
                  )}
                </ul>
              </div>
            )}
            {deviceCount > 0 && (
              <div>
                <div className="font-semibold text-green-300 mb-1">
                  📡 Thiết bị ({deviceCount}):
                </div>
                <ul className="list-disc list-inside text-xs space-y-0.5">
                  {deviceNames.map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                  {deviceCount > 10 && (
                    <li className="text-gray-400">
                      ... và {deviceCount - 10} thiết bị khác
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        );

        return (
          <Tooltip title={tooltipContent} overlayStyle={{ maxWidth: 400 }}>
            <Tag>{total} điểm phát</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: Date) => <span>{dayjs(date).format("DD/MM/YYYY")}</span>,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      align: "center",
      fixed: "right",
      render: (_: any, record: Schedule) => (
        <Dropdown
          menu={{
            items: getMenuItems(record),
            onClick: (e) => handleMenuClick(e.key, record),
          }}
          trigger={["click"]}
        >
          <Button size="small">
            {/* Thao tác <DownOutlined /> */}
            <EllipsisOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex justify-between items-center">
        <Input.Search
          placeholder="Tìm kiếm theo tên, mô tả, ID..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={setSearchText}
          style={{ width: 350 }}
          allowClear
        />

        {selectedRowKeys.length > 0 && (
          <Space>
            <span className="text-gray-600">
              Đã chọn {selectedRowKeys.length} mục
            </span>
            <Button danger icon={<DeleteOutlined />} onClick={handleBulkDelete}>
              Xóa đã chọn
            </Button>
            <Button onClick={() => setSelectedRowKeys([])}>Bỏ chọn</Button>
          </Space>
        )}
      </div>

      {/* Table */}
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        rowSelection={rowSelection}
        scroll={{ x: 1800 }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total) => `Tổng ${total} lịch phát`,
        }}
        size="small"
      />
    </div>
  );
};
