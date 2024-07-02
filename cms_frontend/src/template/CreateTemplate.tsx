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
import { Image, Button, Modal, Layout } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { MdOutlineExpandLess, MdOutlineExpandMore } from "react-icons/md";
import { RiDownloadLine } from "react-icons/ri";

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
  const { Sider, Content } = Layout;

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
      setComponents(response.data.components || []);
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

  const onCreateComponent = async (newComponent: ComponentType) => {
    try {
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
      await fetchTemplateDetails();
      setIsCreatingComponent(false);
      toast.success("Component saved successfully");
    } catch (error) {
      console.error("Error saving component:", error);
      toast.error("Failed to save component");
    }
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
      await fetchTemplateDetails();
      toast.success("Component saved successfully");
    } catch (error) {
      console.error("Error saving component:", error);
      toast.error("Failed to save component");
    }
  };

  const handleSetFormData = (updatedFormData: any) => {
    setActiveComponent((prevActiveComponent) => {
      if (!prevActiveComponent) return null;
      return {
        ...prevActiveComponent,
        data: updatedFormData,
      };
    });
  };

  const handleImportComponent = async (componentId: string) => {
    for (const data of tableData) {
      for (const component of data.componentArray) {
        if (component._id === componentId) {
          try {
            const response = await axiosInstance.post<ComponentType>(
              "/components",
              {
                ...component,
                template_name,
              }
            );
            setComponents((prevComponents) => [
              ...prevComponents,
              response.data,
            ]);
            toast.success("Component imported successfully");
            await fetchTemplateDetails();
            return;
          } catch (error) {
            console.error("Error posting component:", error);
            toast.error("Failed to import component");
          }
        }
      }
    }
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
    <Layout className="min-h-screen bg-gray-200">
      <Sider width={320} className="bg-gray-200 shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-600">
          Manage Components
        </h2>
        <div className="flex gap-2 w-full mb-6">
          <Button
            type="default"
            onClick={handleOpenCreateComponent}
            size="large"
            className="flex items-center justify-center w-1/2 bg-emerald-500 text-white hover:bg-emerald-600 transition duration-300"
            icon={<FaPlus className="mr-2" />}
          >
            Create New
          </Button>
          <Button
            type="primary"
            onClick={showModal}
            size="large"
            className="flex items-center justify-center w-1/2 transition duration-300"
            icon={<RiDownloadLine className="mr-2" />}
          >
            Use Existing
          </Button>
        </div>
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
          template_name={template_name}
          setComponents={setComponents}
        />
      </Sider>
      <Layout>
        <h1 className="ml-8 text-2xl font-bold text-gray-600 pt-4">
          {templateDetails ? templateDetails.template_name : "Loading..."}
        </h1>
        <Content className="p-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden grid grid-cols-2 gap-2">
            {isCreatingComponent && (
              <CreateComponent
                onClose={handleCloseCreateComponent}
                onCreate={onCreateComponent}
                initialComponent={editingComponent}
              />
            )}
            {activeComponent && !isCreatingComponent && (
              <div className="bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mt-6 ml-6 mb-0 text-gray-600">
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
              <div className="bg-white rounded-lg shadow-md flex items-center justify-center h-full">
                <p className="text-indigo-500 text-lg">
                  Select a component to view details.
                </p>
              </div>
            )}
            <div className="py-6 px-4 bg-white">
              <h2 className="text-xl font-bold mb-6 text-gray-600">
                Component Images
              </h2>
              <div className="h-screen overflow-y-auto hide-scrollbar">
                {!activeComponent ? (
                  components?.map((component, index) => (
                    <div key={index} className="mb-8">
                      <p className="text-center text-lg font-semibold mb-4 text-gray-600">
                        <span className="font-bold">Component: </span>
                        {component.component_name}
                      </p>
                      <Image
                        src={`${import.meta.env.VITE_APP_BASE_IMAGE_URL}${
                          component?.component_image?.split("uploads\\")[1]
                        }`}
                        className="rounded-lg shadow-md"
                      />
                    </div>
                  ))
                ) : (
                  <div>
                    <p className="text-center text-xl font-semibold mb-6 text-indigo-700">
                      <span className="font-bold">Component: </span>
                      {activeComponent?.component_name}
                    </p>
                    <Image
                      src={`${import.meta.env.VITE_APP_BASE_IMAGE_URL}${
                        activeComponent?.component_image?.split("uploads\\")[1]
                      }`}
                      className="rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Content>
      </Layout>
      <Modal
        title="All Templates (Click to see components)"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
        centered
        className="rounded-lg"
      >
        <div className="max-h-96 overflow-y-auto p-6">
          {tableData.map((data, index) => (
            <div key={index} className="mb-6 bg-white rounded-lg shadow-md">
              <div
                onClick={() => toggleExpand(index)}
                className="cursor-pointer bg-indigo-100 p-4 rounded-t-lg flex justify-between items-center"
              >
                <p className="text-base font-semibold text-indigo-800">
                  {expandedTables[index] ? (
                    <MdOutlineExpandLess className="mr-2 inline-block" />
                  ) : (
                    <MdOutlineExpandMore className="mr-2 inline-block" />
                  )}
                  {data.templateName}
                </p>
                <span className="text-sm text-indigo-600">Status</span>
              </div>
              {expandedTables[index] && (
                <div className="p-4">
                  {data.components.map((component, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-2 border-b last:border-b-0"
                    >
                      <span className="text-indigo-700">
                        {component.componentName}
                      </span>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        size="small"
                        onClick={() =>
                          handleImportComponent(component.componentId)
                        }
                        className="bg-emerald-500 hover:bg-emerald-600 transition duration-300 mr-2"
                      >
                        Import
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </Layout>
  );
};

export default CreateTemplate;
