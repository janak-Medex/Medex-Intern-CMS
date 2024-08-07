import React, { useEffect, useState } from "react";
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
  Image,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { FieldType, FormPreviewProps, NestedOptionType } from "./types";
import axiosInstance from "../http/axiosInstance";

const { TextArea } = Input;

const baseImageUrl = import.meta.env.VITE_APP_BASE_IMAGE_URL || "";

const renderFilePreview = (key: string, value: string | File) => {
  if (typeof value === "string") {
    const filePath = value.split("uploads\\")[1] || value;
    const fileUrl = `${baseImageUrl}${filePath}`;

    const isImage = key.toLowerCase().includes("image");
    const isVideo = key.toLowerCase().includes("video");
    return (
      <div>
        {isImage && (
          <Image
            src={fileUrl}
            alt="Preview"
            style={{ maxWidth: "100px", maxHeight: "100px" }}
          />
        )}
        {isVideo && (
          <video controls style={{ maxWidth: "200px", maxHeight: "200px" }}>
            <source src={fileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    );
  } else if (value instanceof File) {
    const fileUrl = URL.createObjectURL(value);
    console.log("File Instance Detected:");
    console.log("Key:", key);
    console.log("File Name:", value.name);
    console.log("File URL:", fileUrl);

    const isImage = key.toLowerCase().includes("image");
    const isVideo = key.toLowerCase().includes("video");
    return (
      <div>
        {isImage && (
          <Image
            src={fileUrl}
            alt="Preview"
            style={{ maxWidth: "100px", maxHeight: "100px" }}
          />
        )}
        {isVideo && (
          <video controls style={{ maxWidth: "200px", maxHeight: "200px" }}>
            <source src={fileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    );
  } else {
    console.log("No File Uploaded");
    return <p>No file uploaded</p>;
  }
};

const transformNestedOptions = (options: NestedOptionType[]): any[] => {
  return options.map((option) => ({
    value: option.label,
    label: option.label,
    children: option.options
      ? transformNestedOptions(option.options)
      : undefined,
    isPackage: option.isPackage,
    keyValuePairs: option.keyValuePairs,
  }));
};

const renderNestedOption = (option: any) => {
  if (option.isPackage) {
    return (
      <div key={option.value} className="border p-2 rounded mb-2">
        <h4 className="font-bold">{option.label}</h4>
        {Object.entries(option.keyValuePairs || {}).map(
          ([key, value], index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input value={key} disabled className="w-1/3" />
              {["image", "images", "video", "videos", "file", "files"].includes(
                key.toLowerCase()
              ) ? (
                renderFilePreview(key, value as string | File)
              ) : (
                <Input value={value as string} disabled className="w-2/3" />
              )}
            </div>
          )
        )}
      </div>
    );
  } else if (option.children) {
    return (
      <div key={option.value} className="ml-4">
        <h4 className="font-semibold">{option.label}</h4>
        {option.children.map((child: any) => renderNestedOption(child))}
      </div>
    );
  } else {
    return <div key={option.value}>{option.label}</div>;
  }
};

const fetchForms = async (templateName: string) => {
  const response = await axiosInstance.get(`/form/${templateName}`);
  return response.data.data;
};

const FormPreview: React.FC<FormPreviewProps> = ({
  fields,
  templateName,
  formName,
}) => {
  const [form] = Form.useForm();
  const [_existingForms, setExistingForms] = useState([]);
  const [_selectedFilePreviews, setSelectedFilePreviews] = useState<{
    [key: string]: any[][];
  }>({});
  const [formData, _setFormData] = useState<any[]>([]);

  useEffect(() => {
    const getForms = async () => {
      try {
        const forms = await fetchForms(templateName);
        setExistingForms(forms);
      } catch (error) {
        console.error("Error fetching forms:", error);
      }
    };
    getForms();
  }, [templateName]);

  useEffect(() => {
    if (!Array.isArray(formData) || formData.length === 0) {
      setSelectedFilePreviews({});
      return;
    }

    const initialPreviews: { [key: string]: any[][] } = {};

    formData.forEach((item, index) => {
      Object.entries(item).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          if (!initialPreviews[key]) {
            initialPreviews[key] = [];
          }
          initialPreviews[key][index] = value
            .map((item) => {
              if (item === null) {
                return null;
              }
              if (typeof item === "string") {
                const filePath = item.split("uploads\\")[1] || item;
                const src = item.startsWith("http")
                  ? item
                  : `${baseImageUrl}${filePath}`;
                const type = src.match(/\.(mp4|webm|ogg)$/i)
                  ? "video"
                  : src.match(/\.(jpg|jpeg|png|gif)$/i)
                  ? "image"
                  : src.match(/\.svg$/i)
                  ? "svg"
                  : "file";
                return { src, type, name: item.split("\\").pop() || "" };
              } else if (item instanceof File) {
                return {
                  src: URL.createObjectURL(item),
                  type: item.type.startsWith("video/")
                    ? "video"
                    : item.type.startsWith("image/")
                    ? "image"
                    : item.type === "image/svg+xml"
                    ? "svg"
                    : "file",
                  name: item.name,
                };
              }
              return null;
            })
            .filter(Boolean);
        }
      });
    });

    setSelectedFilePreviews(initialPreviews);
  }, [formData, baseImageUrl]);

  const renderField = (field: FieldType) => {
    const { type, placeholder, options, keyValuePairs } = field;

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
            options={options?.map((opt) =>
              typeof opt === "string" ? { value: opt, label: opt } : opt
            )}
          />
        );
      case "Nested select":
        const treeData = transformNestedOptions(options as NestedOptionType[]);
        return (
          <div>
            <TreeSelect
              style={{ width: "100%" }}
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              treeData={treeData}
              placeholder={placeholder}
              treeDefaultExpandAll
            />
            <div className="mt-4">
              <h4 className="font-bold mb-2">Preview:</h4>
              {treeData.map((option) => renderNestedOption(option))}
            </div>
          </div>
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
            {Object.entries(keyValuePairs || {}).map(([key, value], index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <Input value={key} disabled className="w-1/3" />
                {[
                  "image",
                  "images",
                  "video",
                  "videos",
                  "file",
                  "files",
                ].includes(key.toLowerCase()) ? (
                  renderFilePreview(key, value as unknown as string | File)
                ) : (
                  <Input
                    value={value as unknown as string}
                    disabled
                    className="w-2/3"
                  />
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
