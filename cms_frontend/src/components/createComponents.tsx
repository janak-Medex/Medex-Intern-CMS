import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrash, FaUpload, FaExpand } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { message } from "antd";
import { createComponent, updateComponent } from "../api/component.api";
import SchemaRuleManager from "./SchemaRuleManager";
import { FormField, Props } from "./types";
import {
  validateForm,
  handleImageChange,
  toggleFullscreen,
} from "../utils/ComponentHelpers";
import { ComponentType } from "../template/types";
const CreateComponent: React.FC<Props> = ({
  onClose,
  onCreate,
  initialComponent,
}) => {
  const { template_name } = useParams<{ template_name: string }>();
  const [component_name, setComponentName] = useState<string>("");
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [innerComponent, setInnerComponent] = useState<number>(1);
  const [componentImage, setComponentImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseImageUrl = import.meta.env.VITE_APP_BASE_IMAGE_URL || "";

  useEffect(() => {
    if (initialComponent) {
      setComponentName(initialComponent.component_name);
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

  const handleRemoveImage = () => {
    setComponentImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    message.success("Image removed");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !validateForm(
        component_name,
        componentImage,
        imagePreview,
        formFields,
        setErrors
      )
    ) {
      message.error("Please fill in all required fields");
      return;
    }

    const formFieldsObject = formFields.reduce((acc, field) => {
      acc[field.key] = field.value;
      return acc;
    }, {} as Record<string, string>);

    const ComponentType: ComponentType = {
      component_name,
      template_name, // remove the comma here
      data: [formFieldsObject],
      is_active: true,
      inner_component: innerComponent,
    };

    try {
      let response;
      if (initialComponent) {
        response = await updateComponent(ComponentType, componentImage);
      } else {
        response = await createComponent(ComponentType, componentImage);
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
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";
      message.error(errorMessage);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <h2 className="text-xl font-semibold mb-4">
        {initialComponent ? "Edit Component" : "Create Component"}
      </h2>
      <form onSubmit={handleSubmit}>
        {/* Component Name Input */}
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

        {/* Inner Component Input */}
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

        {/* Component Image Upload */}
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
                    onClick={() => toggleFullscreen(setIsFullscreen)}
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
                onChange={(e) =>
                  handleImageChange(e, setComponentImage, setImagePreview)
                }
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

        {/* Data Fields */}
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

        {/* Submit Button */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            type="submit"
            className="px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none"
          >
            {initialComponent ? "Update Component" : "Create Component"}
          </button>
        </div>

        {/* Schema Rule Manager */}
        <SchemaRuleManager />
      </form>

      {/* Fullscreen Image Preview */}
      {isFullscreen && imagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <img
            src={imagePreview}
            alt="Fullscreen preview"
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => toggleFullscreen(setIsFullscreen)}
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
