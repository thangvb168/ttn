import {
  Device,
  DeviceStatus,
  getDeviceStatusColors,
  getDeviceStatusLabels,
} from "@/models/Device";
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from "@ant-design/pro-components";
import { Button, Dropdown, Input, Segmented, Tag } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { UnitTree } from "./components/UnitTree";
import { queryDevices } from "./service";

// Basic useDebounce hook implementation inside the file or imported.
// Since we don't have a shared hooks file yet, I'll add it here for simplicity or use a timeout.

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const ListDevicePage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);

  // ... columns ...
  const columns: ProColumns<Device>[] = [
    // ... (keep columns same)
    {
      title: "STT",
      dataIndex: "index",
      valueType: "indexBorder",
      width: 60,
      fixed: "left",
    },
    {
      title: "Mã thiết bị",
      dataIndex: "code",
      copyable: true,
      ellipsis: true,
      width: 240,
      fixed: "left",
    },
    {
      title: "Tên thiết bị",
      dataIndex: "name",
      ellipsis: true,
      width: 240,
      search: false,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      valueType: "select",
      valueEnum: {
        [DeviceStatus.ACTIVE]: { text: "Đang hoạt động", status: "Success" },
        [DeviceStatus.INACTIVE]: { text: "Đã tắt", status: "Default" },
        [DeviceStatus.ERROR]: { text: "Gặp lỗi", status: "Error" },
        [DeviceStatus.MAINTENANCE]: {
          text: "Đang bảo trì",
          status: "Processing",
        },
        [DeviceStatus.IDLE]: { text: "Nhàn rỗi", status: "Warning" },
      },
      render: (_, record) => {
        const color = getDeviceStatusColors()[record.status];
        const label = getDeviceStatusLabels()[record.status];
        return <Tag color={color}>{label}</Tag>;
      },
      width: 120,
    },
    {
      title: "Địa chỉ IP",
      dataIndex: ["hardwareInfo", "ipAddress"],
      search: false,
      width: 120,
    },
    {
      title: "MAC Address",
      dataIndex: ["hardwareInfo", "macAddress"],
      search: false,
      copyable: true,
      width: 160,
    },
    {
      title: "Âm lượng",
      dataIndex: ["deviceConfig", "volume"],
      search: false,
      render: (dom) => `${dom}%`,
      width: 120,
    },
    {
      title: "Ngày lắp đặt",
      dataIndex: "installedDate",
      valueType: "date",
      search: false,
      width: 120,
    },
    {
      title: "Thao tác",
      valueType: "option",
      key: "option",
      align: "center",
      width: 84,
      render: (_, record) => {
        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  label: "Chỉnh sửa",
                  icon: <EditOutlined />,
                },
                {
                  key: "delete",
                  label: "Xóa",
                  icon: <DeleteOutlined />,
                  danger: true,
                },
              ],
            }}
          >
            <EllipsisOutlined />
          </Dropdown>
        );
      },
      fixed: "right",
    },
  ];

  const [selectedUnitIds, setSelectedUnitIds] = useState<React.Key[]>([]);
  const [data, setData] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Use debounced keyword for fetching
  const debouncedKeyword = useDebounce(keyword, 500);

  useEffect(() => {
    if (actionRef.current) {
      actionRef.current.reload();
    }
  }, [selectedUnitIds]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await queryDevices({
          current: current,
          pageSize: pageSize,
          unitIds: selectedUnitIds,
          keyword: debouncedKeyword, // Use debounced value
          status: statusFilter === "all" ? undefined : statusFilter,
        });
        setData(response.data);
        setTotal(response.total);
      } catch (error) {
        console.error("Error fetching devices:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [current, pageSize, selectedUnitIds, debouncedKeyword, statusFilter]); // Depend on debouncedKeyword

  return (
    <PageContainer>
      <div className="grid lg:grid-cols-5 grid-cols-1 gap-2">
        <div className="col-span-1">
          <UnitTree onSelect={(keys) => setSelectedUnitIds(keys)} />
        </div>
        <div className="lg:col-span-4 col-span-1">
          <ProTable<Device>
            actionRef={actionRef}
            // ... options ...
            options={{
              density: false,
              fullScreen: false,
              reload: false,
              setting: false,
            }}
            rowKey="id"
            search={false}
            scroll={{ x: 1300 }}
            toolBarRender={() => [
              <Input.Search
                key="search"
                placeholder="Tìm kiếm"
                style={{ width: 200 }}
                // Update to use onChange
                onChange={(e) => setKeyword(e.target.value)}
                onSearch={(value) => setKeyword(value)} // Still keep onSearch for immediate Enter
                allowClear
                value={keyword} // Bind value
              />,
              // ... segments ...
              <Segmented
                key="segment"
                options={[
                  { label: "Tất cả", value: "all" },
                  { label: "Đang hoạt động", value: DeviceStatus.ACTIVE },
                  { label: "Đã tắt", value: DeviceStatus.INACTIVE },
                  { label: "Lỗi", value: DeviceStatus.ERROR },
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as string)}
              />,
              <Button type="primary" key="primary" icon={<PlusOutlined />}>
                Thêm thiết bị
              </Button>,
            ]}
            request={async (params) => {
              return {
                data: [],
                success: true,
              };
            }}
            columns={columns}
            searchFormRender={undefined}
            dataSource={data}
            loading={isLoading}
            pagination={{
              pageSize: pageSize,
              total: total,
              current: current,
              onChange: (page, pageSize) => {
                setCurrent(page);
                setPageSize(pageSize);
              },
            }}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default ListDevicePage;
