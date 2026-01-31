import { useQuery } from "@tanstack/react-query";
import {
  detectScheduleConflicts,
  ScheduleConflict,
} from "../utils/conflictDetection";
import { useSchedules } from "./useSchedules";

/**
 * Deduplicate conflicts
 * Vì mỗi conflict được phát hiện từ 2 phía (A conflicts với B, B conflicts với A)
 * nên cần loại bỏ duplicates
 */
const deduplicateConflicts = (
  conflicts: ScheduleConflict[]
): ScheduleConflict[] => {
  const seen = new Set<string>();
  const unique: ScheduleConflict[] = [];

  for (const conflict of conflicts) {
    // Tạo unique key bằng cách sort 2 IDs
    const key = [conflict.scheduleId, conflict.conflictingScheduleId]
      .sort()
      .join("-");

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(conflict);
    }
  }

  return unique;
};

/**
 * Hook để lấy tất cả conflicts
 */
export const useConflicts = () => {
  const { data: schedules, isLoading: schedulesLoading } = useSchedules();

  return useQuery({
    queryKey: ["conflicts", schedules?.length],
    queryFn: () => {
      if (!schedules || schedules.length === 0) {
        return [];
      }

      const allConflicts: ScheduleConflict[] = [];

      // Detect conflicts for each schedule
      schedules.forEach((schedule) => {
        const conflicts = detectScheduleConflicts(schedule, schedules);
        allConflicts.push(...conflicts);
      });

      // Deduplicate and return
      return deduplicateConflicts(allConflicts);
    },
    enabled: !schedulesLoading && !!schedules && schedules.length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });
};

/**
 * Hook để lấy conflicts cho một schedule cụ thể
 */
export const useScheduleConflicts = (scheduleId: string | undefined) => {
  const { data: allConflicts, isLoading } = useConflicts();

  return {
    data: allConflicts?.filter(
      (c) =>
        c.scheduleId === scheduleId || c.conflictingScheduleId === scheduleId
    ),
    isLoading,
  };
};

/**
 * Hook để đếm số lượng conflicts theo severity
 */
export const useConflictStats = () => {
  const { data: conflicts, isLoading } = useConflicts();

  const stats = {
    total: conflicts?.length || 0,
    high: conflicts?.filter((c) => c.severity === "HIGH").length || 0,
    medium: conflicts?.filter((c) => c.severity === "MEDIUM").length || 0,
    low: conflicts?.filter((c) => c.severity === "LOW").length || 0,
  };

  return {
    data: stats,
    isLoading,
  };
};
