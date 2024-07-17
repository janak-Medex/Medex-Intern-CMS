import React, { useState, useEffect, FormEvent } from "react";
import {
  Select,
  Button,
  message,
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
import { submitFormData } from "../api/form.api";

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

interface SelectExistingComponentProps {
  onComponentSelect: (component: ComponentType) => void;
  template_name: string;
  refetchData: () => void;
  closeComponent: () => void;
}

const SelectExistingComponent: React.FC<SelectExistingComponentProps> = ({
  closeComponent,
  template_name,
  refetchData,
}) => {
  const baseImageUrl = import.meta.env.VITE_APP_BASE_IMAGE_URL || "";

  const [allComponents, setAllComponents] = useState<ComponentType[]>([]);
  const [selectedComponent, setSelectedComponent] =
    useState<ComponentType | null>(null);
  const [componentImagePreview, setComponentImagePreview] = useState<
    string | null
  >(null);
  const [selectedFilePreviews, setSelectedFilePreviews] = useState<{
    [key: string]: any[];
  }>({});
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>(
    {}
  );
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

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
    const selected = allComponents.find((c) => c.component_name === value);
    if (selected) {
      setSelectedComponent(selected);
      setFormData({
        component_name: selected.component_name,
        inner_component: selected.inner_component,
        data: {},
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
      setSelectedFiles({});
      setValidationErrors({});
    }
  };

  const handleFileSelect = (key: string, files: FileList) => {
    const fileArray = Array.from(files);
    setSelectedFiles((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...fileArray],
    }));

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

    setFormData((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [key]: [
          ...(prev.data?.[key] || []),
          ...fileArray.map((file) => file.name),
        ],
      },
    }));

    // Clear validation error for this field
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  };

  const handleClearFile = (key: string, fileIndex: number) => {
    setSelectedFilePreviews((prev) => {
      const newState = { ...prev };
      newState[key] = newState[key].filter((_, i) => i !== fileIndex);
      return newState;
    });

    setSelectedFiles((prev) => {
      const newState = { ...prev };
      newState[key] = newState[key].filter((_, i) => i !== fileIndex);
      return newState;
    });

    setFormData((prev) => {
      const newData = { ...prev.data };
      newData[key] = newData[key].filter(
        (_: any, i: number) => i !== fileIndex
      );
      return { ...prev, data: newData };
    });

    // Set validation error if field is empty after clearing
    if (selectedFiles[key].length === 1) {
      setValidationErrors((prev) => ({
        ...prev,
        [key]: `${key} is required`,
      }));
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      data: { ...prev.data, [key]: value },
    }));

    // Clear validation error for this field
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedComponent) return;

    // Reset validation errors
    setValidationErrors({});

    // Validate all fields
    const errors: { [key: string]: string } = {};

    if (!formData.component_name) {
      errors.component_name = "Component name is required";
    }

    if (!formData.inner_component) {
      errors.inner_component = "Inner component is required";
    }

    // Validate all data fields
    if (selectedComponent.data[0]) {
      Object.keys(selectedComponent.data[0]).forEach((key) => {
        if (
          !formData.data ||
          !formData.data[key] ||
          (Array.isArray(formData.data[key]) && formData.data[key].length === 0)
        ) {
          errors[key] = `${key} is required`;
        }
      });
    }

    // If there are validation errors, set them and return
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      message.error("Please fill in all required fields");
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append("template_name", template_name);
      formPayload.append("component_name", selectedComponent.component_name);

      // Handle file uploads and create data array
      const dataArray = Object.entries(formData.data || {}).map(
        ([key, value]) => {
          const dataItem: { [key: string]: any } = {};
          if (Array.isArray(value)) {
            const files = selectedFiles[key];
            if (files && files.length > 0) {
              const fileDataArray = files.map((file) => {
                formPayload.append("files", file);
                return {
                  name: file.name,
                  originalName: file.name,
                };
              });
              dataItem[key] = fileDataArray;
            } else {
              dataItem[key] = value;
            }
          } else {
            dataItem[key] = value;
          }
          return dataItem;
        }
      );

      // Append the stringified data array to the FormData
      formPayload.append("data", JSON.stringify(dataArray));

      // Append other necessary fields
      formPayload.append("is_active", "true");
      formPayload.append(
        "inner_component",
        selectedComponent.inner_component.toString()
      );

      for (let [_key, value] of formPayload.entries()) {
        if (value instanceof File) {
        } else {
        }
      }

      const response = await submitFormData(formPayload);

      if (response.status === 201) {
        // Update formData with server-returned file paths
        const updatedFormData = { ...formData };
        const serverReturnedData = response.data.data;

        if (Array.isArray(serverReturnedData)) {
          serverReturnedData.forEach((item: any) => {
            Object.keys(item).forEach((key) => {
              if (Array.isArray(item[key])) {
                if (!updatedFormData.data) {
                  updatedFormData.data = {};
                }
                updatedFormData.data[key] = item[key];
              }
            });
          });
        } else if (
          typeof serverReturnedData === "object" &&
          serverReturnedData !== null
        ) {
          Object.keys(serverReturnedData).forEach((key) => {
            if (Array.isArray(serverReturnedData[key])) {
              if (!updatedFormData.data) {
                updatedFormData.data = {};
              }
              updatedFormData.data[key] = serverReturnedData[key];
            }
          });
        } else {
          console.warn(
            "Unexpected server response structure:",
            serverReturnedData
          );
        }

        closeComponent();
        await refetchData();
        setSelectedComponent(null);
        setComponentImagePreview(null);
        setSelectedFilePreviews({});
        setSelectedFiles({});
        message.success("Component added successfully");
      } else {
        message.error("Failed to add component");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      message.error(
        error.response?.data?.message || "An unexpected error occurred"
      );
    }
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
        <div key={key}>
          <label>
            {key}{" "}
            <Tooltip title={`Select ${key} files`}>
              <InfoCircleOutlined style={{ color: "#1890ff" }} />
            </Tooltip>
          </label>
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
          {validationErrors[key] && (
            <div className="text-red-500 text-sm mt-1">
              {validationErrors[key]}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div key={key}>
          <label>
            {key}{" "}
            <Tooltip title={`Enter ${key}`}>
              <InfoCircleOutlined style={{ color: "#1890ff" }} />
            </Tooltip>
          </label>
          <Input
            prefix={<EditOutlined className="site-form-item-icon" />}
            value={formData.data?.[key] || ""}
            onChange={(e) => handleInputChange(key, e.target.value)}
          />
          {validationErrors[key] && (
            <div className="text-red-500 text-sm mt-1">
              {validationErrors[key]}
            </div>
          )}
        </div>
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
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Select Component{" "}
              <Tooltip title="Choose an existing component to add">
                <InfoCircleOutlined style={{ color: "#1890ff" }} />
              </Tooltip>
            </label>
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
            {validationErrors.component_name && (
              <div className="text-red-500 text-sm mt-1">
                {validationErrors.component_name}
              </div>
            )}
          </div>

          {selectedComponent && (
            <Card className="mt-4 bg-gray-50">
              <div>
                <label>
                  Component Name{" "}
                  <Tooltip title="Name of the selected component">
                    <InfoCircleOutlined style={{ color: "#1890ff" }} />
                  </Tooltip>
                </label>
                <Input value={formData.component_name} disabled />
              </div>

              <div>
                <label>
                  Inner Component{" "}
                  <Tooltip title="Inner component number">
                    <InfoCircleOutlined style={{ color: "#1890ff" }} />
                  </Tooltip>
                </label>
                <Input value={formData.inner_component} disabled />
                {validationErrors.inner_component && (
                  <div className="text-red-500 text-sm mt-1">
                    {validationErrors.inner_component}
                  </div>
                )}
              </div>

              <div>
                <label>
                  Component Image{" "}
                  <Tooltip title="Image associated with this component">
                    <InfoCircleOutlined style={{ color: "#1890ff" }} />
                  </Tooltip>
                </label>
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
              </div>

              <div className="space-y-6">
                {selectedComponent.data[0] &&
                  Object.keys(selectedComponent.data[0]).map((key) =>
                    getFieldComponent(key)
                  )}
              </div>

              <div className="mt-8">
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
              </div>
            </Card>
          )}
        </form>
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
          an existing component. All fields are required.
        </Paragraph>
      </div>
    </Card>
  );
};

export default SelectExistingComponent;
