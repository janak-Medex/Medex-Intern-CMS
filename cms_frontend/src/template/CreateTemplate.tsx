import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ComponentType, TemplateDetails, TableData } from "./types";
import ComponentList from "../components/ComponentList";
import FormComponent from "../template/FormComponent";
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
  message,
  Menu,
  Dropdown,
} from "antd";
import {
  DownloadOutlined,
  PlusOutlined,
  MenuOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { HiHome } from "react-icons/hi2";
import TemplateForm from "../templateForm/TemplateForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateComponent from "../components/createComponents";
import * as templateApi from "../api/createTemplate.api";
import { createTableData } from "../utils/CreateTableData";
import SelectExistingComponent from "../components/selectExistingComponent";
const { Content, Header, Sider } = Layout;
const { Panel } = Collapse;

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
  const [isSelectingComponent, setIsSelectingComponent] =
    useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [template_name]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const details = await templateApi.fetchTemplateDetails(template_name!);
      setTemplateDetails(details);
      setComponents(details.components || []);

      const allComps = await templateApi.fetchAllComponents();
      setAllComponents(allComps);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to fetch data");
    } finally {
      setLoading(false);
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
    setIsSelectingComponent(false);
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
      await fetchData();
      setIsCreatingComponent(false);
      message.success("Component saved successfully");
    } catch (error) {
      console.error("Error saving component:", error);
      message.error("Failed to save component");
    }
  };

  const onDeleteComponent = async (componentId: string) => {
    try {
      await templateApi.deleteComponent(templateDetails?._id!, componentId);
      setComponents((prevComponents) =>
        prevComponents.filter((comp) => comp._id !== componentId)
      );
      if (activeComponent?._id === componentId) {
        setActiveComponent(null);
      }
      message.success("Component deleted successfully");
    } catch (error) {
      console.error("Error deleting component:", error);
      message.error("Failed to delete component");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComponent) return;
    try {
      const savedComponent = await templateApi.saveComponent(
        activeComponent,
        template_name!
      );
      const updatedComponents = components.map((comp) =>
        comp.component_name === savedComponent.component_name
          ? savedComponent
          : comp
      );
      setComponents(updatedComponents);
      setActiveComponent(savedComponent);
      await fetchData();
      message.success("Component saved successfully");
    } catch (error) {
      console.error("Error saving component:", error);
      message.error("Failed to save component");
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

  const handleImportComponent = async (component: any) => {
    try {
      const importedComponent = await templateApi.importComponent(
        component,
        template_name!
      );
      setComponents((prevComponents) => [...prevComponents, importedComponent]);
      await fetchData();
      message.success("Component imported successfully");
    } catch (error) {
      console.error("Error posting component:", error);
      message.error("Failed to import component");
    }
  };

  const showModal = () => setIsModalOpen(true);
  const handleOk = () => setIsModalOpen(false);
  const handleCancel = () => setIsModalOpen(false);

  const tableData: TableData[] = createTableData(allComponents);

  const refreshState = () => {
    setActiveComponent(null);
    setIsCreatingComponent(false);
    setEditingComponent(null);
    setToggleStates({});
    setComponents([...components]);
    message.success("Template view refreshed");
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/template", { replace: true });
  };

  const refetchData = async () => {
    try {
      setActiveComponent(null);
      setIsCreatingComponent(false);
      setEditingComponent(null);
      setToggleStates({});
      setComponents([]);
      await fetchData();
      message.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      message.error("Failed to refresh data");
    }
  };

  const handleOpenTemplateForm = () => {
    setIsTemplateFormVisible(true);
  };

  const handleCloseTemplateForm = () => {
    setIsTemplateFormVisible(false);
  };

  const handleFormCreated = () => {
    fetchData();
  };

  const refreshComponents = async () => {
    await fetchData();
  };

  const handleExistingComponentSelect = (component: ComponentType) => {
    setComponents((prevComponents) => [...prevComponents, component]);
    setIsSelectingComponent(false);
    message.success("Component added successfully");
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={() => setIsSelectingComponent(true)}>
        Select Existing Component
      </Menu.Item>
      <Menu.Item key="2" onClick={handleOpenCreateComponent}>
        Create New Component
      </Menu.Item>
      <Menu.Item key="3" onClick={handleOpenTemplateForm}>
        Create Form
      </Menu.Item>
      <Menu.Item key="4" onClick={showModal}>
        Use Existing Component
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="h-screen">
      <ToastContainer />
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
          <Tooltip title="Refresh Data">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={refetchData}
              className="text-indigo-600 hover:bg-indigo-50"
            />
          </Tooltip>
          <Dropdown overlay={menu} placement="bottomRight">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              Add Component
            </Button>
          </Dropdown>
        </div>
      </Header>
      <TemplateForm
        templateName={template_name || ""}
        visible={isTemplateFormVisible}
        onClose={handleCloseTemplateForm}
        onFormCreated={handleFormCreated}
        onFormDeleted={refetchData}
      />
      <Layout className="flex-1 overflow-hidden">
        <Sider
          width={300}
          theme="light"
          trigger={null}
          collapsible
          collapsed={!sidebarVisible}
          collapsedWidth={0}
          className="border-r border-gray-100 shadow-md bg-white rounded-lg"
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
            refreshComponents={refreshComponents}
          />
        </Sider>
        <Content
          className="pl-4 overflow-y-hidden"
          style={{ height: "calc(100vh - 64px)" }}
        >
          <Spin spinning={loading}>
            <div className="flex space-x-4 h-full">
              <Card
                className="w-1/2 shadow-lg bg-white overflow-y-auto hide-scrollbar"
                style={{ height: "calc(100vh - 96px)" }}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Component Details
                </h2>
                {isSelectingComponent && (
                  <SelectExistingComponent
                    onComponentSelect={handleExistingComponentSelect}
                    templateName={template_name || ""}
                  />
                )}
                {isCreatingComponent && (
                  <CreateComponent
                    key={editingComponent ? editingComponent._id : "new"}
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
                {!activeComponent &&
                  !isCreatingComponent &&
                  !isSelectingComponent && (
                    <Empty description="Select a component to view details" />
                  )}
              </Card>
              <Card
                className="w-1/2 shadow-lg bg-white overflow-y-auto hide-scrollbar"
                style={{ height: "calc(100vh - 96px)" }}
              >
                <h2 className="text-xl font-semibold mb-4">Component Images</h2>
                <div className="space-y-4 flex flex-col items-center justify-center">
                  {!activeComponent && !editingComponent ? (
                    components?.map((component, index) => (
                      <Card key={index} className="mb-4 w-full" size="small">
                        <p className="text-center text-lg font-semibold mb-2 text-indigo-600">
                          {component.component_name}
                        </p>
                        <div className="flex justify-center items-center">
                          <Image
                            src={
                              component.component_name
                                ?.toLocaleLowerCase()
                                .startsWith("form_")
                                ? "/images/form.svg"
                                : `${import.meta.env.VITE_APP_BASE_IMAGE_URL}${
                                    component?.component_image?.split(
                                      "uploads\\"
                                    )[1]
                                  }`
                            }
                            className="rounded-lg shadow-sm max-w-full h-auto"
                            alt={component.component_name}
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
                          src={
                            (
                              activeComponent || editingComponent
                            )?.component_name.startsWith("Form_")
                              ? "path/to/default/image.png"
                              : `${import.meta.env.VITE_APP_BASE_IMAGE_URL}${
                                  (
                                    activeComponent || editingComponent
                                  )?.component_image?.split("uploads\\")[1]
                                }`
                          }
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
                  {data.componentArray.map((component, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center py-2 border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <span className="text-gray-700">
                        {component.component_name}
                      </span>
                      <Tooltip title="Import Component">
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          size="small"
                          onClick={() => handleImportComponent(component)}
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
