import { mockUnits } from "@/mocks/mockUnit";
import { UnitType } from "@/models/Unit";
import { DownOutlined } from "@ant-design/icons";
import { Card, Input, Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import React, { useEffect, useMemo, useState } from "react";
import { buildTree } from "../utils/build-tree";
// import { buildTree } from "../utils/build-tree";

const { Search } = Input;

// Helper to get all keys from a tree (for flattening to search)
const getParentKey = (key: React.Key, tree: DataNode[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};

const generateList = (
  data: DataNode[],
  dataList: { key: React.Key; title: string }[]
) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const { key, title } = node;
    dataList.push({ key, title: title as string });
    if (node.children) {
      generateList(node.children, dataList);
    }
  }
};

interface UnitTreeProps {
  onSelect?: (selectedKeys: React.Key[]) => void;
}

export const UnitTree: React.FC<UnitTreeProps> = ({ onSelect }) => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  const [searchValue, setSearchValue] = useState("");
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  // Flatten list to helper search
  const dataList = useMemo(() => {
    const list: { key: React.Key; title: string }[] = [];
    generateList(treeData, list);
    return list;
  }, [treeData]);

  useEffect(() => {
    // Simulate fetch
    const units = mockUnits.getAll();

    // Remove all user
    const unitsWithoutUser = units.filter(
      (unit) => unit.type !== UnitType.EMPLOYEE
    );

    const tree = buildTree(unitsWithoutUser);
    setTreeData(tree);
    if (tree.length > 0) {
      setExpandedKeys([tree[0].key]); // Expand query root by default
    }
  }, []);

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  // ...

  // Helper to find all descendants keys of a node
  const getDescendantKeys = (
    nodes: DataNode[],
    key: React.Key
  ): React.Key[] => {
    let foundKeys: React.Key[] = [];
    for (const node of nodes) {
      if (node.key === key) {
        const collect = (n: DataNode) => {
          if (n.children) {
            n.children.forEach((c) => {
              foundKeys.push(c.key);
              collect(c);
            });
          }
        };
        collect(node);
        return foundKeys;
      }
      if (node.children) {
        const res = getDescendantKeys(node.children, key);
        if (res.length > 0) return res;
      }
    }
    return [];
  };

  // Helper to find all ancestor keys of a node
  // This is expensive if we walk from root every time, but fine for small tree
  const getAncestorKeys = (
    nodes: DataNode[],
    targetKey: React.Key,
    path: React.Key[] = []
  ): React.Key[] | null => {
    for (const node of nodes) {
      if (node.key === targetKey) {
        return path;
      }
      if (node.children) {
        const res = getAncestorKeys(node.children, targetKey, [
          ...path,
          node.key,
        ]);
        if (res) return res;
      }
    }
    return null;
  };

  const handleSelect = (keys: React.Key[], info: any) => {
    const { node, selected } = info;
    const clickedKey = node.key as React.Key;

    let newSelectedKeys = [...selectedKeys];

    if (selected) {
      // Case 1: Select a node
      // Check if we are selecting a parent of already selected nodes -> Remove descendants
      const descendants = getDescendantKeys(treeData, clickedKey);
      newSelectedKeys = newSelectedKeys.filter((k) => !descendants.includes(k));

      // Check if we are selecting a child of already selected nodes -> Remove ancestors
      const ancestors = getAncestorKeys(treeData, clickedKey) || [];
      newSelectedKeys = newSelectedKeys.filter((k) => !ancestors.includes(k));

      newSelectedKeys.push(clickedKey);
    } else {
      // Case 2: Deselect a node
      newSelectedKeys = newSelectedKeys.filter((k) => k !== clickedKey);
    }

    setSelectedKeys(newSelectedKeys);

    // Resolve all children for filtering (sending expanding recursive keys to table)
    // Re-use logic to collect all keys for filter
    const allFilterKeys: React.Key[] = [];
    const findAndCollect = (nodes: DataNode[], searchKeys: React.Key[]) => {
      nodes.forEach((n) => {
        if (searchKeys.includes(n.key)) {
          allFilterKeys.push(n.key);
          // Collect all children recursively
          const collect = (child: DataNode) => {
            allFilterKeys.push(child.key);
            if (child.children) child.children.forEach(collect);
          };
          if (n.children) n.children.forEach(collect);
        } else if (n.children) {
          findAndCollect(n.children, searchKeys);
        }
      });
    };

    findAndCollect(treeData, newSelectedKeys);
    const uniqueKeys = Array.from(new Set(allFilterKeys));
    onSelect?.(uniqueKeys);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Basic filtering logic for Tree
    // Find keys that match
    const newExpandedKeys = dataList
      .map((item) => {
        if (item.title.toLowerCase().indexOf(value.toLowerCase()) > -1) {
          return getParentKey(item.key, treeData);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);

    setExpandedKeys(newExpandedKeys as React.Key[]);
    setSearchValue(value);
    setAutoExpandParent(true);
  };

  // Custom tree node rendering to highlight search
  const loop = (data: DataNode[]): DataNode[] =>
    data.map((item) => {
      const strTitle = item.title as string;
      const index = strTitle.toLowerCase().indexOf(searchValue.toLowerCase());
      const beforeStr = strTitle.substring(0, index);
      const afterStr = strTitle.slice(index + searchValue.length);
      const title =
        index > -1 ? (
          <span>
            {beforeStr}
            <span style={{ color: "#f50" }}>{searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span>{strTitle}</span>
        );
      if (item.children) {
        return { title, key: item.key, children: loop(item.children) };
      }
      return {
        title,
        key: item.key,
      };
    });

  return (
    <Card
      bodyStyle={{ padding: "16px 0 0 0" }} // Clean padding
      style={{ height: "100%", minHeight: 600 }}
    >
      <div style={{ padding: "0 16px 16px" }}>
        <Search
          style={{ marginBottom: 8 }}
          placeholder="Tìm kiếm đơn vị"
          onChange={onChange}
        />
      </div>
      <div style={{ overflowY: "auto", height: 500, padding: "0 16px" }}>
        <Tree
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          onSelect={handleSelect}
          selectedKeys={selectedKeys}
          treeData={loop(treeData)}
          switcherIcon={<DownOutlined />}
          multiple // Allow multiple selection if desired, or single. User said "click nhiều", maybe multiple select?
          // "click nhiều ( trong tree ) chọn cha thì bao gồm cả con" -> implied logic is custom selection handling.
          // If I disable checkable, user selects nodes.
          // Standard Tree multiple select works by Ctrl+Click.
          // If user wants "click cha bao gồm con", maybe they meant "Filter by parent implies children" in logic?
          // User said: "cứ mỗi lần cái chọn thì cần filter cho table"
          // Let's implement onSelect.
          showIcon={true}
        />
      </div>
    </Card>
  );
};
