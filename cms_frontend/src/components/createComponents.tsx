import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useParams } from "react-router-dom";
import SchemaRuleModal, { SchemaRule } from "../template/SchemaRule";
import axiosInstance from "../http/axiosInstance";
import Cookies from "js-cookie";

export interface FormField {
  [key: string]: null;
}

export interface Component {
  component_name: string;
  data: FormField[];
  isActive: boolean;
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
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialComponent) {
      setComponentName(initialComponent.component_name);
      setFormFields(initialComponent.data || []);
    }
  }, [initialComponent]);

  const handleAddField = () => {
    setFormFields([...formFields, {}]);
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = [...formFields];
    updatedFields.splice(index, 1);
    setFormFields(updatedFields);
  };

  const handleFieldChange = (index: number, oldKey: string, newKey: string) => {
    const updatedFields = [...formFields];
    const { [oldKey]: value, ...rest } = updatedFields[index];
    updatedFields[index] = { ...rest, [newKey]: null };
    setFormFields(updatedFields);
  };

  const handleAddSubField = (index: number) => {
    const updatedFields = [...formFields];
    updatedFields[index] = { ...updatedFields[index], "": null };
    setFormFields(updatedFields);
  };

  const handleRemoveSubField = (index: number, key: string) => {
    const updatedFields = [...formFields];
    const { [key]: removed, ...rest } = updatedFields[index];
    updatedFields[index] = rest;
    setFormFields(updatedFields);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const newComponent = {
      component_name: component_name,
      template_name: template_name,
      data: formFields,
      isActive: true,
    };

    try {
      const response = await axiosInstance.post("components", newComponent);

      if (response.status === 200) {
        onCreate(response.data);
        onClose();
      }
    } catch (error) {
      console.error("Error creating/updating component:", error);
    }
  };

  const handleInsertRule = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddSchemaRule = (newRule: SchemaRule) => {
    setIsModalOpen(false);
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
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-teal-500"
            placeholder="Enter component name"
            value={component_name}
            onChange={(e) => setComponentName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Data Fields
          </label>
          {formFields.map((field, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              {Object.keys(field).map((key) => (
                <div key={key} className="flex items-center mb-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-teal-500 mr-2"
                    placeholder="Field name"
                    value={key}
                    onChange={(e) =>
                      handleFieldChange(index, key, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="ml-2 text-red-500 focus:outline-none"
                    onClick={() => handleRemoveSubField(index, key)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="flex items-center text-teal-600 focus:outline-none mt-2"
                onClick={() => handleAddSubField(index)}
              >
                <FaPlus className="mr-1" /> Add Sub-field
              </button>
              <button
                type="button"
                className="ml-2 text-red-500 focus:outline-none"
                onClick={() => handleRemoveField(index)}
              >
                <FaTrash /> Remove Field
              </button>
            </div>
          ))}
          <button
            type="button"
            className="flex items-center text-teal-600 focus:outline-none"
            onClick={handleAddField}
          >
            <FaPlus className="mr-1" /> Add Field
          </button>
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
            onClick={handleInsertRule}
            className="px-4 py-3 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors duration-300"
          >
            Add New Schema Rule
          </button>
        </div>
      </form>
      <SchemaRuleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddRule={handleAddSchemaRule}
      />
    </div>
  );
};

export default CreateComponent;
