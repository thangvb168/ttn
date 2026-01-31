import {
  Schedule,
  ScheduleSourceType,
  ScheduleStatus,
  ScheduleType,
} from "@/models/Schedule";
import { useQuery } from "@tanstack/react-query";
// Mock data
export const mockSchedules: Schedule[] = [
  {
    id: "1",
    title: "Phát bản tin sáng",
    ownerUnitId: "u1",
    type: ScheduleType.ROUTINE,
    priority: 5,
    sourceType: ScheduleSourceType.FILE,
    sourceUrl: "https://example.com/morning-news.mp3",
    startTime: new Date(new Date().setHours(7, 0, 0, 0)),
    endTime: new Date(new Date().setHours(7, 30, 0, 0)),
    daysOfWeek: [1, 2, 3, 4, 5],
    targetUnitIds: ["u1"],
    targetDeviceIds: [],
    status: ScheduleStatus.APPROVED,
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Thông báo khẩn cấp",
    ownerUnitId: "u1",
    type: ScheduleType.EMERGENCY,
    priority: 10,
    sourceType: ScheduleSourceType.TTS,
    ttsContent: "Cảnh báo bão khẩn cấp, đề nghị bà con chú ý!",
    sourceUrl: "",
    startTime: new Date(new Date().setHours(10, 0, 0, 0)),
    endTime: new Date(new Date().setHours(10, 15, 0, 0)),
    targetUnitIds: ["u1"],
    targetDeviceIds: [],
    status: ScheduleStatus.RUNNING,
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Chương trình ca nhạc",
    ownerUnitId: "u1",
    type: ScheduleType.ONE_TIME,
    priority: 3,
    sourceType: ScheduleSourceType.STREAM,
    sourceUrl: "http://stream.example.com/radio",
    startTime: new Date(new Date().setHours(15, 0, 0, 0)),
    endTime: new Date(new Date().setHours(16, 0, 0, 0)),
    targetUnitIds: [],
    targetDeviceIds: ["d1", "d2"],
    status: ScheduleStatus.PENDING_APPROVAL,
    createdAt: new Date(),
  },
];

export const useSchedules = () => {
  return useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return mockSchedules;
    },
  });
};
