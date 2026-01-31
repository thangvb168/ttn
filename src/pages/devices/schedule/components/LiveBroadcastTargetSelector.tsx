import { mockDevices } from "@/mocks/mockDevice";
import { mockUnits } from "@/mocks/mockUnit";
import { UnitType } from "@/models/Unit";
import { buildTree } from "@/pages/devices/list/utils/build-tree";
import { Checkbox, Select, TreeSelect } from "antd";
import React, { useMemo } from "react";

interface LiveBroadcastTargetSelectorProps {
  selectedUnitId: string | null;
  onUnitChange: (unitId: string | null) => void;
  selectedDeviceIds: string[];
  onDeviceIdsChange: (deviceIds: string[]) => void;
  selectAllDevices: boolean;
  onSelectAllChange: (selectAll: boolean) => void;
}

export const LiveBroadcastTargetSelector: React.FC<
  LiveBroadcastTargetSelectorProps
> = ({
  selectedUnitId,
  onUnitChange,
  selectedDeviceIds,
  onDeviceIdsChange,
  selectAllDevices,
  onSelectAllChange,
}) => {
  const treeData = useMemo(() => {
    return buildTree(
      mockUnits.getAll().filter((u) => u.type !== UnitType.EMPLOYEE)
    );
  }, []);

  const availableDevices = useMemo(() => {
    if (!selectedUnitId) return [];

    // Get all devices for selected unit
    const devices = mockDevices
      .getAll()
      .filter((d) => d.unitId === selectedUnitId);

    return devices.map((d) => ({
      label: `${d.name} (${d.code})`,
      value: d.id,
    }));
  }, [selectedUnitId]);

  const handleUnitChange = (unitId: string | null) => {
    onUnitChange(unitId);

    // Auto-select all devices when unit changes
    if (unitId && selectAllDevices) {
      const devices = mockDevices.getAll().filter((d) => d.unitId === unitId);
      onDeviceIdsChange(devices.map((d) => d.id));
    } else {
      onDeviceIdsChange([]);
    }
  };

  const handleSelectAllChange = (checked: boolean) => {
    onSelectAllChange(checked);

    if (checked && selectedUnitId) {
      // Select all devices
      const devices = mockDevices
        .getAll()
        .filter((d) => d.unitId === selectedUnitId);
      onDeviceIdsChange(devices.map((d) => d.id));
    } else {
      onDeviceIdsChange([]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          📍 Chọn phạm vi phát thanh
        </h4>

        {/* Unit Selection */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đơn vị <span className="text-red-500">*</span>
          </label>
          <TreeSelect
            showSearch
            style={{ width: "100%" }}
            value={selectedUnitId}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            placeholder="Chọn đơn vị quản lý"
            allowClear
            treeDefaultExpandAll
            onChange={handleUnitChange}
            treeData={treeData}
          />
        </div>

        {/* Device Selection */}
        {selectedUnitId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thiết bị
            </label>

            <div className="space-y-2">
              <Checkbox
                checked={selectAllDevices}
                onChange={(e) => handleSelectAllChange(e.target.checked)}
              >
                <span className="font-medium">
                  Tất cả ({availableDevices.length} thiết bị)
                </span>
              </Checkbox>

              {!selectAllDevices && (
                <Select
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="Chọn thiết bị cụ thể"
                  options={availableDevices}
                  value={selectedDeviceIds}
                  onChange={onDeviceIdsChange}
                  maxTagCount="responsive"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              )}
            </div>

            {/* Summary */}
            <div className="mt-3 p-2 bg-white rounded border border-blue-200">
              <div className="text-sm text-gray-600">
                📡 Sẽ phát đến:{" "}
                <span className="font-semibold text-blue-700">
                  {selectedDeviceIds.length} thiết bị
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
