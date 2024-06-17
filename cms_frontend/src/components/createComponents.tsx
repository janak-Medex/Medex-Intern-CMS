import React, { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

interface Props {
  onClose: () => void;
}

interface FormField {
  name: string;
}

const CreateComponent: React.FC<Props> = ({ onClose }) => {
  const [templateName, setTemplateName] = useState("");
  const [componentName, setComponentName] = useState("");
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  const handleAddField = () => {
    setFormFields([...formFields, { name: "" }]);
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = [...formFields];
    updatedFields.splice(index, 1);
    setFormFields(updatedFields);
  };

  const handleFieldChange = (index: number, value: string) => {
    const updatedFields = [...formFields];
    updatedFields[index].name = value;
    setFormFields(updatedFields);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <button
        className="absolute top-2 right-2 text-gray-500"
        onClick={onClose}
      ></button>
      <h2 className="text-xl font-semibold mb-4">Create Component</h2>
      <form>
        <div className="mb-4">
          <label
            htmlFor="templateName"
            className="block text-gray-700 font-bold mb-2"
          >
            Template Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="templateName"
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-teal-500"
            placeholder="Enter template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="componentName"
            className="block text-gray-700 font-bold mb-2"
          >
            Component Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="componentName"
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-teal-500"
            placeholder="Enter component name"
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Data Fields
          </label>
          {formFields.map((field, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-teal-500"
                placeholder="Field name"
                value={field.name}
                onChange={(e) => handleFieldChange(index, e.target.value)}
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
            className="flex items-center text-teal-600 focus:outline-none"
            onClick={handleAddField}
          >
            <FaPlus className="mr-1" /> Add Field
          </button>
        </div>
        <div className="mb-4">
          <label
            htmlFor="imageUrl"
            className="block text-gray-700 font-bold mb-2"
          >
            Image URL
          </label>
          <input
            type="text"
            id="imageUrl"
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-teal-500"
            placeholder="Enter image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none"
        >
          Create Component
        </button>
      </form>
    </div>
  );
};

export default CreateComponent;
