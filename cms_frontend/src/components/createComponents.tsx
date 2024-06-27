import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrash, FaUpload, FaExpand } from "react-icons/fa";
import { useParams } from "react-router-dom";
import axiosInstance from "../http/axiosInstance";
import { toast } from "react-toastify";

export interface FormField {
  [key: string]: any;
}

export interface Component {
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
  const [formFields, setFormFields] = useState<FormField>({});
  const [innerComponent, setInnerComponent] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [componentImage, setComponentImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseImageUrl = import.meta.env.VITE_APP_BASE_IMAGE_URL || "";

  useEffect(() => {
    if (initialComponent) {
      setComponentName(initialComponent.component_name);
      setFormFields(initialComponent.data[0] || {});
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

  const handleAddField = () => {
    setFormFields({ ...formFields, "": "" });
    toast.success("New field added");
  };

  const handleRemoveField = (fieldName: string) => {
    const updatedFields = { ...formFields };
    delete updatedFields[fieldName];
    setFormFields(updatedFields);
    toast.success("Field removed");
  };

  const handleFieldChange = (oldFieldName: string, newFieldName: string) => {
    if (newFieldName.trim() === "") {
      toast.error("Field name cannot be empty");
      return;
    }
    const updatedFields = { ...formFields };
    delete updatedFields[oldFieldName];
    updatedFields[newFieldName.trim()] = "";
    setFormFields(updatedFields);
    toast.success("Field name updated");
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
      toast.success("Image uploaded");
    }
  };

  const handleRemoveImage = () => {
    setComponentImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Image removed");
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

    if (Object.keys(formFields).length === 0) {
      newErrors.formFields = "At least one data field is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("component_name", component_name);
    formData.append("template_name", template_name);
    formData.append("data", JSON.stringify([formFields]));
    formData.append("isActive", "true");
    formData.append("inner_component", innerComponent.toString());

    if (componentImage) {
      formData.append("component_image", componentImage);
    } else if (imagePreview && initialComponent?.component_image) {
      formData.append("component_image", initialComponent.component_image);
    }

    try {
      const response = await axiosInstance.post("components", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(
          initialComponent
            ? "Component updated successfully!"
            : "Component created successfully!"
        );
        onCreate(response.data);
        onClose();
      }
    } catch (error) {
      console.error("Error creating/updating component:", error);
      toast.error(
        `Failed to ${
          initialComponent ? "update" : "create"
        } component. Please try again.`
      );
    }
  };

  // const handleInsertRule = () => {
  //   setIsModalOpen(true);
  // };

  // const handleCloseModal = () => {
  //   setIsModalOpen(false);
  // };

  const handleAddSchemaRule = (newRule: SchemaRule) => {
    setIsModalOpen(false);
    toast.success("New schema rule added successfully!");
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
            onChange={(e) => setInnerComponent(parseInt(e.target.value) || 1)}
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
          {Object.entries(formFields).map(([fieldName, _], index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-teal-500"
                placeholder="Field name"
                value={fieldName}
                onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              />
              <button
                type="button"
                className="ml-2 text-red-500 focus:outline-none"
                onClick={() => handleRemoveField(fieldName)}
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
        <div className="flex justify-center mb-8">
          <button
            type="submit"
            className="px-4 py-3 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none mr-4"
          >
            {initialComponent ? "Update Component" : "Create Component"}
          </button>
          <button
            type="button"
            // onClick={handleInsertRule}
            className="px-4 py-3 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors duration-300"
          >
            Add New Schema Rule
          </button>
        </div>
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

      {/* <SchemaRuleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddRule={handleAddSchemaRule}
      /> */}
    </div>
  );
};

export default CreateComponent;
