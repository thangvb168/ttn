import { mockSchedules } from "@/mocks/mockSchedule";
import { Schedule, ScheduleStatus } from "@/models/Schedule";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

/**
 * Hook để tạo schedule mới
 */
export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Schedule, "id" | "createdAt">) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newSchedule: Schedule = {
        ...data,
        id: `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      };

      return mockSchedules.create(newSchedule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      message.success("Tạo lịch phát thành công!");
    },
    onError: (error: Error) => {
      message.error(`Tạo lịch phát thất bại: ${error.message}`);
    },
  });
};

/**
 * Hook để cập nhật schedule
 */
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Schedule>;
    }) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updated = mockSchedules.update(id, data);
      if (!updated) {
        throw new Error("Không tìm thấy lịch phát");
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      message.success("Cập nhật lịch phát thành công!");
    },
    onError: (error: Error) => {
      message.error(`Cập nhật lịch phát thất bại: ${error.message}`);
    },
  });
};

/**
 * Hook để xóa schedule
 */
export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const success = mockSchedules.delete(id);
      if (!success) {
        throw new Error("Không tìm thấy lịch phát");
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      message.success("Xóa lịch phát thành công!");
    },
    onError: (error: Error) => {
      message.error(`Xóa lịch phát thất bại: ${error.message}`);
    },
  });
};

/**
 * Hook để hủy schedule (chuyển status sang CANCELED)
 */
export const useCancelSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updated = mockSchedules.update(id, {
        status: ScheduleStatus.CANCELED,
      });
      if (!updated) {
        throw new Error("Không tìm thấy lịch phát");
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      message.success("Hủy lịch phát thành công!");
    },
    onError: (error: Error) => {
      message.error(`Hủy lịch phát thất bại: ${error.message}`);
    },
  });
};

/**
 * Hook để duyệt schedule (chuyển status sang APPROVED)
 */
export const useApproveSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updated = mockSchedules.update(id, {
        status: ScheduleStatus.APPROVED,
        approvedBy: `admin-${Date.now()}`, // Mock admin ID
      });
      if (!updated) {
        throw new Error("Không tìm thấy lịch phát");
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      message.success("Duyệt lịch phát thành công!");
    },
    onError: (error: Error) => {
      message.error(`Duyệt lịch phát thất bại: ${error.message}`);
    },
  });
};

/**
 * Hook để từ chối schedule (chuyển status sang REJECTED)
 */
export const useRejectSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updated = mockSchedules.update(id, {
        status: ScheduleStatus.REJECTED,
      });
      if (!updated) {
        throw new Error("Không tìm thấy lịch phát");
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      message.warning("Đã từ chối lịch phát!");
    },
    onError: (error: Error) => {
      message.error(`Từ chối lịch phát thất bại: ${error.message}`);
    },
  });
};

/**
 * Hook để bulk delete schedules
 */
export const useBulkDeleteSchedules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const results = ids.map((id) => mockSchedules.delete(id));
      const successCount = results.filter(Boolean).length;

      if (successCount === 0) {
        throw new Error("Không thể xóa lịch phát nào");
      }

      return { total: ids.length, success: successCount };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      message.success(
        `Đã xóa ${result.success}/${result.total} lịch phát thành công!`
      );
    },
    onError: (error: Error) => {
      message.error(`Xóa lịch phát thất bại: ${error.message}`);
    },
  });
};
