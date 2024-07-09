import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CreateComponent, {
  Component as ComponentType,
} from "../components/createComponents";
import ComponentList from "../template/ComponentList";
import axiosInstance from "../http/axiosInstance";
import FormComponent from "../template/FormComponent";
import { toast } from "react-toastify";
import {
  Image,
  Button,
  Modal,
  Layout,
  Card,
  Tooltip,
  Empty,
  Spin,
  Collapse,
} from "antd";
import {
  DownloadOutlined,
  UploadOutlined,
  PlusOutlined,
  MenuOutlined,
} from "@ant-design/icons";

import { HiHome } from "react-icons/hi2";
import TemplateForm from "../templateForm/TemplateForm";

const { Content, Header, Sider } = Layout;
const { Panel } = Collapse;

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

interface TableData {
  templateName: string;
  isActive: boolean;
  componentArray: ComponentType[];
  components: {
    componentName: string;
    componentId: string;
    data: any;
    isActive: boolean;
  }[];
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
  const [isTemplateFormVisible, setIsTemplateFormVisible] =
    useState<boolean>(false);

  useEffect(() => {
    fetchTemplateDetails();
    fetchAllComponents();
  }, [template_name]);

  const fetchTemplateDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<TemplateDetails>(
        `/templates/${template_name}`
      );
      setTemplateDetails(response.data);
      setComponents(response.data.components || []);
      console.log(response.data.components);
    } catch (error) {
      console.error("Error fetching template details:", error);
      toast.error("Failed to fetch template details");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllComponents = async () => {
    try {
      const response = await axiosInstance.get<ComponentType[]>("templates");
      if (response.status === 200) {
        setAllComponents(response.data);
        console.log(response.data);
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

      // Fetch the latest data for the active component
      const latestComponentData = await axiosInstance.get<ComponentType>(
        `/templates/${template_name}/components/${response.data._id}`
      );
      setActiveComponent(latestComponentData.data);

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

  const tableData: TableData[] = allComponents.map((template) => ({
    templateName: template.template_name,
    isActive: template.is_active,
    componentArray: template.components,
    components: template.components.map((component: ComponentType) => ({
      componentName: component.component_name,
      componentId: component._id,
      data: component.data,
      isActive: component.is_active,
    })),
  }));
  const refreshState = () => {
    setActiveComponent(null);
    setIsCreatingComponent(false);
    setEditingComponent(null);
    setToggleStates({});
    setComponents([...components]);
    toast.success("Template view refreshed");
  };
  const navigate = useNavigate();
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/template", { replace: true });
  };
  const refetchData = async () => {
    try {
      // Reset states
      setActiveComponent(null);
      setIsCreatingComponent(false);
      setEditingComponent(null);
      setToggleStates({});
      setComponents([]);

      // Fetch latest template details
      await fetchTemplateDetails();

      // Fetch all components again
      await fetchAllComponents();

      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    }
  };

  const handleOpenTemplateForm = () => {
    setIsTemplateFormVisible(true);
  };

  const handleCloseTemplateForm = () => {
    setIsTemplateFormVisible(false);
  };

  const handleFormCreated = () => {
    // Refetch template details or update the state as needed
    fetchTemplateDetails();
  };
  return (
    <Layout className="h-screen ">
      <Header className="bg-white shadow-md flex items-center justify-between px-6 py-2 mb-4 z-10">
        <div className="flex items-center">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="mr-2 text-indigo-600"
          />
          <Tooltip title="Go to Templates">
            <Button
              type="text"
              icon={<HiHome size="1.5rem" />}
              onClick={handleHomeClick}
              className="mr-2 text-indigo-600 hover:bg-indigo-50"
            />
          </Tooltip>
        </div>
        <div className="flex-grow flex justify-center">
          <h1
            className="text-xl font-bold text-indigo-700 m-0 cursor-pointer"
            onClick={refreshState}
          >
            {templateDetails
              ? templateDetails.template_name.toUpperCase()
              : "Loading..."}
          </h1>
        </div>
        <div className="flex gap-2">
          <Tooltip title="Create New Component">
            <Button
              type="primary"
              onClick={handleOpenCreateComponent}
              icon={<PlusOutlined />}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              Create New
            </Button>
          </Tooltip>
          <Tooltip title="Create New Form">
            <Button
              type="default"
              onClick={handleOpenTemplateForm}
              icon={<PlusOutlined />}
              className="border-indigo-500 text-indigo-500 hover:bg-indigo-50"
            >
              Create Form
            </Button>
          </Tooltip>
          <Tooltip title="Use Existing Component">
            <Button
              type="default"
              onClick={showModal}
              icon={<UploadOutlined />}
              className="border-indigo-500 text-indigo-500 hover:bg-indigo-50"
            >
              Use Existing
            </Button>
          </Tooltip>
        </div>
      </Header>
      <TemplateForm
        templateName={template_name || ""}
        visible={isTemplateFormVisible}
        onClose={handleCloseTemplateForm}
        onFormCreated={handleFormCreated}
        onFormDeleted={refetchData} // Add this line
      />
      <Layout className="flex-1 overflow-hidden">
        <Sider
          width={300}
          theme="light"
          trigger={null}
          collapsible
          collapsed={!sidebarVisible}
          collapsedWidth={0}
          className="border-r border-gray-100 shadow-md bg-white rounded-lg "
          style={{ height: "calc(100vh - 64px)", overflowY: "auto" }}
        >
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
            template_name={template_name || ""}
            setComponents={setComponents}
          />
        </Sider>
        <Content
          className="pl-4  overflow-y-hidden"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <Spin spinning={loading}>
            <div className="flex space-x-4 h-full ">
              <Card
                className="w-1/2 shadow-lg bg-white overflow-y-auto hide-scrollbar"
                style={{ height: "calc(100vh - 96px)" }}
              >
                <h2 className="text-xl font-semibold mb-4 ">
                  Component Details
                </h2>
                {isCreatingComponent && (
                  <CreateComponent
                    onClose={handleCloseCreateComponent}
                    onCreate={onCreateComponent}
                    initialComponent={editingComponent}
                  />
                )}
                {activeComponent && !isCreatingComponent && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-indigo-600">
                      {activeComponent.component_name}
                    </h3>
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
                      refetchData={refetchData}
                    />
                  </div>
                )}
                {!activeComponent && !isCreatingComponent && (
                  <Empty description="Select a component to view details" />
                )}
              </Card>
              <Card
                className="w-1/2 shadow-lg bg-white overflow-y-auto hide-scrollbar"
                style={{ height: "calc(100vh - 96px)" }}
              >
                <h2 className="text-xl font-semibold mb-4 ">
                  Component Images
                </h2>
                <div className="space-y-4 flex flex-col items-center justify-center">
                  {!activeComponent && !editingComponent ? (
                    components?.map((component, index) => (
                      <Card key={index} className="mb-4" size="small">
                        <p className="text-center text-lg font-semibold mb-2 text-indigo-600">
                          {component.component_name}
                        </p>
                        <div className="flex justify-center items-center">
                          <Image
                            src={`${import.meta.env.VITE_APP_BASE_IMAGE_URL}${
                              component?.component_image?.split("uploads\\")[1]
                            }`}
                            className="rounded-lg shadow-sm"
                          />
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card size="small">
                      <p className="text-center text-xl font-semibold mb-2 text-indigo-700">
                        {activeComponent?.component_name ||
                          editingComponent?.component_name}
                      </p>
                      <div className="flex justify-center items-center">
                        <Image
                          src={`${import.meta.env.VITE_APP_BASE_IMAGE_URL}${
                            (
                              activeComponent || editingComponent
                            )?.component_image?.split("uploads\\")[1]
                          }`}
                          className="rounded-lg shadow-sm"
                        />
                      </div>
                    </Card>
                  )}
                </div>
              </Card>
            </div>
          </Spin>
        </Content>
      </Layout>
      <Modal
        title="Import Existing Components"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
        footer={null}
        className="rounded-lg overflow-hidden"
      >
        <div className="max-h-96 overflow-y-auto">
          <Collapse className="bg-white shadow-inner">
            {tableData.map((data, index) => (
              <Panel
                header={
                  <span className="font-semibold text-indigo-600">
                    {data.templateName}
                  </span>
                }
                key={index}
                className="border-b last:border-b-0"
              >
                <ul className="list-none">
                  {data.components.map((component, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center py-2 border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <span className="text-gray-700">
                        {component.componentName}
                      </span>
                      <Tooltip title="Import Component">
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          size="small"
                          onClick={() =>
                            handleImportComponent(component.componentId)
                          }
                          className="bg-indigo-500 hover:bg-indigo-600 transition duration-300"
                        >
                          Import
                        </Button>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              </Panel>
            ))}
          </Collapse>
        </div>
      </Modal>
    </Layout>
  );
};

export default CreateTemplate;
