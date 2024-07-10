import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrash, FaUpload, FaExpand, FaEdit } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { Modal, Input, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  createComponent,
  updateComponent,
  getSchemaRules,
  addSchemaRule,
  updateSchemaRule,
  deleteSchemaRule,
  ComponentData,
} from "../api/component.api";

interface FormField {
  key: string;
  value: string;
}

interface SchemaRule {
  _id: string;
  fieldName: string;
  type: string;
  required: boolean;
  originalFieldName?: string;
}

export interface Component {
  components: any;
  is_active: any;
  component_name: string;
  template_name: string;
  data: FormField[];
  isActive: boolean;
  inner_component: number;
  component_image?: string;
  _id?: string;
  __v?: number;
}

interface Props {
  onClose: () => void;
  onCreate: (newComponent: Component) => void;
  initialComponent: Component | null;
}

const CreateComponent: React.FC<Props> = ({
  onClose,
  onCreate,
  initialComponent,
}) => {
  const { template_name } = useParams<{ template_name: string }>();
  const [component_name, setComponentName] = useState<string>("");
  const [formFields, setFormFields] = useState<
    Array<{ key: string; value: string }>
  >([]);
  const [innerComponent, setInnerComponent] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [componentImage, setComponentImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseImageUrl = import.meta.env.VITE_APP_BASE_IMAGE_URL || "";

  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  // const [minLength, setMinLength] = useState<number | undefined>(undefined);
  // const [maxLength, setMaxLength] = useState<number | undefined>(undefined);
  // const [minValue, setMinValue] = useState<number | undefined>(undefined);
  // const [maxValue, setMaxValue] = useState<number | undefined>(undefined);
  const [schemaRulesData, setSchemaRulesData] = useState<SchemaRule[]>([]);
  const [filteredSchemaRules, setFilteredSchemaRules] = useState<SchemaRule[]>(
    []
  );
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [_formData, setFormData] = useState(
    initialComponent || {
      component_name: "",
    }
  );

  const itemsPerPage = 10;

  useEffect(() => {
    if (initialComponent) {
      setComponentName(initialComponent.component_name);
      // Convert the object to an array of { key, value } pairs
      const fieldsArray = Object.entries(initialComponent.data[0] || {}).map(
        ([key, value]) => ({
          key,
          value: value as string,
        })
      );
      setFormFields(fieldsArray);
      setInnerComponent(initialComponent.inner_component || 1);
      if (initialComponent.component_image) {
        const src = initialComponent.component_image.startsWith("http")
          ? initialComponent.component_image
          : `${baseImageUrl}${
              initialComponent.component_image.split("uploads\\")[1]
            }`;
        setImagePreview(src);
      }
    }
  }, [initialComponent, baseImageUrl]);

  useEffect(() => {
    if (initialComponent) {
      setFormData(initialComponent);
    } else {
      setFormData({
        component_name: "",
        // ... reset other fields
      });
    }
  }, [initialComponent]);
  const handleAddField = () => {
    setFormFields([...formFields, { key: "", value: "" }]);
    message.success("New field added");
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = formFields.filter((_, i) => i !== index);
    setFormFields(updatedFields);
    message.success("Field removed");
  };

  const handleFieldChange = (
    index: number,
    field: "key" | "value",
    newValue: string
  ) => {
    const updatedFields = formFields.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: newValue };
      }
      return item;
    });
    setFormFields(updatedFields);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setComponentImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      message.success("Image uploaded");
    }
  };

  const handleRemoveImage = () => {
    setComponentImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    message.success("Image removed");
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!component_name.trim()) {
      newErrors.component_name = "Component name is required";
    }

    if (!componentImage && !imagePreview) {
      newErrors.component_image = "Component image is required";
    }

    if (formFields.length === 0) {
      newErrors.formFields = "At least one data field is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      message.error("Please fill in all required fields");
      return;
    }

    // Convert formFields array back to an object
    const formFieldsObject = formFields.reduce((acc, field) => {
      acc[field.key] = field.value;
      return acc;
    }, {} as Record<string, string>);

    const componentData: ComponentData = {
      component_name,
      template_name,
      data: [formFieldsObject],
      isActive: true,
      inner_component: innerComponent,
    };

    try {
      let response;
      if (initialComponent) {
        response = await updateComponent(componentData, componentImage);
      } else {
        response = await createComponent(componentData, componentImage);
      }

      message.success(
        initialComponent
          ? "Component updated successfully!"
          : "Component created successfully!"
      );
      onCreate(response);
      onClose();
    } catch (error: any) {
      console.error("Error creating/updating component:", error);

      // Extract the error message from the response
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";

      // Display the specific error message
      message.error(errorMessage);
    }
  };

  const handleInsertRule = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFieldName("");
    setFieldType("");
    setIsRequired(false);
    // setMinLength(undefined);
    // setMaxLength(undefined);
    // setMinValue(undefined);
    // setMaxValue(undefined);
    setEditMode(false);
    setEditingRule(null);
    setIsModalOpen(false);
  };

  const handleAddSchemaRule = async () => {
    if (!fieldName.trim() || !fieldType) {
      message.error("Field Name and Field Type are required");
      return;
    }

    const fieldNameExists = schemaRulesData.some(
      (rule) =>
        rule.fieldName.toLowerCase() === fieldName.toLowerCase() &&
        (!editMode || rule._id !== editingRule?._id)
    );

    if (fieldNameExists) {
      message.error(
        "A field with this name already exists. Please choose a different name."
      );
      return;
    }

    const newRule = {
      fieldName,
      type: fieldType,
      required: isRequired,
    };

    try {
      if (editMode && editingRule) {
        await updateSchemaRule(editingRule._id, newRule);
        message.success("Schema rule updated successfully!");
      } else {
        await addSchemaRule(newRule);
        message.success("New schema rule added successfully!");
      }

      handleCloseModal();
      viewAllSchema();
    } catch (error) {
      console.error("Error processing schema rule:", error);
      message.error("An error occurred while processing the schema rule.");
    }
  };

  const viewAllSchema = async () => {
    setIsSchemaModalOpen(true);
    try {
      const response = await getSchemaRules();
      if (response && response.success && Array.isArray(response.data)) {
        setSchemaRulesData(response.data);
        setFilteredSchemaRules(response.data);
        message.success("Schema Rules fetched successfully!");
      } else {
        throw new Error("Invalid data structure received from API");
      }
    } catch (error) {
      console.error("Error fetching schemas:", error);
      message.error("Failed to fetch schema rules");
      setSchemaRulesData([]);
      setFilteredSchemaRules([]);
    }
  };

  const handleViewSchemaModal = () => {
    setIsSchemaModalOpen(false);
  };

  const handleCloseSchemaModal = () => {
    setIsSchemaModalOpen(false);
  };

  const onSchemaRuleDelete = async (id: string) => {
    try {
      await deleteSchemaRule(id);
      message.success("Schema Rule deleted successfully!");
      viewAllSchema();
    } catch (error) {
      console.error("Error deleting schema rule:", error);
      message.error("Failed to delete schema rule.");
    }
  };

  const handleEditSchemaRule = (rule: SchemaRule) => {
    setEditMode(true);
    setEditingRule({ ...rule, originalFieldName: rule.fieldName });
    setFieldName(rule.fieldName);
    setFieldType(rule.type);
    setIsRequired(rule.required);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (Array.isArray(schemaRulesData)) {
      const filtered = schemaRulesData.filter((rule: SchemaRule) =>
        rule.fieldName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSchemaRules(filtered);
      setCurrentPage(1);
    }
  }, [schemaRulesData, searchTerm]);

  const totalPages = Math.ceil(filteredSchemaRules.length / itemsPerPage);

  const currentData = filteredSchemaRules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: React.SetStateAction<number>) => {
    setCurrentPage(page);
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <h2 className="text-xl font-semibold mb-4">
        {initialComponent ? "Edit Component" : "Create Component"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="component_name"
            className="block text-gray-700 font-bold mb-2"
          >
            Component Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="component_name"
            className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-teal-500 ${
              errors.component_name ? "border-red-500" : ""
            }`}
            placeholder="Enter component name"
            value={component_name}
            onChange={(e) => setComponentName(e.target.value)}
          />
          {errors.component_name && (
            <p className="text-red-500 text-xs mt-1">{errors.component_name}</p>
          )}
        </div>
        <div className="mb-4">
          <label
            htmlFor="inner_component"
            className="block text-gray-700 font-bold mb-2"
          >
            Inner Component
          </label>
          <input
            type="number"
            id="inner_component"
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-teal-500"
            value={innerComponent}
            onChange={(e) => setInnerComponent(parseInt(e.target.value))}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            min="1"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">
            Component Image <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="component_image"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                errors.component_image ? "border-red-500" : ""
              }`}
            >
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={imagePreview}
                    alt="Component preview"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm">Click to change image</p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
                  >
                    <FaExpand className="text-gray-600" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FaUpload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
              )}
              <input
                id="component_image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                ref={fileInputRef}
              />
            </label>
          </div>
          {errors.component_image && (
            <p className="text-red-500 text-xs mt-1">
              {errors.component_image}
            </p>
          )}
          {imagePreview && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="mt-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Remove Image
            </button>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Data Fields <span className="text-red-500">*</span>
          </label>
          {formFields.map((field, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-teal-500"
                placeholder="Field name"
                value={field.key}
                onChange={(e) =>
                  handleFieldChange(index, "key", e.target.value)
                }
              />

              <button
                type="button"
                className="ml-2 text-red-500 focus:outline-none"
                onClick={() => handleRemoveField(index)}
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="flex items-center text-teal-600 focus:outline-none mt-2"
            onClick={handleAddField}
          >
            <FaPlus className="mr-1" /> Add Field
          </button>
          {errors.formFields && (
            <p className="text-red-500 text-xs mt-1">{errors.formFields}</p>
          )}
        </div>
        <div className="flex gap-4 justify-center mb-8">
          <button
            type="submit"
            className="px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none "
          >
            {initialComponent ? "Update Component" : "Create Component"}
          </button>
          <button
            type="button"
            onClick={handleInsertRule}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors duration-300"
          >
            Add New Schema Rule
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors duration-300"
            onClick={viewAllSchema}
          >
            View all Schema
          </button>
        </div>

        {/* Modal to view all schema */}
        <Modal
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <span>View all Schema Rules</span>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search..."
                style={{ width: 170, marginLeft: "auto", marginRight: "30px" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          }
          open={isSchemaModalOpen}
          onOk={handleViewSchemaModal}
          onCancel={handleCloseSchemaModal}
          width={700}
          centered
        >
          <div>
            {filteredSchemaRules.length > 0 ? (
              <>
                <table className="w-full mb-4 border-collapse table-fixed">
                  <thead className="cursor-pointer">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left w-3/4">
                        FieldName
                      </th>
                      <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left w-1/2">
                        Type
                      </th>
                      <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left w-1/2">
                        Required
                      </th>
                      <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left w-1/2">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((data: SchemaRule) => (
                      <tr key={data._id}>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className="flex justify-between">
                            <span className="mr-12">{data.fieldName}</span>
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {data.type}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {String(data.required)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className="flex gap-6">
                            <button
                              onClick={() => onSchemaRuleDelete(data._id)}
                            >
                              <FaTrash className="text-red-600" />
                            </button>
                            <button
                              className="focus:outline-none"
                              onClick={() => handleEditSchemaRule(data)}
                            >
                              <FaEdit className="text-gray-600" size={20} />
                            </button>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination Controls */}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 mx-1 border border-gray-300 bg-gray-100 rounded"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 mx-1 border border-gray-300 bg-gray-100 rounded"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p>No matching rules found</p>
            )}
          </div>
        </Modal>

        <Modal
          title={editMode ? "Edit Schema Rule" : "Add New Schema Rule"}
          open={isModalOpen}
          onOk={handleAddSchemaRule}
          onCancel={handleCloseModal}
          centered
        >
          <form className="space-y-4">
            <div>
              <label
                htmlFor="fieldName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Field Name
              </label>
              <input
                type="text"
                id="fieldName"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="fieldType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Field Type
              </label>
              <select
                id="fieldType"
                value={fieldType}
                onChange={(e) => setFieldType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">
                  {editMode ? fieldType : "Select a type"}
                </option>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="object">Object</option>
                {/* <option value="date">Date</option> */}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRequired"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isRequired"
                className="ml-2 block text-sm text-gray-900"
              >
                Required
              </label>
            </div>

            {/* <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="minLength"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Min Length
                </label>
                <input
                  type="number"
                  id="minLength"
                  value={minLength || ""}
                  onChange={(e) =>
                    setMinLength(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="maxLength"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Max Length
                </label>
                <input
                  type="number"
                  id="maxLength"
                  value={maxLength || ""}
                  onChange={(e) =>
                    setMaxLength(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="minValue"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Min Value
                </label>
                <input
                  type="number"
                  id="minValue"
                  value={minValue || ""}
                  onChange={(e) =>
                    setMinValue(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="maxValue"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Max Value
                </label>
                <input
                  type="number"
                  id="maxValue"
                  value={maxValue || ""}
                  onChange={(e) =>
                    setMaxValue(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div> */}
          </form>
        </Modal>
      </form>

      {isFullscreen && imagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <img
            src={imagePreview}
            alt="Fullscreen preview"
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md"
          >
            <FaExpand className="text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateComponent;
