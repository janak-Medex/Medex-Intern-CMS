import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import Modal from "../utils/Modal";
import CreateComponent, {
  Component as ComponentType,
  FormField,
} from "../components/createComponents";
import ComponentList from "../template/ComponentList";
import SchemaRuleModal from "../template/SchemaRule";

const CreateTemplate: React.FC = () => {
  const [toggleStates, setToggleStates] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [components, setComponents] = useState<ComponentType[]>([]);
  const [activeComponent, setActiveComponent] = useState<ComponentType | null>(
    null
  );
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  const handleToggle = (componentName: string) => {
    setToggleStates((prevState) => ({
      ...prevState,
      [componentName]: !prevState[componentName],
    }));

    if (!toggleStates[componentName]) {
      const component = components.find(
        (comp) => comp.componentName === componentName
      );
      setActiveComponent(component || null);
    } else {
      setActiveComponent(null);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setActiveComponent(null); // Reset active component when opening modal for creation
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const addComponent = (component: ComponentType) => {
    setComponents((prevComponents) => [...prevComponents, component]);
  };

  const onCreateComponent = (newComponent: ComponentType) => {
    const index = components.findIndex(
      (comp) => comp.componentName === newComponent.componentName
    );
    if (index === -1) {
      // Create new component
      addComponent(newComponent);
    } else {
      // Update existing component
      const updatedComponents = [...components];
      updatedComponents[index] = newComponent;
      setComponents(updatedComponents);
    }
    setIsModalOpen(false); // Close the modal after creating or updating component
  };

  const onDeleteComponent = (componentName: string) => {
    setComponents((prevComponents) =>
      prevComponents.filter((comp) => comp.componentName !== componentName)
    );
  };

  const handleAddRule = (newRule: {
    fieldName: string;
    type: string;
    required: boolean;
  }) => {
    // Add logic to handle adding new rule (e.g., API call, state update)
    console.log("New Rule:", newRule);
    setIsRuleModalOpen(false);
  };

  const getFieldComponent = (field: FormField) => {
    switch (field.name) {
      case "image":
        return (
          <input
            type="file"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            accept="image/*"
            // required={field.required}
          />
        );
      case "is_active":
        return (
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-teal-600"
            id="is_active"
          />
        );
      default:
        return (
          <input
            type="text"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            placeholder={`Enter ${field.name}`}
            // required={field.required}
          />
        );
    }
  };

  const renderForm = (fields: FormField[]) => (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      {fields.map((field, index) => (
        <div key={index} className="flex flex-col space-y-2">
          <label className="text-gray-700 font-bold">{field.name}</label>
          {getFieldComponent(field)}
        </div>
      ))}
      <div className="flex justify-between items-center">
        <button
          type="submit"
          className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none"
        >
          Submit
        </button>
        <button
          onClick={() => setIsRuleModalOpen(true)}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none"
        >
          Insert New Schema Rule
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-teal-600 py-4">
        <div className="container mx-auto">
          <h1 className="text-white text-2xl font-semibold text-center">
            Template Management System
          </h1>
        </div>
      </header>
      <main className="container mx-auto py-8 grid grid-cols-12 gap-8 p-4">
        <div className="col-span-12 md:col-span-3 flex flex-col">
          <div className="bg-white rounded-lg shadow-md p-6 flex-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Create Component</h2>
            <button
              className="w-full flex items-center justify-center px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 transition duration-200 mb-4"
              onClick={handleOpenModal}
            >
              <FaPlus className="mr-2" /> Create
            </button>
            <ComponentList
              components={components}
              toggleStates={toggleStates}
              onToggle={handleToggle}
              onEdit={(component) => {
                setActiveComponent(component);
                setIsModalOpen(true); // Open modal for editing component
              }}
              onDelete={onDeleteComponent}
              onShowComponentForm={(component) => {
                setActiveComponent(component);
              }}
            />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 flex flex-col">
          {activeComponent && (
            <div className="bg-white rounded-lg shadow-md p-6 flex-1">
              <h2 className="text-xl font-semibold mb-4">
                {activeComponent.componentName}
              </h2>
              <div>{renderForm(activeComponent.fields)}</div>
            </div>
          )}
          {!activeComponent && (
            <div className="bg-white rounded-lg shadow-md p-6 flex-1 flex items-center justify-center">
              <p className="text-gray-600">
                Select a component to view details.
              </p>
            </div>
          )}
        </div>

        <div className="col-span-12 md:col-span-5 flex flex-col">
          <div className="bg-white rounded-lg shadow-md p-4 flex-1">
            <h2 className="text-xl font-semibold mb-4">Component Images</h2>
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-md p-4 flex flex-col items-center">
                <img
                  src="../images/component1.jpg"
                  alt="Component 1"
                  className="max-w-full h-auto mb-2 rounded-md"
                />
                <span className="text-center">Component 1</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Modal show={isModalOpen} onClose={handleCloseModal}>
        <CreateComponent
          onClose={handleCloseModal}
          onCreate={onCreateComponent}
          initialComponent={activeComponent} // Pass active component for editing
        />
      </Modal>

      <SchemaRuleModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        onAddRule={handleAddRule}
      />
    </div>
  );
};

export default CreateTemplate;
