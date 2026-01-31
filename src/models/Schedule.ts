import { AbstractModel } from "./AbstractModel";

export enum ScheduleType {
  ROUTINE = "ROUTINE", // Lịch định kỳ (hàng ngày/tuần)
  ONE_TIME = "ONE_TIME", // Lịch phát một lần
  EMERGENCY = "EMERGENCY", // Lịch khẩn cấp (Ưu tiên cao nhất)
}

export enum ScheduleSourceType {
  FILE = "FILE", // Phát từ file audio (S3/MinIO)
  STREAM = "STREAM", // Phát từ link luồng (HLS/RTSP)
  TTS = "TTS", // Text-to-Speech
  RELAY = "RELAY", // Tiếp sóng từ cấp trên
}

export enum ScheduleStatus {
  DRAFT = "DRAFT", // Nháp
  PENDING_APPROVAL = "PENDING_APPROVAL", // Chờ duyệt
  READY = "READY", // Sẵn sàng phát
  RUNNING = "RUNNING", // Đang phát
  COMPLETED = "COMPLETED", // Đã hoàn thành
  CANCELED = "CANCELED", // Đã hủy
  APPROVED = "APPROVED", // Đã duyệt (legacy, có thể dùng cho workflow cũ)
  REJECTED = "REJECTED", // Từ chối
}

export interface Schedule extends AbstractModel {
  title: string;
  description?: string;

  // Quản lý phân cấp
  ownerUnitId: string; // Đơn vị tạo lịch
  type: ScheduleType;
  priority: number; // Độ ưu tiên (ví dụ: 1-10, Emergency = 10)

  // Cấu hình nguồn phát
  sourceType: ScheduleSourceType;
  sourceUrl: string; // Đường dẫn file hoặc link stream
  ttsContent?: string; // Nội dung văn bản nếu là TTS

  // Relay Broadcasting Config (khi sourceType = RELAY)
  sourceUnitId?: string; // Đơn vị nguồn (cơ sở/kênh phát)
  sourceChannelId?: string; // Kênh phát sóng cụ thể
  relayFromLevel?: "PROVINCE" | "DISTRICT" | "COMMUNE"; // Cấp truyền xuống

  // Cấu hình thời gian
  startTime: Date; // Thời điểm bắt đầu (với Routine là giờ:phút)
  endTime?: Date; // Thời điểm kết thúc (dự kiến)

  // Cấu hình lặp (Dùng cho ROUTINE)
  // Ví dụ: [1, 3, 5] cho Thứ 2, 4, 6
  daysOfWeek?: number[];

  // Đối tượng thụ hưởng (Targeting)
  // Có thể chọn theo Unit (phát toàn xã) hoặc danh sách Device cụ thể
  targetUnitIds: string[];
  targetDeviceIds: string[];

  status: ScheduleStatus;
  approvedBy?: string;
  createdAt: Date;
}
