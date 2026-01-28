import { mockDevices } from "@/mocks/mockDevice";
import { Device } from "@/models/Device";

export async function queryDevices(params: {
  current?: number;
  pageSize?: number;
  keyword?: string;
  status?: string | number;
  unitIds?: React.Key[];
}): Promise<{ data: Device[]; total: number; success: boolean }> {
  // Simulate async delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { current = 1, pageSize = 20, keyword } = params;
  let data = mockDevices.getAll();

  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    data = data.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerKeyword) ||
        item.code.toLowerCase().includes(lowerKeyword)
    );
  }

  if (params.status) {
    data = data.filter((item) => item.status === params.status);
  }

  if (params.unitIds && params.unitIds.length > 0) {
    // Assuming mockDevice has unitId property. If not, this might need mock update.
    // But looking at previous view_file of Device.ts, it HAS unitId.
    data = data.filter((item) => params.unitIds?.includes(item.unitId));
  }

  // Pagination logic
  const startIndex = (current - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    total: data.length,
    success: true,
  };
}
