import React from "react";
import { Tree, Card, Input, Typography } from "antd";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { FaBox, FaFolder } from "react-icons/fa";

const { Text } = Typography;

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
  const getColor = (level: number): string => {
    const colors = ["#1890ff", "#52c41a", "#722ed1", "#fa8c16", "#eb2f96"];
    return colors[level % colors.length];
  };

  const renderFilePreview = (key: string, value: string) => {
    const isImage = key.toLowerCase().includes("image");
    const isVideo = key.toLowerCase().includes("video");

    if (isImage) {
      return (
        <img
          src={value}
          alt="Preview"
          style={{
            maxWidth: "100px",
            maxHeight: "100px",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
      );
    } else if (isVideo) {
      return (
        <video
          controls
          style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "4px" }}
        >
          <source src={value} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return <Text>File: {value.split("\\").pop()}</Text>;
    }
  };

  const renderTreeNodes = (
    data: NestedOptionType[],
    level: number = 0
  ): React.ReactNode => {
    return data.map((item) => {
      const isParent = item.options && item.options.length > 0;
      const icon = item.isPackage ? (
        <FaBox style={{ color: getColor(level) }} />
      ) : isParent ? (
        <FaFolder style={{ color: getColor(level) }} />
      ) : (
        <FileOutlined style={{ color: getColor(level) }} />
      );
      const color = getColor(level);

      const title = (
        <span
          style={{
            color,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
          }}
        >
          {icon}
          <Text style={{ marginLeft: 8 }}>{item.label}</Text>
        </span>
      );

      if (item.isPackage) {
        return (
          <Tree.TreeNode
            key={item.label}
            title={
              <Card
                title={title}
                size="small"
                style={{
                  marginBottom: "8px",
                  width: "100%",
                  borderColor: color,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
                headStyle={{ backgroundColor: `${color}22` }}
              >
                {Object.entries(item.keyValuePairs || {}).map(
                  ([key, value], index) => (
                    <div
                      key={index}
                      style={{ display: "flex", marginBottom: "4px" }}
                    >
                      <Input
                        value={key}
                        disabled
                        style={{ width: "40%", marginRight: "4px" }}
                        size="small"
                      />
                      {["image", "video", "file"].some((type) =>
                        key.toLowerCase().includes(type)
                      ) ? (
                        renderFilePreview(key, value)
                      ) : (
                        <Input
                          value={value}
                          disabled
                          style={{ width: "60%" }}
                          size="small"
                        />
                      )}
                    </div>
                  )
                )}
              </Card>
            }
          >
            {item.options && renderTreeNodes(item.options, level + 1)}
          </Tree.TreeNode>
        );
      }

      if (isParent) {
        return (
          <Tree.TreeNode key={item.label} title={title}>
            {renderTreeNodes(item.options!, level + 1)}
          </Tree.TreeNode>
        );
      }

      return <Tree.TreeNode key={item.label} title={title} />;
    });
  };

  return (
    <div
      className="nested-option-preview"
      style={{ padding: "16px", backgroundColor: "#f0f2f5" }}
    >
      <Tree
        showLine={{ showLeafIcon: false }}
        showIcon
        defaultExpandAll
        switcherIcon={({ expanded }) =>
          expanded ? (
            <CaretDownOutlined style={{ fontSize: "16px", color: "#1890ff" }} />
          ) : (
            <CaretRightOutlined
              style={{ fontSize: "16px", color: "#1890ff" }}
            />
          )
        }
      >
        {renderTreeNodes(options)}
      </Tree>
    </div>
  );
};

export default NestedOptionPreview;
