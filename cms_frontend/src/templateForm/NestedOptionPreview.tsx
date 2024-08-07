import React from "react";
import { Card, Typography, Input } from "antd";

const { Text } = Typography;

interface NestedOptionPreviewProps {
  options: any[];
  level?: number;
}

const NestedOptionPreview: React.FC<NestedOptionPreviewProps> = ({
  options,
  level = 0,
}) => {
  const renderNestedOption = (option: any) => {
    const padding = level * 20;

    if (option.isPackage) {
      return (
        <Card
          key={option.value}
          title={option.label}
          style={{ marginBottom: "16px", marginLeft: `${padding}px` }}
          type="inner"
        >
          {Object.entries(option.keyValuePairs || {}).map(
            ([key, value], index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input value={key} disabled className="w-1/3" />
                <Input value={value as string} disabled className="w-2/3" />
              </div>
            )
          )}
        </Card>
      );
    } else if (option.children) {
      return (
        <div key={option.value} style={{ marginLeft: `${padding}px` }}>
          <Text strong>{option.label}</Text>
          <NestedOptionPreview options={option.children} level={level + 1} />
        </div>
      );
    } else {
      return (
        <div key={option.value} style={{ marginLeft: `${padding}px` }}>
          <Text>{option.label}</Text>
        </div>
      );
    }
  };

  return <>{options.map((option) => renderNestedOption(option))}</>;
};

export default NestedOptionPreview;
