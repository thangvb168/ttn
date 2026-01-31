import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Badge, Button } from "antd";
import React from "react";
import { ScheduleConflict } from "../utils/conflictDetection";

interface ConflictWarningBadgeProps {
  conflicts: ScheduleConflict[];
  onClick: () => void;
}

export const ConflictWarningBadge: React.FC<ConflictWarningBadgeProps> = ({
  conflicts,
  onClick,
}) => {
  if (conflicts.length === 0) return null;

  const highSeverityCount = conflicts.filter(
    (c) => c.severity === "HIGH"
  ).length;

  return (
    <Badge count={conflicts.length} offset={[-5, 5]}>
      <Button
        danger={highSeverityCount > 0}
        type={highSeverityCount > 0 ? "primary" : "default"}
        icon={<ExclamationCircleOutlined />}
        onClick={onClick}
      >
        Cảnh báo xung đột
      </Button>
    </Badge>
  );
};
