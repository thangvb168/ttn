import { mockUnits } from "@/mocks/mockUnit";
import { Device, DeviceStatus } from "@/models/Device";
import { Badge, Table } from "antd";
import React, { useEffect, useMemo, useState } from "react";

interface DeviceStatusTableProps {
  selectedUnitId?: string;
}

// Mock Data
const initialDevices: Device[] = [
  {
    id: "d1",
    code: "D001",
    name: "Loa Bưu điện Mỹ An",
    status: DeviceStatus.ACTIVE,
    unitId: "u1",
    hardwareInfo: {
      ipAddress: "192.168.1.10",
      macAddress: "AA:BB:CC:DD:EE:01",
      serialNumber: "SN-001",
      modelName: "Speaker Pro X",
      manufacturer: "SoundCorp",
      firmwareVersion: "1.0.0",
      cpuUsage: 10,
      memoryUsage: 20,
      storageUsage: 30,
    },
    deviceConfig: { volume: 50 },
    location: { lat: 10.0, lng: 105.0, address: "Mỹ An, Cần Thơ" },
    mqttConfig: {
      clientId: "d1",
      topicSub: "dev/d1/sub",
      topicPub: "dev/d1/pub",
    },
    installedDate: new Date(),
  },
  {
    id: "d2",
    code: "D002",
    name: "Loa Nhà Văn hóa",
    status: DeviceStatus.IDLE,
    unitId: "u1",
    hardwareInfo: {
      ipAddress: "192.168.1.11",
      macAddress: "AA:BB:CC:DD:EE:02",
      serialNumber: "SN-002",
      modelName: "Speaker Pro X",
      manufacturer: "SoundCorp",
      firmwareVersion: "1.0.0",
      cpuUsage: 5,
      memoryUsage: 15,
      storageUsage: 25,
    },
    deviceConfig: { volume: 60 },
    location: { lat: 10.01, lng: 105.01, address: "Nhà Văn hóa Huyện" },
    mqttConfig: {
      clientId: "d2",
      topicSub: "dev/d2/sub",
      topicPub: "dev/d2/pub",
    },
    installedDate: new Date(),
  },
  {
    id: "d3",
    code: "D003",
    name: "Loa Cổng Chào",
    status: DeviceStatus.ERROR,
    unitId: "u2",
    hardwareInfo: {
      ipAddress: "192.168.1.12",
      macAddress: "AA:BB:CC:DD:EE:03",
      serialNumber: "SN-003",
      modelName: "Speaker Lite",
      manufacturer: "SoundCorp",
      firmwareVersion: "0.9.0",
      cpuUsage: 0,
      memoryUsage: 0,
      storageUsage: 0,
    },
    deviceConfig: { volume: 0 },
    location: { lat: 10.02, lng: 105.02, address: "Cổng Chào Xã" },
    mqttConfig: {
      clientId: "d3",
      topicSub: "dev/d3/sub",
      topicPub: "dev/d3/pub",
    },
    installedDate: new Date(),
  },
];

export const DeviceStatusTable: React.FC<DeviceStatusTableProps> = ({
  selectedUnitId,
}) => {
  const [data, setData] = useState<Device[]>(initialDevices);

  // Recursive Filter Logic
  const filteredData = useMemo(() => {
    if (!selectedUnitId) return data;

    // Find all descendants of selectedUnitId
    const allUnits = mockUnits.getAll();
    const relevantUnitIds = new Set<string>();

    const collect = (unitId: string) => {
      relevantUnitIds.add(unitId);
      allUnits
        .filter((u) => u.parentId === unitId)
        .forEach((u) => collect(u.id));
    };
    collect(selectedUnitId);

    return data.filter((d) => relevantUnitIds.has(d.unitId));
  }, [data, selectedUnitId]);

  // Simulate Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((d) => ({
          ...d,
          status:
            Math.random() > 0.7
              ? d.status === DeviceStatus.ACTIVE
                ? DeviceStatus.IDLE
                : DeviceStatus.ACTIVE
              : d.status,
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const columns = [
    {
      title: "Mã thiết bị",
      dataIndex: "code",
      key: "code",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Tên thiết bị",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "IP",
      dataIndex: ["hardwareInfo", "ipAddress"],
      key: "ip",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: DeviceStatus) => {
        let color = "default";
        let text = "Không rõ";
        switch (status) {
          case DeviceStatus.ACTIVE:
            color = "success";
            text = "Đang phát";
            break;
          case DeviceStatus.IDLE:
            color = "processing";
            text = "Sẵn sàng";
            break;
          case DeviceStatus.ERROR:
            color = "error";
            text = "Lỗi";
            break;
          case DeviceStatus.MAINTENANCE:
            color = "warning";
            text = "Bảo trì";
            break; // Assuming MAINTENANCE exists
        }
        return <Badge status={color as any} text={text} />;
      },
    },
  ];

  return (
    <Table
      dataSource={filteredData}
      columns={columns}
      rowKey="id"
      pagination={false}
      size="small"
    />
  );
};
