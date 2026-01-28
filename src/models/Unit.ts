import { AbstractModel } from "./AbstractModel";

export enum UnitType {
  DEPARTMENT = "DEPARTMENT", // Phòng ban
  EMPLOYEE = "EMPLOYEE", // Nhân viên
}

/**
 * Đơn vị: Có thể bao gồm là các cấp phòng ban, nhân viên
 */
export interface Unit extends AbstractModel {
  name: string; // Tên đơn vị
  type: UnitType; // Loại đơn vị
  parentId: string | null; // Đơn vị cha trực tiếp
  path: string | null; // Đường dẫn đơn vị trong hệ thống phân cấp, ví dụ: /root/departmentA/employee1
  ancestors?: string[]; // Mảng chứa các ID của các đơn vị tổ tiên
  children?: string[]; // Mảng chứa các ID của các đơn vị con trực tiếp
}
