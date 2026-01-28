import { AbstractModel } from "./AbstractModel";

export enum DeviceStatus {
  INACTIVE = "INACTIVE", // Thiết bị không hoạt động
  IDLE = "IDLE", // Thiết bị nhàn rỗi
  ACTIVE = "ACTIVE", // Thiết bị đang hoạt động
  ERROR = "ERROR", // Thiết bị gặp lỗi
  MAINTENANCE = "MAINTENANCE", // Thiết bị đang bảo trì
}

export const getDeviceStatusLabels = () => {
  return {
    [DeviceStatus.INACTIVE]: "Đã tắt",
    [DeviceStatus.IDLE]: "Nhàn rỗi",
    [DeviceStatus.ACTIVE]: "Đang hoạt động",
    [DeviceStatus.ERROR]: "Gặp lỗi",
    [DeviceStatus.MAINTENANCE]: "Đang bảo trì",
  };
};

export const getDeviceStatusColors = () => {
  return {
    [DeviceStatus.INACTIVE]: "gray",
    [DeviceStatus.IDLE]: "yellow",
    [DeviceStatus.ACTIVE]: "green",
    [DeviceStatus.ERROR]: "red",
    [DeviceStatus.MAINTENANCE]: "blue",
  };
};

/**
 * Speaker Device Model
 */
export interface Device extends AbstractModel {
  // Thông tin chung
  code: string; // Mã thiết bị
  name: string; // Tên thiết bị
  unitId: string; // Đơn vị trực tiếp sử dụng ( đơn vị phát thanh)

  // Trạng thái
  status: DeviceStatus; // Trạng thái hiện tại của thiết bị

  // Thông tin phần cứng
  hardwareInfo: {
    ipAddress: string; // Địa chỉ IP
    macAddress: string; // Địa chỉ MAC
    serialNumber: string; // Số serial
    modelName: string; // Tên model
    manufacturer: string; // Nhà sản xuất
    firmwareVersion: string; // Cần thiết để quản lý cập nhật từ xa (OTA)
    cpuUsage: number; // Phần trăm sử dụng CPU
    memoryUsage: number; // Phần trăm sử dụng bộ nhớ
    storageUsage: number; // Phần trăm sử dụng lưu trữ
  };

  location: {
    address: string;
    lat: number;
    lng: number;
  };

  mqttConfig: {
    clientId: string;
    topicSub: string;
    topicPub: string;
  };

  deviceConfig: {
    volume: number; // Mức âm lượng (0-100)
  };

  installedDate: Date;
}
