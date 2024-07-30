import React from "react";
import {
  Form,
  Input,
  Select,
  TreeSelect,
  Radio,
  Checkbox,
  Switch,
  DatePicker,
  Upload,
  Button,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { FieldType, FormPreviewProps, NestedOption } from "./types";

const { TextArea } = Input;
const FormPreview: React.FC<FormPreviewProps> = ({
  fields,
  templateName,
  formName,
}) => {
  const [form] = Form.useForm();

  const transformOptions = (options: (string | NestedOption)[]): any[] => {
    return options.map((option, _index) => {
      if (typeof option === "string") {
        return { value: option, label: option };
      } else {
        return {
          value: option.label,
          label: option.label,
          children:
            option.options.length > 0
              ? transformOptions(option.options)
              : undefined,
        };
      }
    });
  };

  const renderField = (field: FieldType) => {
    const { type, placeholder, options } = field;

    switch (type) {
      case "text":
        return <Input placeholder={placeholder} />;
      case "textarea":
        return <TextArea rows={4} placeholder={placeholder} />;
      case "number":
        return <Input type="number" placeholder={placeholder} />;
      case "select":
        return (
          <Select
            style={{ width: "100%" }}
            placeholder={placeholder}
            options={transformOptions(options || [])}
          />
        );
      case "Nested select":
        return (
          <TreeSelect
            style={{ width: "100%" }}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            treeData={transformOptions(options || [])}
            placeholder={placeholder}
            treeDefaultExpandAll
          />
        );
      case "radio":
        return (
          <Radio.Group>
            {options?.map((option, index) => (
              <Radio
                key={index}
                value={typeof option === "string" ? option : option.label}
              >
                {typeof option === "string" ? option : option.label}
              </Radio>
            ))}
          </Radio.Group>
        );
      case "checkbox":
        return (
          <Checkbox.Group>
            {options?.map((option, index) => (
              <Checkbox
                key={index}
                value={typeof option === "string" ? option : option.label}
              >
                {typeof option === "string" ? option : option.label}
              </Checkbox>
            ))}
          </Checkbox.Group>
        );
      case "switch":
      case "boolean":
        return <Switch />;
      case "date":
        return <DatePicker />;
      case "file":
        return (
          <Upload>
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        );
      case "keyValuePair":
        return (
          <div>
            {field.keyValuePairs?.map((pair, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input value={pair.key} disabled />
                {[
                  "image",
                  "images",
                  "video",
                  "videos",
                  "file",
                  "files",
                ].includes(pair.key.toLowerCase()) ? (
                  pair.value instanceof File ? (
                    <div>
                      <p>{pair.value.name}</p>
                      {pair.key.toLowerCase().includes("image") && (
                        <img
                          src={URL.createObjectURL(pair.value)}
                          alt="Preview"
                          style={{ maxWidth: "100px", maxHeight: "100px" }}
                        />
                      )}
                    </div>
                  ) : (
                    <p>No file uploaded</p>
                  )
                ) : (
                  <Input value={pair.value as string} disabled />
                )}
              </div>
            ))}
          </div>
        );

      default:
        return <Input placeholder={placeholder} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold mb-6">Form Preview: {formName}</h3>
      <p className="mb-4">Template: {templateName}</p>
      <Form form={form} layout="vertical">
        {fields.map((field, index) => (
          <Form.Item
            key={index}
            label={
              <span>
                {field.fieldName}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            }
            name={field.fieldName}
            rules={[
              {
                required: field.required,
                message: `${field.fieldName} is required`,
              },
            ]}
          >
            {renderField(field)}
          </Form.Item>
        ))}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FormPreview;
