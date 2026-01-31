import { Card, Col, Row } from "antd";
import React from "react";
import { DeviceMap } from "./DeviceMap";
import { DeviceStatusTable } from "./DeviceStatusTable";

interface DeviceMonitorProps {
  selectedUnitId?: string;
}

export const DeviceMonitor: React.FC<DeviceMonitorProps> = ({
  selectedUnitId,
}) => {
  return (
    <div className="mt-4">
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Danh sách thiết bị (Real-time)" className="h-full">
            <DeviceStatusTable selectedUnitId={selectedUnitId} />
          </Card>
        </Col>
        <Col span={12}>
          <DeviceMap />
        </Col>
      </Row>
    </div>
  );
};
