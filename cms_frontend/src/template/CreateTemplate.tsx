import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { useParams } from "react-router-dom";
import CreateComponent, {
  Component as ComponentType,
} from "../components/createComponents";
import ComponentList from "../template/ComponentList";
import SchemaRuleModal from "../template/SchemaRule";
import axiosInstance from "../http/axiosInstance";
import FormComponent from "../template/FormComponent";
import { toast } from "react-toastify";

interface TemplateDetails {
  _id: string;
  template_name: string;
  component_name: string;
  data: { [key: string]: any };
  isActive: boolean;
  __v: number;
  components: ComponentType[];
}

const CreateTemplate: React.FC = () => {
  const { template_name } = useParams<{ template_name: string }>();
  const [toggleStates, setToggleStates] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [components, setComponents] = useState<ComponentType[]>([]);
  const [activeComponent, setActiveComponent] = useState<ComponentType | null>(
    null
  );
  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);
  const [templateDetails, setTemplateDetails] =
    useState<TemplateDetails | null>(null);
  const [isCreatingComponent, setIsCreatingComponent] =
    useState<boolean>(false);
  const [editingComponent, setEditingComponent] =
    useState<ComponentType | null>(null);

  useEffect(() => {
    fetchTemplateDetails();
  }, [template_name]);

  const fetchTemplateDetails = async () => {
    try {
      const response = await axiosInstance.get<TemplateDetails>(
        `/templates/${template_name}`
      );
      setTemplateDetails(response.data);
      setComponents(response.data.components || []);
    } catch (error) {
      console.error("Error fetching template details:", error);
    }
  };

  const handleToggle = (component_name: string) => {
    setToggleStates((prevState) => ({
      ...prevState,
      [component_name]: !prevState[component_name],
    }));

    if (!toggleStates[component_name]) {
      const component = components.find(
        (comp) => comp.component_name === component_name
      );
      if (component) {
        setActiveComponent({
          ...component,
          data: Array.isArray(component.data)
            ? component.data
            : [component.data],
        });
      } else {
        setActiveComponent(null);
      }
      setIsCreatingComponent(false);
    } else {
      setActiveComponent(null);
    }
  };

  const handleOpenCreateComponent = () => {
    setIsCreatingComponent(true);
    setEditingComponent(null);
    setActiveComponent(null);
  };

  const handleCloseCreateComponent = () => {
    setIsCreatingComponent(false);
  };

  const addComponent = (component: ComponentType) => {
    setComponents((prevComponents) => [...prevComponents, component]);
  };

  const onCreateComponent = (newComponent: ComponentType) => {
    const index = components.findIndex(
      (comp) => comp.component_name === newComponent.component_name
    );
    if (index === -1) {
      addComponent(newComponent);
    } else {
      const updatedComponents = [...components];
      updatedComponents[index] = newComponent;
      setComponents(updatedComponents);
    }
    setIsCreatingComponent(false);
  };

  const onDeleteComponent = async (componentId: string) => {
    try {
      await axiosInstance.delete(
        `/templates/${templateDetails?._id}/components/${componentId}`
      );
      // Update local state after successful deletion
      setComponents((prevComponents) =>
        prevComponents.filter((comp) => comp._id !== componentId)
      );
      if (activeComponent?._id === componentId) {
        setActiveComponent(null);
      }
      toast.success("Component deleted successfully", {
        className:
          "bg-green-500 text-white font-bold py-2 px-4 rounded-md shadow-md",
      });
    } catch (error) {
      console.error("Error deleting component:", error);
      toast.error("Failed to delete component", {
        className:
          "bg-red-500 text-white font-bold py-2 px-4 rounded-md shadow-md",
      });
    }
  };

  const handleAddRule = (newRule: {
    fieldName: string;
    type: string;
    required: boolean;
  }) => {
    setIsRuleModalOpen(false);
    // Implement the logic to add the new rule
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeComponent) return;

    try {
      const response = await axiosInstance.post<ComponentType>("/components", {
        component_name: activeComponent.component_name,
        data: JSON.stringify(activeComponent.data),
        isActive: true,
        template_name: template_name,
      });

      const updatedComponents = components.map((comp) =>
        comp.component_name === response.data.component_name
          ? response.data
          : comp
      );
      setComponents(updatedComponents);
      toast.success("Component saved successfully", {
        className:
          "bg-green-500 text-white font-bold py-2 px-4 rounded-md shadow-md",
      });
    } catch (error) {
      console.error("Error saving component:", error);
      toast.error("Failed to save component", {
        className:
          "bg-red-500 text-white font-bold py-2 px-4 rounded-md shadow-md",
      });
    }
  };

  const handleSetFormData = (updatedFormData: any) => {
    console.log("Parent received updated formData:", updatedFormData);
    setActiveComponent((prevActiveComponent) => {
      if (!prevActiveComponent) return null;
      return {
        ...prevActiveComponent,
        data: updatedFormData,
      };
    });
  };
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-teal-600 py-4">
        <div className="container mx-auto">
          <h1 className="text-white text-2xl font-semibold text-center">
            {templateDetails ? templateDetails.template_name : "Loading..."}
          </h1>
        </div>
      </header>
      <main className="container mx-auto py-8 grid grid-cols-12 gap-8 p-4">
        <div className="col-span-12 md:col-span-3 flex flex-col">
          <div className="bg-white rounded-lg shadow-md p-6 flex-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Manage Components</h2>
            <button
              className="w-full flex items-center justify-center px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 transition duration-200 mb-4"
              onClick={handleOpenCreateComponent}
            >
              <FaPlus className="mr-2" /> Create
            </button>
            <ComponentList
              components={components}
              toggleStates={toggleStates}
              onToggle={handleToggle}
              onEdit={(component) => {
                setEditingComponent(component as ComponentType);
                setIsCreatingComponent(true);
                setActiveComponent(null);
              }}
              onDelete={(componentId) => onDeleteComponent(componentId)}
              onShowComponentForm={(component) => {
                setActiveComponent(component);
                setIsCreatingComponent(false);
              }}
            />
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 flex flex-col">
          {isCreatingComponent && (
            <div className="bg-white rounded-lg shadow-md p-6 flex-1">
              <CreateComponent
                onClose={handleCloseCreateComponent}
                onCreate={onCreateComponent}
                initialComponent={editingComponent}
              />
            </div>
          )}

          {activeComponent && !isCreatingComponent && (
            <div className="bg-white rounded-lg shadow-md p-6 flex-1">
              <h2 className="text-xl font-semibold mb-4">
                {activeComponent.component_name}
              </h2>
              // In CreateTemplate.tsx
              <FormComponent
                formData={
                  Array.isArray(activeComponent.data)
                    ? activeComponent.data
                    : [activeComponent.data]
                }
                component_name={activeComponent.component_name}
                template_name={template_name || ""}
                setFormData={handleSetFormData}
              />
            </div>
          )}
          {!activeComponent && !isCreatingComponent && (
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
            <img
              src="../images/component1.jpg"
              alt="Banner"
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </main>

      <SchemaRuleModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        onAddRule={handleAddRule}
      />
    </div>
  );
};

export default CreateTemplate;
