// NestedOption.tsx

import React from "react";
import { Input, Button, Switch, Space, Upload } from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  FolderOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { NestedOptionType } from "./types";

interface NestedOptionProps {
  option: NestedOptionType;
  path: number[];
  onAdd: (path: number[]) => void;
  onRemove: (path: number[]) => void;
  onChange: (path: number[], value: string | File | File[]) => void;
  onPackageToggle: (path: number[], isPackage: boolean) => void;

  onKeyValuePairAdd: (path: number[]) => void;
  onKeyValuePairChange: (
    path: number[],
    pairIndex: number,
    key: "key" | "value",
    value: string | File | File[]
  ) => void;
  onKeyValuePairRemove: (path: number[], pairIndex: number) => void;
}

const NestedOption: React.FC<NestedOptionProps> = ({
  option,
  path,
  onAdd,
  onRemove,
  onChange,
  onPackageToggle,
  onKeyValuePairAdd,
  onKeyValuePairChange,
  onKeyValuePairRemove,
}) => {
  const getAcceptType = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("image")) return "image/*";
    if (lowerKey.includes("video")) return "video/*";
    return "*/*";
  };

  const isUploadField = (key: string) => {
    const lowerKey = key.toLowerCase();
    return ["image", "images", "video", "videos", "file", "files"].some(
      (type) => lowerKey.includes(type)
    );
  };

  return (
    <div className="mb-3 ml-6">
      <div className="flex items-center space-x-2 p-2 rounded-lg bg-white shadow-sm">
        <FolderOutlined className="text-blue-500" />
        <Input
          value={option.label}
          onChange={(e) => onChange(path, e.target.value)}
          placeholder={`Group ${path.join(".")}`}
          className="flex-grow"
        />
        <Space>
          <Switch
            checked={option.isPackage}
            onChange={(checked) => onPackageToggle(path, checked)}
            checkedChildren="Package"
            unCheckedChildren="Option"
          />
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => onAdd(path)}
            className="text-green-500"
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<MinusCircleOutlined />}
            onClick={() => onRemove(path)}
          />
        </Space>
      </div>
      {option.isPackage ? (
        <div className="mt-2 pl-4">
          {Object.entries(option.keyValuePairs || {}).map(
            ([key, value], index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input
                  value={key}
                  onChange={(e) =>
                    onKeyValuePairChange(path, index, "key", e.target.value)
                  }
                  placeholder="Key"
                  className="flex-1"
                />
                {isUploadField(key) ? (
                  <Upload
                    beforeUpload={(file) => {
                      const newValue = key.toLowerCase().endsWith("s")
                        ? [...(Array.isArray(value) ? value : []), file]
                        : file;
                      onKeyValuePairChange(path, index, "value", newValue);
                      return false;
                    }}
                    accept={getAcceptType(key)}
                    multiple={key.toLowerCase().endsWith("s")}
                  >
                    <Button icon={<UploadOutlined />}>
                      {Array.isArray(value)
                        ? `${value.length} file(s) selected`
                        : value instanceof File
                        ? value.name
                        : "Upload"}
                    </Button>
                  </Upload>
                ) : (
                  <Input
                    value={typeof value === "string" ? value : undefined}
                    onChange={(e) =>
                      onKeyValuePairChange(path, index, "value", e.target.value)
                    }
                    placeholder="Value"
                    className="flex-1"
                  />
                )}
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => onKeyValuePairRemove(path, index)}
                />
              </div>
            )
          )}
          <Button
            type="dashed"
            onClick={() => onKeyValuePairAdd(path)}
            className="w-full mt-2"
            icon={<PlusOutlined />}
          >
            Add Key-Value Pair
          </Button>
        </div>
      ) : (
        <div className="mt-2 pl-4">
          {option.options?.map((subOption, index) => (
            <NestedOption
              key={index}
              option={subOption}
              path={[...path, index]}
              onAdd={onAdd}
              onRemove={onRemove}
              onChange={onChange}
              onPackageToggle={onPackageToggle}
              onKeyValuePairAdd={onKeyValuePairAdd}
              onKeyValuePairChange={onKeyValuePairChange}
              onKeyValuePairRemove={onKeyValuePairRemove}
            />
          ))}
          <Button
            type="dashed"
            onClick={() => onAdd(path)}
            className="w-full mt-2"
            icon={<PlusOutlined />}
          >
            Add Option
          </Button>
        </div>
      )}
    </div>
  );
};

export default NestedOption;
