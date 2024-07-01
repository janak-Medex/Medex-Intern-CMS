import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { useParams } from "react-router-dom";
import CreateComponent, {
  Component as ComponentType,
} from "../components/createComponents";
import ComponentList from "../template/ComponentList";
import axiosInstance from "../http/axiosInstance";
import FormComponent from "../template/FormComponent";
import { toast } from "react-toastify";
import { Image } from "antd";
import { Button, Modal } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

interface TemplateDetails {
  _id: string;
  template_name: string;
  component_name: string;
  data: { [key: string]: any };
  isActive: boolean;
  __v: number;
  components: ComponentType[];
  handleSubmit: any;
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
  const [templateDetails, setTemplateDetails] =
    useState<TemplateDetails | null>(null);
  const [isCreatingComponent, setIsCreatingComponent] =
    useState<boolean>(false);
  const [editingComponent, setEditingComponent] =
    useState<ComponentType | null>(null);
  const [allComponents, setAllComponents] = useState<ComponentType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedTables, setExpandedTables] = useState({});
  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    fetchTemplateDetails();
    fetchAllComponents();
  }, [template_name]);

  useEffect(() => {
    if (templateDetails && templateDetails.components) {
      setComponents(templateDetails.components);
    }
  }, [templateDetails]);

  const fetchTemplateDetails = async () => {
    try {
      const response = await axiosInstance.get<TemplateDetails>(
        `/templates/${template_name}`
      );
      setTemplateDetails(response.data);
    } catch (error) {
      console.error("Error fetching template details:", error);
      toast.error("Failed to fetch template details");
    }
  };

  const fetchAllComponents = async () => {
    try {
      const response = await axiosInstance.get("templates");
      if (response.status === 200) {
        setAllComponents(response.data);
      }
    } catch (error) {
      console.error("Error fetching components:", error);
      toast.error("Failed to fetch all components");
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
      setComponents((prevComponents) =>
        prevComponents.filter((comp) => comp._id !== componentId)
      );
      if (activeComponent?._id === componentId) {
        setActiveComponent(null);
      }
      toast.success("Component deleted successfully");
    } catch (error) {
      console.error("Error deleting component:", error);
      toast.error("Failed to delete component");
    }
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
      toast.success("Component saved successfully");
    } catch (error) {
      console.error("Error saving component:", error);
      toast.error("Failed to save component");
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

  const handleImportComponent = async (componentId: string) => {
    console.log("Importing component:", componentId);

    for (const data of tableData) {
      for (const component of data.componentArray) {
        if (component._id === componentId) {
          console.log("Component found:", component);
          setComponents((prevComponents) => [...prevComponents, component]);

          try {
            const response = await axiosInstance.post<ComponentType>(
              "/components",
              {
                ...component,
                template_name,
              }
            );
            console.log("Component posted successfully:", response.data);
            toast.success("Component imported successfully");
          } catch (error) {
            console.error("Error posting component:", error);
            toast.error("Failed to import component");
          }
          return;
        }
      }
    }

    console.log("Component not found");
    toast.error("Component not found");
  };

  const showModal = () => setIsModalOpen(true);
  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);

  const toggleExpand = (index: number) => {
    setExpandedTables((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const tableData = allComponents.map((template) => ({
    templateName: template.template_name,
    isActive: template.is_active,
    componentArray: template.components,
    components: template.components.map((component) => ({
      componentName: component.component_name,
      componentId: component._id,
      data: component.data,
      isActive: component.is_active,
    })),
  }));

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
              key={`component-list-${forceUpdate}`}
              components={components}
              toggleStates={toggleStates}
              onToggle={handleToggle}
              onEdit={(component) => {
                setEditingComponent(component);
                setIsCreatingComponent(true);
                setActiveComponent(null);
              }}
              onDelete={(componentId) => onDeleteComponent(componentId)}
              onShowComponentForm={(component) => {
                setActiveComponent(component);
                setIsCreatingComponent(false);
              }}
              template_name={template_name}
              setComponents={setComponents}
            />
            <Button type="primary" onClick={showModal} size="large">
              Show other components
            </Button>
            <Modal
              title="All Templates (Click to see components)"
              open={isModalOpen}
              onOk={handleOk}
              onCancel={handleCancel}
              width={650}
              centered
            >
              <div>
                {tableData.map((data, index) => (
                  <table
                    key={index}
                    className="w-full mb-4 border-collapse table-fixed"
                  >
                    <thead
                      onClick={() => toggleExpand(index)}
                      className="cursor-pointer"
                    >
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left w-1/2">
                          {data.templateName}
                        </th>
                        <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left w-1/2">
                          Status
                        </th>
                      </tr>
                    </thead>
                    {expandedTables[index] && (
                      <tbody>
                        {data.components.map((component, idx) => (
                          <tr key={idx}>
                            <td className="border border-gray-300 px-4 py-2">
                              <span className="mr-12">
                                {component.componentName}
                              </span>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                size="small"
                                value={component.componentName}
                                onClick={() =>
                                  handleImportComponent(component.componentId)
                                }
                              >
                                Import
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    )}
                  </table>
                ))}
              </div>
            </Modal>
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
              <FormComponent
                formData={
                  Array.isArray(activeComponent.data)
                    ? activeComponent.data
                    : [activeComponent.data]
                }
                component_name={activeComponent.component_name}
                template_name={template_name}
                setFormData={handleSetFormData}
                handleSubmit={handleSubmit}
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
            <div className="h-screen overflow-y-auto">
              {!activeComponent ? (
                components?.map((component, index) => (
                  <div key={index} className="mb-6">
                    <p className="text-center capitalize text-base font-semibold mb-2">
                      <span className="font-semibold">Component: </span>
                      {component.component_name}
                    </p>
                    <Image
                      src={`${import.meta.env.VITE_APP_BASE_IMAGE_URL}${
                        component?.component_image?.split("uploads\\")[1]
                      }`}
                    />
                  </div>
                ))
              ) : (
                <div>
                  <p className="text-center capitalize text-xl mb-4">
                    <span className="font-semibold">Component: </span>
                    {activeComponent?.component_name}
                  </p>
                  <Image
                    src={`${import.meta.env.VITE_APP_BASE_IMAGE_URL}${
                      activeComponent?.component_image?.split("uploads\\")[1]
                    }`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTemplate;
