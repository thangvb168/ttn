import { Schedule, ScheduleSourceType } from "@/models/Schedule";

export interface ScheduleConflict {
  scheduleId: string;
  conflictingScheduleId: string;
  reason: "TIME_OVERLAP" | "DEVICE_OVERLAP" | "RELAY_OVERRIDE";
  severity: "HIGH" | "MEDIUM" | "LOW";
  description: string;
}

/**
 * Kiểm tra xem hai khoảng thời gian có trùng lặp không
 */
function isTimeOverlap(
  start1: Date,
  end1: Date | undefined,
  start2: Date,
  end2: Date | undefined
): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = end1 ? new Date(end1).getTime() : s1 + 3600000; // Default 1 hour
  const s2 = new Date(start2).getTime();
  const e2 = end2 ? new Date(end2).getTime() : s2 + 3600000;

  return s1 < e2 && s2 < e1;
}

/**
 * Kiểm tra xem hai lịch có cùng target devices/units không
 */
function hasTargetOverlap(schedule1: Schedule, schedule2: Schedule): boolean {
  // Check unit overlap
  const unitOverlap = schedule1.targetUnitIds.some((unitId) =>
    schedule2.targetUnitIds.includes(unitId)
  );

  // Check device overlap
  const deviceOverlap = schedule1.targetDeviceIds.some((deviceId) =>
    schedule2.targetDeviceIds.includes(deviceId)
  );

  return unitOverlap || deviceOverlap;
}

/**
 * Phát hiện xung đột giữa một lịch với tất cả các lịch khác
 */
export function detectScheduleConflicts(
  schedule: Schedule,
  allSchedules: Schedule[]
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  for (const otherSchedule of allSchedules) {
    // Skip comparing with itself
    if (schedule.id === otherSchedule.id) continue;

    // Skip if schedules are not active (CANCELED, REJECTED, DRAFT)
    if (
      ["CANCELED", "REJECTED", "DRAFT"].includes(schedule.status) ||
      ["CANCELED", "REJECTED", "DRAFT"].includes(otherSchedule.status)
    ) {
      continue;
    }

    // Check time overlap
    const timeOverlap = isTimeOverlap(
      schedule.startTime,
      schedule.endTime,
      otherSchedule.startTime,
      otherSchedule.endTime
    );

    if (!timeOverlap) continue;

    // Check target overlap
    const targetOverlap = hasTargetOverlap(schedule, otherSchedule);

    if (!targetOverlap) continue;

    // Determine conflict type and severity
    let reason: ScheduleConflict["reason"] = "TIME_OVERLAP";
    let severity: ScheduleConflict["severity"] = "MEDIUM";
    let description = "";

    // RELAY schedule overrides local schedule
    if (
      schedule.sourceType === ScheduleSourceType.RELAY &&
      otherSchedule.sourceType !== ScheduleSourceType.RELAY
    ) {
      reason = "RELAY_OVERRIDE";
      severity = "HIGH";
      description = `Lịch tiếp sóng từ cấp trên sẽ ghi đè lịch cục bộ "${otherSchedule.title}"`;
    } else if (
      otherSchedule.sourceType === ScheduleSourceType.RELAY &&
      schedule.sourceType !== ScheduleSourceType.RELAY
    ) {
      reason = "RELAY_OVERRIDE";
      severity = "HIGH";
      description = `Lịch cục bộ sẽ bị ghi đè bởi lịch tiếp sóng "${otherSchedule.title}"`;
    } else if (targetOverlap && timeOverlap) {
      reason = "DEVICE_OVERLAP";
      severity = "HIGH";
      description = `Trùng thời gian và thiết bị với lịch "${otherSchedule.title}"`;
    } else {
      description = `Trùng thời gian với lịch "${otherSchedule.title}"`;
    }

    conflicts.push({
      scheduleId: schedule.id,
      conflictingScheduleId: otherSchedule.id,
      reason,
      severity,
      description,
    });
  }

  return conflicts;
}

/**
 * Kiểm tra xem một lịch có xung đột không
 */
export function hasConflicts(
  scheduleId: string,
  conflicts: ScheduleConflict[]
): boolean {
  return conflicts.some(
    (c) => c.scheduleId === scheduleId || c.conflictingScheduleId === scheduleId
  );
}

/**
 * Lấy tất cả conflicts liên quan đến một schedule
 */
export function getScheduleConflicts(
  scheduleId: string,
  allConflicts: ScheduleConflict[]
): ScheduleConflict[] {
  return allConflicts.filter(
    (c) => c.scheduleId === scheduleId || c.conflictingScheduleId === scheduleId
  );
}

/**
 * Đếm số lượng conflicts theo severity
 */
export function countConflictsBySeverity(
  conflicts: ScheduleConflict[]
): Record<ScheduleConflict["severity"], number> {
  return conflicts.reduce(
    (acc, conflict) => {
      acc[conflict.severity]++;
      return acc;
    },
    { HIGH: 0, MEDIUM: 0, LOW: 0 } as Record<
      ScheduleConflict["severity"],
      number
    >
  );
}
