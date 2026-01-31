import { mockUnits } from "@/mocks/mockUnit";
import { UnitType } from "@/models/Unit";
import { buildTree } from "@/pages/devices/list/utils/build-tree";
import { Card, Col, Form, Row, Select, TreeSelect } from "antd";
import React, { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";

// Fix Mock Devices for Multi-select demo
const mockDevices = [
  { label: "Loa Bưu điện Mỹ An (IP: 192.168.1.10)", value: "d1" },
  { label: "Loa Nhà Văn hóa (IP: 192.168.1.11)", value: "d2" },
  { label: "Loa Cổng Chào (IP: 192.168.1.12)", value: "d3" },
];

export const TargetSelector: React.FC = () => {
  const { control } = useFormContext();

  const treeData = useMemo(() => {
    return buildTree(
      mockUnits.getAll().filter((u) => u.type !== UnitType.EMPLOYEE)
    );
  }, []);

  return (
    <Card title="Phạm vi phát sóng" className="mb-4" size="small">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Chọn Đơn vị / Địa bàn">
            <Controller
              name="targetUnitIds"
              control={control}
              render={({ field }) => (
                <TreeSelect
                  {...field}
                  treeData={treeData}
                  treeCheckable
                  showCheckedStrategy={TreeSelect.SHOW_PARENT}
                  placeholder="Chọn đơn vị"
                  style={{ width: "100%" }}
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Chọn Thiết bị cụ thể">
            <Controller
              name="targetDeviceIds"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  mode="multiple"
                  options={mockDevices}
                  placeholder="Chọn thiết bị lẻ (nếu cần)"
                  style={{ width: "100%" }}
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};
