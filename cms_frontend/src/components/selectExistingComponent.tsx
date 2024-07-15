import React, { useState, useEffect } from "react";
import {
  Select,
  Button,
  message,
  Form,
  Input,
  Image,
  Card,
  Typography,
  Tooltip,
  Spin,
  Empty,
  AutoComplete,
} from "antd";
import {
  PlusOutlined,
  InfoCircleOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { fetchAllComponents } from "../api/component.api";
import { AiOutlineFile } from "react-icons/ai";
import { RiCloseCircleFill } from "react-icons/ri";
import { ComponentType } from "../template/types";

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

interface SelectExistingComponentProps {
  onComponentSelect: (component: ComponentType) => void;
  templateName: string;
  refetchData: () => void;
}

const SelectExistingComponent: React.FC<SelectExistingComponentProps> = ({
  onComponentSelect,
  templateName,
  refetchData,
}) => {
  const [form] = Form.useForm();
  const baseImageUrl = import.meta.env.VITE_APP_BASE_IMAGE_URL || "";

  const [allComponents, setAllComponents] = useState<ComponentType[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );
  const [componentImagePreview, setComponentImagePreview] = useState<
    string | null
  >(null);
  const [selectedFilePreviews, setSelectedFilePreviews] = useState<{
    [key: string]: any[];
  }>({});
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const components = await fetchAllComponents();
      setAllComponents(
        components.sort((a, b) =>
          a.component_name.localeCompare(b.component_name)
        )
      );
    } catch (error: any) {
      console.error("Error fetching components:", error);
      message.error("Failed to fetch components");
    } finally {
      setLoading(false);
    }
  };

  const handleComponentSelect = (value: string) => {
    setSelectedComponent(value);
    const selected = allComponents.find((c) => c.component_name === value);
    if (selected) {
      form.setFieldsValue({
        component_name: selected.component_name,
        inner_component: selected.inner_component,
      });
      if (selected.component_image) {
        const src = selected.component_image.startsWith("http")
          ? selected.component_image
          : `${baseImageUrl}${selected.component_image.split("uploads\\")[1]}`;
        setComponentImagePreview(src);
      } else {
        setComponentImagePreview(null);
      }

      setSelectedFilePreviews({});
      form.resetFields(["data"]);
    }
  };

  const handleSubmit = (values: any) => {
    const selected = allComponents.find(
      (c) => c.component_name === selectedComponent
    );
    if (selected) {
      const newComponent: ComponentType = {
        ...selected,
        template_name: templateName,
        data: [
          {
            ...values.data,
          },
        ],
        is_active: true,
      };
      onComponentSelect(newComponent);
      message.success("Component added successfully");
      form.resetFields();
      refetchData();
      setSelectedComponent(null);
      setComponentImagePreview(null);
      setSelectedFilePreviews({});
    }
  };

  const handleFileSelect = (key: string, files: FileList) => {
    const fileArray = Array.from(files);
    const newPreviews = fileArray.map((file) => ({
      src: URL.createObjectURL(file),
      type: file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("image/")
        ? file.type === "image/svg+xml"
          ? "svg"
          : "image"
        : "file",
      name: file.name,
    }));

    setSelectedFilePreviews((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...newPreviews],
    }));

    const currentFiles = form.getFieldValue(["data", key]) || [];
    form.setFieldsValue({
      data: {
        ...form.getFieldValue("data"),
        [key]: [...currentFiles, ...fileArray],
      },
    });
  };

  const handleClearFile = (key: string, fileIndex: number) => {
    setSelectedFilePreviews((prev) => {
      const newState = { ...prev };
      newState[key] = newState[key].filter((_, i) => i !== fileIndex);
      return newState;
    });

    const currentFiles = form.getFieldValue(["data", key]) || [];
    form.setFieldsValue({
      data: {
        ...form.getFieldValue("data"),
        [key]: currentFiles.filter((_: any, i: number) => i !== fileIndex),
      },
    });
  };

  const getFieldComponent = (key: string) => {
    if (
      key.includes("image") ||
      key.includes("video") ||
      key.includes("file")
    ) {
      const previews = selectedFilePreviews[key] || [];
      const acceptType = key.includes("video")
        ? "video/*"
        : key.includes("image")
        ? "image/*"
        : "*/*";

      return (
        <Form.Item
          name={["data", key]}
          label={
            <span>
              {key}{" "}
              <Tooltip title={`Select ${key} files`}>
                <InfoCircleOutlined style={{ color: "#1890ff" }} />
              </Tooltip>
            </span>
          }
          rules={[{ required: true, message: `Please select ${key}` }]}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {previews.map((preview, fileIndex) => (
                <div
                  key={fileIndex}
                  className="relative bg-gray-100 p-2 rounded-lg h-32 flex items-center justify-center overflow-hidden group"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    {preview.type === "video" && (
                      <video
                        src={preview.src}
                        className="max-w-full max-h-full object-contain rounded"
                        controls
                      />
                    )}
                    {(preview.type === "image" || preview.type === "svg") && (
                      <Image
                        src={preview.src}
                        alt={`Preview ${fileIndex}`}
                        preview={{
                          mask: (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                              Preview
                            </div>
                          ),
                        }}
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                    {preview.type === "file" && (
                      <div className="flex flex-col items-center justify-center">
                        <AiOutlineFile size={24} />
                        <span className="mt-1 text-xs text-center break-words max-w-full">
                          {preview.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    type="text"
                    danger
                    icon={<RiCloseCircleFill />}
                    onClick={() => handleClearFile(key, fileIndex)}
                    size="small"
                    className="absolute top-1 right-1 z-10"
                  />
                </div>
              ))}
            </div>
            <Button
              icon={<UploadOutlined />}
              onClick={() =>
                document.getElementById(`${key}-file-input`)?.click()
              }
            >
              Select {key}
            </Button>
            <input
              type="file"
              id={`${key}-file-input`}
              className="hide-choose-file"
              multiple
              accept={acceptType}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0)
                  handleFileSelect(key, e.target.files);
              }}
            />
          </div>
        </Form.Item>
      );
    } else {
      return (
        <Form.Item
          name={["data", key]}
          label={
            <span>
              {key}{" "}
              <Tooltip title={`Enter ${key}`}>
                <InfoCircleOutlined style={{ color: "#1890ff" }} />
              </Tooltip>
            </span>
          }
          rules={[{ required: true, message: `Please enter ${key}` }]}
        >
          <Input prefix={<EditOutlined className="site-form-item-icon" />} />
        </Form.Item>
      );
    }
  };

  const filterOption = (inputValue: string, option: any) =>
    option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;

  return (
    <Card className="shadow-lg rounded-lg bg-white">
      <Title level={3} className="mb-6 text-center text-indigo-700">
        Select Existing Component
      </Title>
      <Spin spinning={loading}>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="select_component"
            label={
              <span>
                Select Component{" "}
                <Tooltip title="Choose an existing component to add">
                  <InfoCircleOutlined style={{ color: "#1890ff" }} />
                </Tooltip>
              </span>
            }
            rules={[{ required: true, message: "Please select a component" }]}
          >
            <AutoComplete
              style={{ width: "100%" }}
              placeholder="Search and select a component"
              filterOption={filterOption}
              onChange={(value) => {
                setSearchValue(value);
                handleComponentSelect(value);
              }}
              value={searchValue}
            >
              {allComponents.map((component) => (
                <Option
                  key={component.component_name}
                  value={component.component_name}
                >
                  {component.component_name}
                </Option>
              ))}
            </AutoComplete>
          </Form.Item>

          {selectedComponent && (
            <Card className="mt-4 bg-gray-50">
              <Form.Item
                name="component_name"
                label={
                  <span>
                    Component Name{" "}
                    <Tooltip title="Name of the selected component">
                      <InfoCircleOutlined style={{ color: "#1890ff" }} />
                    </Tooltip>
                  </span>
                }
              >
                <Input disabled={true} />
              </Form.Item>

              <Form.Item
                name="inner_component"
                label={
                  <span>
                    Inner Component{" "}
                    <Tooltip title="Inner component number">
                      <InfoCircleOutlined style={{ color: "#1890ff" }} />
                    </Tooltip>
                  </span>
                }
              >
                <Input disabled={true} />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    Component Image{" "}
                    <Tooltip title="Image associated with this component">
                      <InfoCircleOutlined style={{ color: "#1890ff" }} />
                    </Tooltip>
                  </span>
                }
              >
                <div className="flex items-center justify-center">
                  {componentImagePreview ? (
                    <Image
                      src={componentImagePreview}
                      alt="Component Image"
                      className="w-32 h-32 object-cover rounded-lg shadow-md"
                      preview={{
                        mask: (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                            Preview
                          </div>
                        ),
                      }}
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No image"
                      className="w-32 h-32 flex flex-col items-center justify-center bg-gray-100 rounded-lg"
                    />
                  )}
                </div>
              </Form.Item>

              <div className="space-y-6">
                {allComponents.find(
                  (c) => c.component_name === selectedComponent
                )?.data[0] &&
                  Object.keys(
                    allComponents.find(
                      (c) => c.component_name === selectedComponent
                    )!.data[0]
                  ).map((key) => getFieldComponent(key))}
              </div>

              <Form.Item className="mt-8">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                  size="large"
                  block
                  className="bg-indigo-600 hover:bg-indigo-700 border-indigo-600 hover:border-indigo-700"
                >
                  Save Component
                </Button>
              </Form.Item>
            </Card>
          )}
        </Form>
      </Spin>

      {!loading && allComponents.length === 0 && (
        <Empty
          description={
            <span>
              No components available. Please create a component first.
            </span>
          }
        />
      )}

      <div className="mt-8">
        <Paragraph className="text-gray-600">
          <Text strong>Note:</Text> Select an existing component from the
          dropdown above. You can modify the component's data before adding it
          to your template. The component image cannot be changed when selecting
          an existing component.
        </Paragraph>
      </div>
    </Card>
  );
};

export default SelectExistingComponent;
