import { mockUnits } from "@/mocks/mockUnit";
import { UnitType } from "@/models/Unit";
import { buildTree } from "@/pages/devices/list/utils/build-tree";
import { Form, Select, TreeSelect } from "antd";
import React, { useMemo } from "react";

interface RelaySourceSelectorProps {
  sourceUnitId?: string;
  sourceChannelId?: string;
  relayFromLevel?: "PROVINCE" | "DISTRICT" | "COMMUNE";
  onSourceUnitChange: (value: string) => void;
  onSourceChannelChange: (value: string) => void;
  onRelayLevelChange: (value: "PROVINCE" | "DISTRICT" | "COMMUNE") => void;
  errors?: {
    sourceUnitId?: string;
    sourceChannelId?: string;
  };
}

// Mock channels data - In production, this should come from API
const mockChannels = [
  { id: "ch-1", name: "Kênh Trung ương 1", unitId: "province-1" },
  { id: "ch-2", name: "Kênh Trung ương 2", unitId: "province-1" },
  { id: "ch-3", name: "Kênh Huyện A", unitId: "district-1" },
  { id: "ch-4", name: "Kênh Huyện B", unitId: "district-2" },
  { id: "ch-5", name: "Kênh Xã 1", unitId: "commune-1" },
];

export const RelaySourceSelector: React.FC<RelaySourceSelectorProps> = ({
  sourceUnitId,
  sourceChannelId,
  relayFromLevel,
  onSourceUnitChange,
  onSourceChannelChange,
  onRelayLevelChange,
  errors,
}) => {
  // Build tree data for upper-level units
  const unitTreeData = useMemo(() => {
    return buildTree(
      mockUnits.getAll().filter((u) => u.type !== UnitType.EMPLOYEE)
    );
  }, []);

  // Filter channels based on selected unit
  const channelOptions = useMemo(() => {
    if (!sourceUnitId) return [];

    return mockChannels
      .filter((ch) => ch.unitId === sourceUnitId)
      .map((ch) => ({
        label: ch.name,
        value: ch.id,
      }));
  }, [sourceUnitId]);

  // Auto-detect relay level based on selected unit
  React.useEffect(() => {
    if (sourceUnitId) {
      const unit = mockUnits.getAll().find((u) => u.id === sourceUnitId);
      if (unit) {
        // Map unit type to relay level - simplified mapping
        // In production, you'd have proper hierarchy detection
        const levelMap: Partial<
          Record<UnitType, "PROVINCE" | "DISTRICT" | "COMMUNE">
        > = {
          [UnitType.DEPARTMENT]: "DISTRICT",
          [UnitType.EMPLOYEE]: "COMMUNE",
        };
        const level = levelMap[unit.type] || "COMMUNE";
        onRelayLevelChange(level);
      }
    }
  }, [sourceUnitId, onRelayLevelChange]);

  return (
    <div className="space-y-4">
      <Form.Item
        label="Chọn cơ sở / Kênh phát nguồn"
        required
        validateStatus={errors?.sourceUnitId ? "error" : ""}
        help={errors?.sourceUnitId}
      >
        <TreeSelect
          value={sourceUnitId}
          onChange={onSourceUnitChange}
          treeData={unitTreeData}
          placeholder="Chọn đơn vị nguồn (cấp trên)..."
          showSearch
          treeDefaultExpandAll
          allowClear
        />
      </Form.Item>

      <Form.Item
        label="Kênh phát sóng"
        required
        validateStatus={errors?.sourceChannelId ? "error" : ""}
        help={errors?.sourceChannelId}
      >
        <Select
          value={sourceChannelId}
          onChange={onSourceChannelChange}
          options={channelOptions}
          placeholder="Chọn kênh phát sóng..."
          disabled={!sourceUnitId}
          allowClear
        />
      </Form.Item>

      {relayFromLevel && (
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>Cấp truyền xuống:</strong>{" "}
            {relayFromLevel === "PROVINCE"
              ? "Tỉnh/Thành phố"
              : relayFromLevel === "DISTRICT"
              ? "Quận/Huyện"
              : "Phường/Xã"}
          </div>
        </div>
      )}
    </div>
  );
};
