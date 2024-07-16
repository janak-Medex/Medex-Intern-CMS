import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Space,
} from "antd";
import {
  DownloadOutlined,
  MenuOutlined,
  ReloadOutlined,
  AppstoreAddOutlined,
  FileAddOutlined,
  FormOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import { HiHome } from "react-icons/hi2";
import TemplateForm from "../templateForm/TemplateForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateComponent from "../components/createComponents";
import * as templateApi from "../api/createTemplate.api";
import { createTableData } from "../utils/CreateTableData";
import SelectExistingComponent from "../components/selectExistingComponent";
import { IoIosAdd } from "react-icons/io";

const { Content, Header, Sider } = Layout;
const { Panel } = Collapse;

const CreateTemplate: React.FC = () => {
  const { template_name } = useParams<{ template_name: string }>();
  const navigate = useNavigate();

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
  const [selectedMenuKey, setSelectedMenuKey] = useState("");
  const [addButtonText, setAddButtonText] = useState("Add Component");
  const [_selectedComponent, setSelectedComponent] =
    useState<ComponentType | null>(null);

  const fetchData = useCallback(async () => {
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
  }, [template_name]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const closeAllComponents = useCallback(() => {
    setIsCreatingComponent(false);
    setIsSelectingComponent(false);
    setEditingComponent(null);
    setActiveComponent(null);
    setToggleStates({});
  }, []);

  const handleToggle = useCallback(
    (component_name: string, isEditing: boolean = false) => {
      setToggleStates((prevState) => ({
        ...prevState,
        [component_name]: !prevState[component_name],
      }));

      if (!toggleStates[component_name] || isEditing) {
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
          setIsCreatingComponent(false); // Close the create component form
          setIsSelectingComponent(false);
          setEditingComponent(isEditing ? component : null);
        } else {
          setActiveComponent(null);
          setIsCreatingComponent(false);
          setIsSelectingComponent(false);
          setEditingComponent(null);
        }
      } else {
        setActiveComponent(null);
        setIsCreatingComponent(false);
        setIsSelectingComponent(false);
        setEditingComponent(null);
      }
    },
    [components, toggleStates]
  );

  const handleOpenCreateComponent = useCallback(() => {
    closeAllComponents();
    setIsCreatingComponent(true);
  }, [closeAllComponents]);

  const handleCloseCreateComponent = useCallback(() => {
    setIsCreatingComponent(false);
    setEditingComponent(null);
    setActiveComponent(null);
  }, []);

  const addComponent = useCallback((component: ComponentType) => {
    setComponents((prevComponents) => [...prevComponents, component]);
  }, []);

  const onCreateComponent = useCallback(
    async (newComponent: ComponentType) => {
      try {
        const index = components.findIndex(
          (comp) => comp.component_name === newComponent.component_name
        );
        if (index === -1) {
          addComponent(newComponent);
        } else {
          setComponents((prevComponents) => {
            const updatedComponents = [...prevComponents];
            updatedComponents[index] = newComponent;
            return updatedComponents;
          });
        }
        await fetchData();
        setIsCreatingComponent(false);
        message.success("Component saved successfully");
      } catch (error) {
        console.error("Error saving component:", error);
        message.error("Failed to save component");
      }
    },
    [components, addComponent, fetchData]
  );

  const onDeleteComponent = useCallback(
    async (componentId: string) => {
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
    },
    [templateDetails, activeComponent]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!activeComponent) return;
      try {
        const savedComponent = await templateApi.saveComponent(
          activeComponent,
          template_name!
        );
        setComponents((prevComponents) =>
          prevComponents.map((comp) =>
            comp.component_name === savedComponent.component_name
              ? savedComponent
              : comp
          )
        );
        setActiveComponent(savedComponent);
        await fetchData();
        message.success("Component saved successfully");
      } catch (error) {
        console.error("Error saving component:", error);
        message.error("Failed to save component");
      }
    },
    [activeComponent, template_name, fetchData]
  );

  const handleSetFormData = useCallback((updatedFormData: any) => {
    setActiveComponent((prevActiveComponent) => {
      if (!prevActiveComponent) return null;
      return {
        ...prevActiveComponent,
        data: updatedFormData,
      };
    });
  }, []);

  const handleImportComponent = useCallback(
    async (component: any) => {
      try {
        const importedComponent = await templateApi.importComponent(
          component,
          template_name!
        );
        setComponents((prevComponents) => [
          ...prevComponents,
          importedComponent,
        ]);
        await fetchData();
        message.success("Component imported successfully");
      } catch (error) {
        console.error("Error posting component:", error);
        message.error("Failed to import component");
      }
    },
    [template_name, fetchData]
  );

  const showModal = useCallback(() => setIsModalOpen(true), []);
  const handleOk = useCallback(() => setIsModalOpen(false), []);
  const handleCancel = useCallback(() => setIsModalOpen(false), []);

  const tableData: TableData[] = useMemo(
    () => createTableData(allComponents),
    [allComponents]
  );

  const refreshState = useCallback(() => {
    closeAllComponents();
    setToggleStates({});
    setAddButtonText("Add Component");
    setComponents((prevComponents) => [...prevComponents]);
    message.success("Template view refreshed");
  }, [closeAllComponents]);

  const handleHomeClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      navigate("/template", { replace: true });
    },
    [navigate]
  );

  const refetchData = useCallback(async () => {
    try {
      closeAllComponents();
      setAddButtonText("Add Component");
      setToggleStates({});
      setComponents([]);
      setIsSelectingComponent(false);
      await fetchData();
      message.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      message.error("Failed to refresh data");
    }
  }, [closeAllComponents, fetchData]);

  const handleOpenTemplateForm = useCallback(() => {
    closeAllComponents();
    setIsTemplateFormVisible(true);
  }, [closeAllComponents]);

  const handleCloseTemplateForm = useCallback(() => {
    setIsTemplateFormVisible(false);
  }, []);

  const handleFormCreated = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleSetActiveComponent = useCallback((component: ComponentType) => {
    setActiveComponent(component);
    setIsCreatingComponent(false);
    setIsSelectingComponent(false);
    setEditingComponent(null);
  }, []);
  const handleExistingComponentSelect = useCallback(
    async (component: ComponentType) => {
      try {
        setSelectedComponent(component);
        setIsSelectingComponent(false);
        setIsCreatingComponent(false);
        setEditingComponent(null);
        setActiveComponent(component);
        await fetchData();
        message.success("Component added successfully");
      } catch (error) {
        console.error("Error adding component:", error);
        message.error("Failed to add component");
      }
    },
    [fetchData]
  );

  const handleMenuClick = useCallback(
    (key: string, name: string) => {
      setSelectedMenuKey(key);
      setAddButtonText(name);
      closeAllComponents();

      switch (key) {
        case "1":
          setIsSelectingComponent(true);
          break;
        case "2":
          handleOpenCreateComponent();
          break;
        case "3":
          handleOpenTemplateForm();
          break;
        case "4":
          showModal();
          break;
        default:
          break;
      }
    },
    [
      closeAllComponents,
      handleOpenCreateComponent,
      handleOpenTemplateForm,
      showModal,
    ]
  );

  const menu = useMemo(
    () => (
      <Menu selectedKeys={[selectedMenuKey]}>
        <Menu.Item
          key="1"
          onClick={() => handleMenuClick("1", "Select Existing Component")}
        >
          <Space>
            <AppstoreAddOutlined />
            Select Existing Component
          </Space>
        </Menu.Item>
        <Menu.Item
          key="2"
          onClick={() => handleMenuClick("2", "Create New Component")}
        >
          <Space>
            <FileAddOutlined />
            Create New Component
          </Space>
        </Menu.Item>
        <Menu.Item key="3" onClick={() => handleMenuClick("3", "Create Form")}>
          <Space>
            <FormOutlined />
            Create Form
          </Space>
        </Menu.Item>
        <Menu.Item
          key="4"
          onClick={() => handleMenuClick("4", "Import Existing Component")}
        >
          <Space>
            <ImportOutlined />
            Import Existing Component
          </Space>
        </Menu.Item>
      </Menu>
    ),
    [selectedMenuKey, handleMenuClick]
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
              className="border-1  border-indigo-600 hover:border-gray-400 rounded-full shadow-sm"
              style={{
                width: "240px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 16px",
              }}
              icon={<IoIosAdd size={20} />}
            >
              <span className="text-indigo-300-600">{addButtonText}</span>{" "}
              {/* Display the button text */}
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
              handleToggle(component.component_name, true);
            }}
            onDelete={(componentId) => onDeleteComponent(componentId)}
            onShowComponentForm={handleSetActiveComponent}
            template_name={template_name || ""}
            setComponents={setComponents}
            refreshComponents={fetchData}
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
                    template_name={template_name || ""}
                    refetchData={fetchData}
                    closeComponent={closeAllComponents}
                  />
                )}
                {(isCreatingComponent || editingComponent) && (
                  <CreateComponent
                    key={editingComponent ? editingComponent._id : "new"}
                    onClose={handleCloseCreateComponent}
                    onCreate={onCreateComponent}
                    initialComponent={editingComponent}
                  />
                )}
                {activeComponent &&
                  !isCreatingComponent &&
                  !isSelectingComponent &&
                  !editingComponent && (
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
                  !isSelectingComponent &&
                  !editingComponent && (
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
                            )?.component_name?.startsWith("Form_")
                              ? "/images/form.svg"
                              : `${import.meta.env.VITE_APP_BASE_IMAGE_URL}${
                                  (
                                    activeComponent || editingComponent
                                  )?.component_image?.split("uploads\\")[1]
                                }`
                          }
                          className="rounded-lg shadow-sm"
                          alt={
                            activeComponent?.component_name ||
                            editingComponent?.component_name
                          }
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

export default React.memo(CreateTemplate);
// select existing component no form component show
// and while edit it open below it
// handle all of this
