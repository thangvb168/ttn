import { Unit, UnitType } from "@/models/Unit";
import { ShopOutlined, UserOutlined } from "@ant-design/icons";
import type { DataNode } from "antd/es/tree";

export const buildTree = (units: Unit[]): DataNode[] => {
  const nodeMap = new Map<string, DataNode & { parentId?: string }>();

  // 1. Create DataNode for each unit
  for (const unit of units) {
    nodeMap.set(unit.id, {
      key: unit.id,
      title: unit.name,
      children: [],
      parentId: unit.parentId || undefined,
      icon:
        unit.type === UnitType.EMPLOYEE ? <UserOutlined /> : <ShopOutlined />,
    });
  }

  const roots: DataNode[] = [];

  // 2. Build hierarchy
  for (const unit of units) {
    const node = nodeMap.get(unit.id)!;
    if (unit.parentId && nodeMap.has(unit.parentId)) {
      const parent = nodeMap.get(unit.parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // 3. Clean up empty children arrays if desired (Antd Tree handles empty children fine usually,
  // but removing them makes it a leaf node visually)
  const clean = (nodes: DataNode[]) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length === 0) {
        // delete node.children; // Optional: keep [] if you want to show expander for empty? No, usually delete for leaf.
        node.isLeaf = true;
      } else if (node.children) {
        clean(node.children);
      }
    });
  };
  clean(roots);

  return roots;
};
