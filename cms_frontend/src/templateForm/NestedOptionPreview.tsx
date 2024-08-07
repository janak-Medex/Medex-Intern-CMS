import React from "react";
import { Card, Input, Tree } from "antd";
import { CaretDownOutlined } from "@ant-design/icons";

interface NestedOptionType {
  label: string;
  isPackage: boolean;
  keyValuePairs?: Record<string, string>;
  options?: NestedOptionType[];
}

interface NestedOptionPreviewProps {
  options: NestedOptionType[] | any;
}

const NestedOptionPreview: React.FC<NestedOptionPreviewProps> = ({
  options,
}) => {
  const renderTreeNodes = (data: NestedOptionType[]) =>
    data.map((item) => {
      if (item.isPackage) {
        return (
          <Tree.TreeNode
            key={item.label}
            title={
              <Card
                title={item.label}
                size="small"
                style={{ marginBottom: "8px" }}
              >
                {Object.entries(item.keyValuePairs || {}).map(
                  ([key, value], index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <Input
                        value={key}
                        disabled
                        className="w-1/3"
                        size="small"
                      />
                      <Input
                        value={value}
                        disabled
                        className="w-2/3"
                        size="small"
                      />
                    </div>
                  )
                )}
              </Card>
            }
          />
        );
      }
      if (item.options && item.options.length) {
        return (
          <Tree.TreeNode key={item.label} title={item.label}>
            {renderTreeNodes(item.options)}
          </Tree.TreeNode>
        );
      }
      return <Tree.TreeNode key={item.label} title={item.label} />;
    });

  return (
    <div style={{ maxHeight: "400px", overflow: "auto" }}>
      <Tree showLine switcherIcon={<CaretDownOutlined />} defaultExpandAll>
        {renderTreeNodes(options)}
      </Tree>
    </div>
  );
};

export default NestedOptionPreview;
