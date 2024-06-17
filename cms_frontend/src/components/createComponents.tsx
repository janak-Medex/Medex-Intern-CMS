import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

export interface FormField {
  name: string;
}

export interface Component {
  componentName: string;
  fields: FormField[];
}

interface Props {
  onClose: () => void;
  onCreate: (newComponent: Component) => void;
  initialComponent: Component | null; // Add initialComponent prop
}

const CreateComponent: React.FC<Props> = ({
  onClose,
  onCreate,
  initialComponent, // Destructure initialComponent from props
}) => {
  const [componentName, setComponentName] = useState("");
  const [formFields, setFormFields] = useState<FormField[]>([{ name: "" }]);

  useEffect(() => {
    if (initialComponent) {
      setComponentName(initialComponent.componentName);
      setFormFields(initialComponent.fields);
    }
  }, [initialComponent]);

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const newComponent: Component = {
      componentName: componentName,
      fields: formFields.filter((field) => field.name.trim() !== ""),
    };

    onCreate(newComponent); // Pass the created or updated component back to parent

    onClose(); // Close the modal
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <h2 className="text-xl font-semibold mb-4">Create Component</h2>
      <form onSubmit={handleSubmit}>
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
        <button
          type="submit"
          className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none"
        >
          {initialComponent ? "Update Component" : "Create Component"}
        </button>
      </form>
    </div>
  );
};

export default CreateComponent;
