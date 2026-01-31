import { ScheduleStatus } from "@/models/Schedule";

/**
 * Định nghĩa các action có thể thực hiện với schedule theo trạng thái
 */
export interface ScheduleActions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canCancel: boolean;
  canApprove: boolean;
  canReject: boolean;
}

/**
 * Lấy danh sách actions có thể thực hiện dựa trên status của schedule
 *
 * Logic:
 * - DRAFT: Có thể xem, sửa, xóa
 * - PENDING_APPROVAL: Có thể xem, hủy, duyệt, từ chối
 * - READY: Có thể xem, sửa, hủy
 * - RUNNING: Chỉ có thể xem, hủy (khẩn cấp)
 * - COMPLETED: Chỉ có thể xem
 * - APPROVED: Có thể xem, sửa, hủy
 * - CANCELED: Chỉ có thể xem
 * - REJECTED: Có thể xem, sửa, xóa (để tạo lại)
 */
export const getAvailableActions = (
  status: ScheduleStatus
): ScheduleActions => {
  // Base: everyone can view
  const actions: ScheduleActions = {
    canView: true,
    canEdit: false,
    canDelete: false,
    canCancel: false,
    canApprove: false,
    canReject: false,
  };

  switch (status) {
    case ScheduleStatus.DRAFT:
      // Nháp: có thể sửa và xóa
      actions.canEdit = true;
      actions.canDelete = true;
      break;

    case ScheduleStatus.PENDING_APPROVAL:
      // Chờ duyệt: có thể hủy, duyệt, từ chối
      actions.canCancel = true;
      actions.canApprove = true;
      actions.canReject = true;
      break;

    case ScheduleStatus.READY:
      // Sẵn sàng: có thể sửa và hủy
      actions.canEdit = true;
      actions.canCancel = true;
      break;

    case ScheduleStatus.RUNNING:
      // Đang chạy: chỉ có thể hủy (khẩn cấp)
      actions.canCancel = true;
      break;

    case ScheduleStatus.COMPLETED:
      // Đã hoàn thành: chỉ xem
      break;

    case ScheduleStatus.APPROVED:
      // Đã duyệt: có thể sửa và hủy
      actions.canEdit = true;
      actions.canCancel = true;
      break;

    case ScheduleStatus.CANCELED:
      // Đã hủy: chỉ xem
      break;

    case ScheduleStatus.REJECTED:
      // Từ chối: có thể sửa và xóa để tạo lại
      actions.canEdit = true;
      actions.canDelete = true;
      break;

    default:
      // Unknown status: chỉ xem
      break;
  }

  return actions;
};

/**
 * Kiểm tra xem có thể thực hiện action này không
 */
export const canPerformAction = (
  status: ScheduleStatus,
  action: keyof ScheduleActions
): boolean => {
  const actions = getAvailableActions(status);
  return actions[action];
};

/**
 * Lấy text cho action button
 */
export const getActionButtonText = (action: keyof ScheduleActions): string => {
  const textMap: Record<keyof ScheduleActions, string> = {
    canView: "Xem",
    canEdit: "Sửa",
    canDelete: "Xóa",
    canCancel: "Hủy",
    canApprove: "Duyệt",
    canReject: "Từ chối",
  };
  return textMap[action];
};

/**
 * Lấy confirmation message cho action
 */
export const getActionConfirmMessage = (
  action: keyof ScheduleActions,
  scheduleTitle: string
): string => {
  const messages: Record<keyof ScheduleActions, string> = {
    canView: "",
    canEdit: "",
    canDelete: `Bạn có chắc chắn muốn xóa lịch phát "${scheduleTitle}"?`,
    canCancel: `Bạn có chắc chắn muốn hủy lịch phát "${scheduleTitle}"?`,
    canApprove: `Bạn có chắc chắn muốn duyệt lịch phát "${scheduleTitle}"?`,
    canReject: `Bạn có chắc chắn muốn từ chối lịch phát "${scheduleTitle}"?`,
  };
  return messages[action];
};

/**
 * Lấy màu cho action button (Ant Design button type)
 */
export const getActionButtonType = (
  action: keyof ScheduleActions
): "default" | "primary" | "dashed" | "link" | "text" => {
  const typeMap: Record<
    keyof ScheduleActions,
    "default" | "primary" | "dashed" | "link" | "text"
  > = {
    canView: "link",
    canEdit: "default",
    canDelete: "default",
    canCancel: "default",
    canApprove: "primary",
    canReject: "default",
  };
  return typeMap[action];
};

/**
 * Kiểm tra xem action có phải là destructive không (cần confirmation)
 */
export const isDestructiveAction = (action: keyof ScheduleActions): boolean => {
  return ["canDelete", "canCancel", "canReject"].includes(action);
};
