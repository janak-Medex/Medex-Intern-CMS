import React from "react";
import { Form, Input, Select, Switch, Button, Radio, Checkbox } from "antd";
import {
  DragOutlined,
  UpOutlined,
  DownOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { FieldType } from "./types";
import NestedOption from "./NestedOption";

const { Option } = Select;

interface FieldComponentProps {
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
    value: string,
    isGroup: boolean
  ) => void;
  toggleFieldExpansion: (index: number) => void;
  removeField: (index: number) => void;
  handleDragStart: (
    e: React.DragEvent<HTMLDivElement>,
    item: FieldType,
    index: number
  ) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => void;
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
  toggleFieldExpansion,
  removeField,
  handleDragStart,
  handleDrop,
}) => {
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
            {field.options?.map((option, optionIndex) => (
              <NestedOption
                key={optionIndex}
                option={option}
                path={[optionIndex]}
                onAdd={(path) => handleNestedOptionAdd(index, path)}
                onRemove={(path) => handleNestedOptionRemove(index, path)}
                onChange={(path, value, isGroup) =>
                  handleNestedOptionChange(index, path, value, isGroup)
                }
              />
            ))}
            <Button
              type="dashed"
              onClick={() => handleOptionAdd(index)}
              className="w-full mt-4"
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
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          {renderNestedOptions()}
          {renderOptions()}
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
