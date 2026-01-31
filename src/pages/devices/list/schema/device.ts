import { DeviceStatus } from "@/models/Device";
import { z } from "zod";

export const deviceSchema = z.object({
  code: z.string().min(1, "Mã thiết bị là bắt buộc"),
  name: z.string().min(1, "Tên thiết bị là bắt buộc"),
  unitId: z.string().min(1, "Đơn vị là bắt buộc"),
  status: z.nativeEnum(DeviceStatus),
  hardwareInfo: z.object({
    ipAddress: z.string().optional().or(z.literal("")),
    macAddress: z.string().min(1, "MAC Address là bắt buộc"),
    serialNumber: z.string().optional(),
    modelName: z.string().optional(),
    manufacturer: z.string().optional(),
    firmwareVersion: z.string().optional(),
  }),
  deviceConfig: z.object({
    volume: z.number().min(0).max(100).default(50),
  }),
  location: z
    .object({
      address: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
});

export type DeviceFormValues = z.infer<typeof deviceSchema>;
