// FieldComponent.tsx

import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Switch,
  Button,
  Radio,
  Checkbox,
  Upload,
  Modal,
} from "antd";
import {
  DragOutlined,
  UpOutlined,
  DownOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { FieldType, NestedOptionType } from "./types";
import NestedOptionModal from "./NestedOptionModal";

const { Option } = Select;

export interface FieldComponentProps {
  field: FieldType;
  index: number;
  expandedFields: { [key: number]: boolean };
  handleFieldChange: (index: number, name: string, value: any) => void;
  handleOptionAdd: (fieldIndex: number) => void;
  handleOptionChange: (
    fieldIndex: number,
    optionIndex: number,
    value: string
  ) => void;
  handleOptionRemove: (fieldIndex: number, optionIndex: number) => void;
  handleNestedOptionAdd: (fieldIndex: number, path: number[]) => void;
  handleNestedOptionRemove: (fieldIndex: number, path: number[]) => void;
  handleNestedOptionChange: (
    fieldIndex: number,
    path: number[],
    value: string
  ) => void;
  handleNestedOptionPackageToggle: (
    fieldIndex: number,
    path: number[],
    isPackage: boolean
  ) => void;
  handleNestedOptionKeyValuePairAdd: (
    fieldIndex: number,
    path: number[]
  ) => void;
  handleNestedOptionKeyValuePairChange: (
    fieldIndex: number,
    path: number[],
    pairIndex: number,
    key: "key" | "value",
    value: string
  ) => void;
  handleNestedOptionKeyValuePairRemove: (
    fieldIndex: number,
    path: number[],
    pairIndex: number
  ) => void;
  toggleFieldExpansion: (index: number) => void;
  removeField: (index: number) => void;
  handleDragStart: (
    e: React.DragEvent<HTMLDivElement>,
    item: FieldType,
    index: number
  ) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => void;
  handleKeyValuePairAdd: (fieldIndex: number) => void;
  handleKeyValuePairChange: (
    fieldIndex: number,
    pairIndex: number,
    key: "key" | "value",
    value: string | File | File[]
  ) => void;
  handleKeyValuePairRemove: (fieldIndex: number, pairIndex: number) => void;
}

const FieldComponent: React.FC<FieldComponentProps> = ({
  field,
  index,
  expandedFields,
  handleFieldChange,
  handleOptionAdd,
  handleOptionChange,
  handleOptionRemove,
  handleNestedOptionAdd,
  handleNestedOptionRemove,
  handleNestedOptionChange,
  handleNestedOptionPackageToggle,
  handleNestedOptionKeyValuePairAdd,
  handleNestedOptionKeyValuePairChange,
  handleNestedOptionKeyValuePairRemove,
  toggleFieldExpansion,
  removeField,
  handleDragStart,
  handleDrop,
  handleKeyValuePairAdd,
  handleKeyValuePairChange,
  handleKeyValuePairRemove,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const renderOptions = () => {
    if (["select", "radio", "checkbox"].includes(field.type)) {
      return (
        <Form.Item label={<span className="font-semibold">Options</span>}>
          <div className="border p-4 rounded-lg bg-gray-50">
            {field.options?.map((option, optionIndex) => (
              <div
                key={optionIndex}
                className="flex items-center space-x-2 mb-2"
              >
                {field.type === "radio" && <Radio disabled />}
                {field.type === "checkbox" && <Checkbox disabled />}
                <Input
                  value={typeof option === "string" ? option : option.label}
                  onChange={(e) =>
                    handleOptionChange(index, optionIndex, e.target.value)
                  }
                  placeholder={`Option ${optionIndex + 1}`}
                />
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => handleOptionRemove(index, optionIndex)}
                />
              </div>
            ))}
            <Button
              type="dashed"
              onClick={() => handleOptionAdd(index)}
              className="w-full mt-2"
              icon={<PlusOutlined />}
            >
              Add Option
            </Button>
          </div>
        </Form.Item>
      );
    }
    return null;
  };

  const renderNestedOptions = () => {
    if (field.type === "Nested select") {
      return (
        <Form.Item
          label={<span className="font-semibold">Nested Options</span>}
        >
          <div className="border p-4 rounded-lg bg-gray-50">
            <Button onClick={showModal} className="w-full mb-2">
              Manage Nested Options
            </Button>
            <Modal
              title="Manage Nested Options"
              visible={isModalVisible}
              onOk={handleModalOk}
              onCancel={handleModalCancel}
              width={1400}
              footer={[
                <Button key="back" onClick={handleModalCancel}>
                  Close
                </Button>,
              ]}
            >
              <NestedOptionModal
                options={field.options as NestedOptionType[]}
                fieldIndex={index}
                handleNestedOptionAdd={handleNestedOptionAdd}
                handleNestedOptionRemove={handleNestedOptionRemove}
                handleNestedOptionChange={handleNestedOptionChange}
                handleNestedOptionPackageToggle={
                  handleNestedOptionPackageToggle
                }
                handleNestedOptionKeyValuePairAdd={
                  handleNestedOptionKeyValuePairAdd
                }
                handleNestedOptionKeyValuePairChange={
                  handleNestedOptionKeyValuePairChange
                }
                handleNestedOptionKeyValuePairRemove={
                  handleNestedOptionKeyValuePairRemove
                }
              />
            </Modal>
          </div>
        </Form.Item>
      );
    }
    return null;
  };

  const renderKeyValuePairs = () => {
    if (field.type === "keyValuePair") {
      return (
        <Form.Item
          label={<span className="font-semibold">Key-Value Pairs</span>}
        >
          <div className="border p-4 rounded-lg bg-gray-50">
            {field.keyValuePairs?.map((pair, pairIndex) => (
              <div key={pairIndex} className="flex items-center space-x-2 mb-2">
                <Input
                  value={pair.key}
                  onChange={(e) =>
                    handleKeyValuePairChange(
                      index,
                      pairIndex,
                      "key",
                      e.target.value
                    )
                  }
                  placeholder="Key"
                />
                {[
                  "image",
                  "images",
                  "video",
                  "videos",
                  "file",
                  "files",
                ].includes(pair.key.toLowerCase()) ? (
                  <Upload
                    beforeUpload={(file) => {
                      const newValue = pair.key.toLowerCase().endsWith("s")
                        ? [
                            ...(Array.isArray(pair.value) ? pair.value : []),
                            file,
                          ]
                        : file;
                      handleKeyValuePairChange(
                        index,
                        pairIndex,
                        "value",
                        newValue
                      );
                      return false;
                    }}
                    accept={getAcceptType(pair.key)}
                    multiple={pair.key.toLowerCase().endsWith("s")}
                  >
                    <Button icon={<UploadOutlined />}>
                      {Array.isArray(pair.value)
                        ? `${pair.value.length} file(s) selected`
                        : pair.value instanceof File
                        ? pair.value.name
                        : "Upload"}
                    </Button>
                  </Upload>
                ) : (
                  <Input
                    value={
                      typeof pair.value === "string" ? pair.value : undefined
                    }
                    onChange={(e) =>
                      handleKeyValuePairChange(
                        index,
                        pairIndex,
                        "value",
                        e.target.value
                      )
                    }
                    placeholder="Value"
                  />
                )}
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => handleKeyValuePairRemove(index, pairIndex)}
                />
              </div>
            ))}
            <Button
              type="dashed"
              onClick={() => handleKeyValuePairAdd(index)}
              className="w-full mt-2"
              icon={<PlusOutlined />}
            >
              Add Key-Value Pair
            </Button>
          </div>
        </Form.Item>
      );
    }
    return null;
  };

  const getAcceptType = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("image")) return "image/*";
    if (lowerKey.includes("video")) return "video/*";
    return "*/*";
  };

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, field, index)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e, index)}
      className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200 cursor-move"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <DragOutlined className="text-gray-400" />
          <span className="font-medium text-lg">
            {field.fieldName || `Field ${index + 1}`}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            type="text"
            size="small"
            onClick={() => toggleFieldExpansion(index)}
            icon={expandedFields[index] ? <UpOutlined /> : <DownOutlined />}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<MinusCircleOutlined />}
            onClick={() => removeField(index)}
          />
        </div>
      </div>
      {expandedFields[index] && (
        <div className="mt-4 space-y-4">
          <Form.Item
            label={<span className="font-semibold">Field Name</span>}
            rules={[{ required: true, message: "Required" }]}
          >
            <Input
              value={field.fieldName}
              onChange={(e) =>
                handleFieldChange(index, "fieldName", e.target.value)
              }
            />
          </Form.Item>
          <Form.Item label={<span className="font-semibold">Type</span>}>
            <Select
              value={field.type}
              onChange={(value) => handleFieldChange(index, "type", value)}
            >
              <Option value="text">Text</Option>
              <Option value="textarea">Textarea</Option>
              <Option value="number">Number</Option>
              <Option value="select">Select</Option>
              <Option value="Nested select">Nested select</Option>
              <Option value="radio">Radio</Option>
              <Option value="checkbox">Checkbox</Option>
              <Option value="switch">Switch</Option>
              <Option value="boolean">Boolean</Option>
              <Option value="date">Date</Option>
              <Option value="file">File</Option>
              <Option value="keyValuePair">Key-Value Pair</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          {renderNestedOptions()}
          {renderOptions()}
          {renderKeyValuePairs()}
          <Form.Item label={<span className="font-semibold">Placeholder</span>}>
            <Input
              value={field.placeholder}
              onChange={(e) =>
                handleFieldChange(index, "placeholder", e.target.value)
              }
            />
          </Form.Item>
          <Form.Item label={<span className="font-semibold">Required</span>}>
            <Switch
              checked={field.required}
              onChange={(checked) =>
                handleFieldChange(index, "required", checked)
              }
            />
          </Form.Item>
        </div>
      )}
    </div>
  );
};

export default FieldComponent;
