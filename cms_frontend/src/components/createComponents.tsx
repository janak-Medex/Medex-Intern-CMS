import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { message } from "antd";
import {
  createComponent,
  updateComponent,
  ComponentData,
} from "../api/component.api";
import SchemaRuleManager from "./SchemaRuleManager";
import { FormField, Props } from "./types";
import { validateForm } from "../utils/ComponentHelpers";
import ComponentPreview from "./ComponentPreview";

const CreateComponent: React.FC<Props> = ({
  onClose,
  onCreate,
  initialComponent,
}) => {
  const { template_name } = useParams<{ template_name: string }>();
  const [component_name, setComponentName] = useState<string>("");
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [innerComponent, setInnerComponent] = useState<number>(1);
  const [_imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  useEffect(() => {
    if (component_name.toLowerCase() === "hero") {
      setFormFields([
        { key: "title", value: "Welcome to Our Site" },
        { key: "subtitle", value: "Discover amazing things with us" },
        { key: "buttonText", value: "Get Started" },
        { key: "buttonUrl", value: "#" },
      ]);
    }
  }, [component_name]);

  const handleAddField = () => {
    setFormFields([...formFields, { key: "", value: "" }]);
    message.success("New field added");
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = [...formFields];
    updatedFields.splice(index, 1);
    setFormFields(updatedFields);
    message.success("Field removed");
  };

  const handleFieldChange = (
    index: number,
    field: "key" | "value",
    newValue: string
  ) => {
    const updatedFields = [...formFields];
    updatedFields[index] = {
      ...updatedFields[index],
      [field]: newValue,
    };
    setFormFields(updatedFields);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm(component_name, formFields, setErrors)) {
      message.error("Please fill in all required fields");
      return;
    }

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
        response = await updateComponent(componentData);
      } else {
        response = await createComponent(componentData);
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
    <div className="flex">
      <div className="w-1/2 bg-white rounded-lg shadow-md p-6 relative overflow-y-auto">
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
              Component Name
              <span className="text-red-500">*</span>
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
              <p className="text-red-500 text-xs mt-1">
                {errors.component_name}
              </p>
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
                <input
                  type="text"
                  className="flex-1 px-3 py-2 ml-2 text-gray-700 border rounded-lg focus:outline-none focus:border-teal-500"
                  placeholder="Field value"
                  value={field.value}
                  onChange={(e) =>
                    handleFieldChange(index, "value", e.target.value)
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
      </div>
      <div className="w-1/2 p-6 top-0 h-screen overflow-hidden">
        <h2 className="text-xl font-semibold mb-4">Component Preview</h2>
        <ComponentPreview
          component_name={component_name}
          formFields={formFields}
        />
      </div>
    </div>
  );
};

export default CreateComponent;
