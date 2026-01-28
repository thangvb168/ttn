import { Device, DeviceStatus } from "@/models/Device";
import { AbstractMock } from "@/utils/abstract-mock";
import { mockUnits } from "./mockUnit";

const defaultData: Device[] = [];
let deviceCounter = 1;

// Danh sách các nhà sản xuất và model
const manufacturers = ["Bosch", "TOA", "JBL", "Bose", "Yamaha"];
const modelNames = ["SP-100", "SP-200", "SP-300", "SP-400", "SP-500"];
const firmwareVersions = ["1.0.0", "1.1.0", "1.2.0", "2.0.0", "2.1.0"];

// Hàm tạo địa chỉ MAC ngẫu nhiên
const generateMacAddress = (counter: number, deviceNum: number): string => {
  const hex = (counter * 100 + deviceNum).toString(16).padStart(6, "0");
  return `00:1A:2B:${hex.slice(0, 2)}:${hex.slice(2, 4)}:${hex.slice(4, 6)}`;
};

// Hàm tạo số serial
const generateSerialNumber = (unitId: string, deviceNum: number): string => {
  const year = 2024;
  const month = (deviceNum % 12) + 1;
  return `SN${year}${month.toString().padStart(2, "0")}${unitId
    .toUpperCase()
    .slice(-4)}${deviceNum.toString().padStart(4, "0")}`;
};

mockUnits.getAll().forEach((unit) => {
  // Chỉ tạo thiết bị cho xã (DEPARTMENT, parent là thành phố)
  if (
    unit.type === "DEPARTMENT" &&
    unit.parentId &&
    unit.parentId.includes("city") &&
    !unit.id.includes("admin")
  ) {
    // Tạo 10 thiết bị cho mỗi xã
    for (let i = 1; i <= 10; i++) {
      const manufacturerIndex = (deviceCounter + i) % manufacturers.length;

      // Phân bố trạng thái: 60% ACTIVE, 20% IDLE, 10% INACTIVE, 5% ERROR, 5% MAINTENANCE
      let status: DeviceStatus;
      const rand = i % 20;
      if (rand < 12) status = DeviceStatus.ACTIVE;
      else if (rand < 16) status = DeviceStatus.IDLE;
      else if (rand < 18) status = DeviceStatus.INACTIVE;
      else if (rand < 19) status = DeviceStatus.ERROR;
      else status = DeviceStatus.MAINTENANCE;

      // Tạo tọa độ gần vị trí trung tâm Việt Nam (có thể điều chỉnh)
      const baseLat = 16.0 + (deviceCounter % 10) * 0.1;
      const baseLng = 108.0 + (deviceCounter % 10) * 0.1;
      const lat = baseLat + (i - 1) * 0.01;
      const lng = baseLng + (i - 1) * 0.01;

      defaultData.push({
        id: `device-${unit.id}-${i}`,
        code: `TX-${unit.id.toUpperCase()}-${i.toString().padStart(3, "0")}`,
        name: `Máy phát thanh ${unit.name} ${i}`,
        unitId: unit.id,
        status,

        hardwareInfo: {
          ipAddress: `10.${Math.floor(deviceCounter / 256)}.${
            deviceCounter % 256
          }.${i}`,
          macAddress: generateMacAddress(deviceCounter, i),
          serialNumber: generateSerialNumber(unit.id, i),
          modelName: modelNames[manufacturerIndex],
          manufacturer: manufacturers[manufacturerIndex],
          firmwareVersion: firmwareVersions[i % firmwareVersions.length],
          cpuUsage: Math.floor(Math.random() * 60) + 20, // 20-80%
          memoryUsage: Math.floor(Math.random() * 50) + 30, // 30-80%
          storageUsage: Math.floor(Math.random() * 40) + 40, // 40-80%
        },

        location: {
          address: `${unit.name}, Khu vực ${i}`,
          lat,
          lng,
        },

        mqttConfig: {
          clientId: `device-${unit.id}-${i}`,
          topicSub: `devices/${unit.id}/device-${i}/commands`,
          topicPub: `devices/${unit.id}/device-${i}/status`,
        },

        deviceConfig: {
          volume: Math.floor(Math.random() * 40) + 60, // 60-100
        },

        installedDate: new Date(2024, (deviceCounter + i) % 12, (i % 28) + 1),
      });
    }
    deviceCounter++;
  }
});

export const mockDevices = new AbstractMock<Device>({
  defaultData,
});
