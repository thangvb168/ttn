import {
  Schedule,
  ScheduleSourceType,
  ScheduleStatus,
  ScheduleType,
} from "@/models/Schedule";
import { AbstractMock } from "@/utils/abstract-mock";
import { mockDevices } from "./mockDevice";
import { mockUnits } from "./mockUnit";

// Helper functions
const getRandomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const getRandomElements = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
};

// Schedule templates
const scheduleTemplates = [
  // Morning broadcasts
  {
    title: "Bản tin sáng",
    duration: 30,
    priority: 7,
    type: ScheduleType.ROUTINE,
  },
  {
    title: "Chào cờ đầu tuần",
    duration: 15,
    priority: 8,
    type: ScheduleType.ROUTINE,
  },
  {
    title: "Thông báo thời tiết",
    duration: 10,
    priority: 5,
    type: ScheduleType.ROUTINE,
  },
  {
    title: "Tin tức trong nước",
    duration: 20,
    priority: 6,
    type: ScheduleType.ONE_TIME,
  },
  {
    title: "Tin tức quốc tế",
    duration: 15,
    priority: 5,
    type: ScheduleType.ONE_TIME,
  },

  // Noon broadcasts
  {
    title: "Bản tin trưa",
    duration: 30,
    priority: 7,
    type: ScheduleType.ROUTINE,
  },
  {
    title: "Thông tin thị trường",
    duration: 15,
    priority: 5,
    type: ScheduleType.ONE_TIME,
  },
  {
    title: "Tư vấn nông nghiệp",
    duration: 20,
    priority: 6,
    type: ScheduleType.ROUTINE,
  },

  // Afternoon broadcasts
  {
    title: "Chương trình ca nhạc",
    duration: 60,
    priority: 4,
    type: ScheduleType.ONE_TIME,
  },
  {
    title: "Tuyên truyền pháp luật",
    duration: 30,
    priority: 6,
    type: ScheduleType.ROUTINE,
  },
  {
    title: "Giáo dục sức khỏe",
    duration: 25,
    priority: 5,
    type: ScheduleType.ONE_TIME,
  },
  {
    title: "Văn hóa địa phương",
    duration: 30,
    priority: 5,
    type: ScheduleType.ONE_TIME,
  },

  // Evening broadcasts
  {
    title: "Bản tin tối",
    duration: 30,
    priority: 7,
    type: ScheduleType.ROUTINE,
  },
  {
    title: "Chương trình giải trí",
    duration: 60,
    priority: 4,
    type: ScheduleType.ONE_TIME,
  },
  {
    title: "Nhạc dân ca",
    duration: 45,
    priority: 4,
    type: ScheduleType.ONE_TIME,
  },
  {
    title: "Thể thao trong tuần",
    duration: 30,
    priority: 5,
    type: ScheduleType.ROUTINE,
  },

  // Special broadcasts
  {
    title: "Thông báo khẩn cấp",
    duration: 15,
    priority: 10,
    type: ScheduleType.EMERGENCY,
  },
  {
    title: "Cảnh báo thiên tai",
    duration: 10,
    priority: 10,
    type: ScheduleType.EMERGENCY,
  },
  {
    title: "Hướng dẫn sơ tán",
    duration: 20,
    priority: 10,
    type: ScheduleType.EMERGENCY,
  },
  {
    title: "Thông báo quan trọng",
    duration: 15,
    priority: 9,
    type: ScheduleType.EMERGENCY,
  },

  // Educational
  {
    title: "Học tiếng Anh qua radio",
    duration: 30,
    priority: 5,
    type: ScheduleType.ROUTINE,
  },
  {
    title: "Kỹ năng sống",
    duration: 25,
    priority: 5,
    type: ScheduleType.ONE_TIME,
  },
  {
    title: "Tư vấn pháp luật",
    duration: 30,
    priority: 6,
    type: ScheduleType.ROUTINE,
  },

  // Community
  {
    title: "Góc thư bạn đọc",
    duration: 20,
    priority: 4,
    type: ScheduleType.ONE_TIME,
  },
  {
    title: "Câu chuyện làng xóm",
    duration: 30,
    priority: 4,
    type: ScheduleType.ONE_TIME,
  },
  {
    title: "Tuyên dương điển hình",
    duration: 25,
    priority: 6,
    type: ScheduleType.ONE_TIME,
  },
];

// Time slots for broadcasts (hour)
const timeSlots = [
  6,
  6.5,
  7,
  7.5,
  8,
  8.5,
  9,
  9.5,
  10,
  10.5,
  11,
  11.5, // Morning
  12,
  12.5, // Noon
  14,
  14.5,
  15,
  15.5,
  16,
  16.5,
  17,
  17.5, // Afternoon
  18,
  18.5,
  19,
  19.5,
  20,
  20.5,
  21,
  21.5, // Evening
];

// Get all ward units for targeting
const wardUnits = mockUnits
  .getAll()
  .filter((u) => u.id.startsWith("ward-") && !u.id.includes("admin"));
const allDevices = mockDevices.getAll();

// Generate schedules
const defaultData: Schedule[] = [];
let scheduleCounter = 1;

// Current date reference
const now = new Date();
const currentHour = now.getHours();
const currentMinute = now.getMinutes();

// Generate for 20 days (-10 to +10)
for (let dayOffset = -10; dayOffset <= 10; dayOffset++) {
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + dayOffset);
  targetDate.setHours(0, 0, 0, 0);

  // Determine if this is past, present, or future
  const isPast = dayOffset < 0;
  const isToday = dayOffset === 0;
  const isFuture = dayOffset > 0;

  // Number of schedules for this day (10-20)
  const schedulesPerDay = Math.floor(Math.random() * 11) + 10; // 10-20

  // Generate schedules for this day
  for (let i = 0; i < schedulesPerDay; i++) {
    const template = getRandomElement(scheduleTemplates);
    const timeSlot = getRandomElement(timeSlots);

    // Calculate start time
    const startTime = new Date(targetDate);
    const hours = Math.floor(timeSlot);
    const minutes = (timeSlot % 1) * 60;
    startTime.setHours(hours, minutes, 0, 0);

    // Calculate end time
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + template.duration);

    // Determine if this schedule is currently running
    const isCurrentlyRunning =
      isToday &&
      currentHour === hours &&
      currentMinute >= minutes &&
      currentMinute < minutes + template.duration;

    // Determine status based on time and randomness
    let status: ScheduleStatus;

    if (template.type === ScheduleType.EMERGENCY) {
      // Emergency schedules
      if (isPast) {
        status =
          Math.random() > 0.8
            ? ScheduleStatus.CANCELED
            : ScheduleStatus.COMPLETED;
      } else if (isCurrentlyRunning) {
        status = ScheduleStatus.RUNNING;
      } else {
        status =
          Math.random() > 0.5 ? ScheduleStatus.READY : ScheduleStatus.APPROVED;
      }
    } else {
      // Regular schedules
      if (isPast) {
        // Past: mostly COMPLETED, some CANCELED
        const rand = Math.random();
        if (rand < 0.85) status = ScheduleStatus.COMPLETED;
        else if (rand < 0.95) status = ScheduleStatus.CANCELED;
        else status = ScheduleStatus.REJECTED;
      } else if (isCurrentlyRunning) {
        status = ScheduleStatus.RUNNING;
      } else if (isFuture || isToday) {
        // Future: mix of statuses
        const rand = Math.random();
        if (rand < 0.05) status = ScheduleStatus.DRAFT;
        else if (rand < 0.2) status = ScheduleStatus.PENDING_APPROVAL;
        else if (rand < 0.45) status = ScheduleStatus.READY;
        else if (rand < 0.7) status = ScheduleStatus.APPROVED;
        else if (rand < 0.85) status = ScheduleStatus.READY;
        else if (rand < 0.95) status = ScheduleStatus.PENDING_APPROVAL;
        else status = ScheduleStatus.REJECTED;
      } else {
        status = ScheduleStatus.READY;
      }
    }

    // Determine source type
    let sourceType: ScheduleSourceType;
    let sourceUrl: string;
    let ttsContent: string | undefined;
    let sourceUnitId: string | undefined;
    let relayFromLevel: "PROVINCE" | "DISTRICT" | "COMMUNE" | undefined;

    const sourceRand = Math.random();
    if (sourceRand < 0.5) {
      // FILE
      sourceType = ScheduleSourceType.FILE;
      sourceUrl = `https://storage.example.com/audio/${scheduleCounter}.mp3`;
    } else if (sourceRand < 0.7) {
      // STREAM
      sourceType = ScheduleSourceType.STREAM;
      sourceUrl = `http://stream.example.com/channel-${
        Math.floor(Math.random() * 5) + 1
      }`;
    } else if (sourceRand < 0.85) {
      // TTS
      sourceType = ScheduleSourceType.TTS;
      sourceUrl = "";
      ttsContent = `Nội dung ${
        template.title
      } - ${new Date().toLocaleDateString("vi-VN")}`;
    } else {
      // RELAY
      sourceType = ScheduleSourceType.RELAY;
      sourceUrl = `relay://province-hanoi/channel-${
        Math.floor(Math.random() * 3) + 1
      }`;
      sourceUnitId = "province-hanoi";
      relayFromLevel = getRandomElement(["PROVINCE", "DISTRICT"] as const);
    }

    // Determine targets
    const targetRand = Math.random();
    let targetUnitIds: string[] = [];
    let targetDeviceIds: string[] = [];

    if (targetRand < 0.3) {
      // Target specific units (1-3 wards)
      const selectedUnits = getRandomElements(
        wardUnits,
        Math.floor(Math.random() * 3) + 1
      );
      targetUnitIds = selectedUnits.map((u) => u.id);
    } else if (targetRand < 0.6) {
      // Target specific devices (1-10 devices)
      const selectedDevices = getRandomElements(
        allDevices,
        Math.floor(Math.random() * 10) + 1
      );
      targetDeviceIds = selectedDevices.map((d) => d.id);
    } else {
      // Target by unit (1-5 wards)
      const selectedUnits = getRandomElements(
        wardUnits,
        Math.floor(Math.random() * 5) + 1
      );
      targetUnitIds = selectedUnits.map((u) => u.id);
    }

    // For ROUTINE schedules, add daysOfWeek
    let daysOfWeek: number[] | undefined;
    if (template.type === ScheduleType.ROUTINE) {
      // Random days: weekdays, weekends, or all week
      const dayPattern = Math.random();
      if (dayPattern < 0.5) {
        daysOfWeek = [1, 2, 3, 4, 5]; // Weekdays
      } else if (dayPattern < 0.7) {
        daysOfWeek = [0, 6]; // Weekends
      } else {
        daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // All week
      }
    }

    // Create schedule
    const schedule: Schedule = {
      id: `schedule-${scheduleCounter}`,
      title: `${template.title} ${
        dayOffset !== 0 ? `(${dayOffset > 0 ? "+" : ""}${dayOffset}d)` : ""
      }`,
      description:
        Math.random() > 0.7
          ? `Mô tả chi tiết cho ${template.title}`
          : undefined,
      ownerUnitId: targetUnitIds[0] || "province-hanoi",
      type: template.type,
      priority: template.priority,
      sourceType,
      sourceUrl,
      ttsContent,
      sourceUnitId,
      relayFromLevel,
      startTime,
      endTime,
      daysOfWeek,
      targetUnitIds,
      targetDeviceIds,
      status,
      approvedBy: [
        ScheduleStatus.APPROVED,
        ScheduleStatus.RUNNING,
        ScheduleStatus.COMPLETED,
      ].includes(status)
        ? `admin-${Math.floor(Math.random() * 100)}`
        : undefined,
      createdAt: new Date(
        targetDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ), // Created within last week
    };

    defaultData.push(schedule);
    scheduleCounter++;
  }
}

// Sort by startTime
defaultData.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

console.log(`✅ Generated ${defaultData.length} mock schedules`);
console.log(`📊 Status distribution:`, {
  DRAFT: defaultData.filter((s) => s.status === ScheduleStatus.DRAFT).length,
  PENDING_APPROVAL: defaultData.filter(
    (s) => s.status === ScheduleStatus.PENDING_APPROVAL
  ).length,
  READY: defaultData.filter((s) => s.status === ScheduleStatus.READY).length,
  RUNNING: defaultData.filter((s) => s.status === ScheduleStatus.RUNNING)
    .length,
  COMPLETED: defaultData.filter((s) => s.status === ScheduleStatus.COMPLETED)
    .length,
  APPROVED: defaultData.filter((s) => s.status === ScheduleStatus.APPROVED)
    .length,
  CANCELED: defaultData.filter((s) => s.status === ScheduleStatus.CANCELED)
    .length,
  REJECTED: defaultData.filter((s) => s.status === ScheduleStatus.REJECTED)
    .length,
});

export const mockSchedules = new AbstractMock<Schedule>({
  defaultData,
});
