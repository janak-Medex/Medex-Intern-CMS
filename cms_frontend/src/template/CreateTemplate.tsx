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
  List,
  Input,
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
import { FaCode, FaFile, FaImage, FaTable, FaVideo } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { BiChevronRight } from "react-icons/bi";

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
  const [activeTemplateKey, setActiveTemplateKey] = useState<string | string[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");

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
  const handleTemplateChange = (key: string | string[]) => {
    // If no panel is open or a different panel is clicked, open the new one
    if (Array.isArray(key) && key.length > 0) {
      setActiveTemplateKey(key[key.length - 1]);
    } else if (typeof key === "string") {
      setActiveTemplateKey(key);
    } else {
      // If the same panel is clicked or key is empty, close all panels
      setActiveTemplateKey([]);
    }
  };

  const getComponentIcon = (componentName: string) => {
    const lowerName = componentName.toLowerCase();
    if (lowerName.includes("video"))
      return <FaVideo className="text-red-500" />;
    if (lowerName.includes("image"))
      return <FaImage className="text-purple-500" />;
    if (lowerName.includes("file")) return <FaFile className="text-blue-500" />;
    if (lowerName.includes("table"))
      return <FaTable className="text-green-500" />;
    return <FaCode className="text-orange-500" />;
  };

  const filteredTableData = useMemo(() => {
    return tableData
      .map((template) => ({
        ...template,
        componentArray: template.componentArray.filter((component) =>
          component.component_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        ),
      }))
      .filter((template) => template.componentArray.length > 0);
  }, [tableData, searchTerm]);

  function formatDate(updatedAt: any) {
    if (!updatedAt) return "N/A";

    const date = new Date(updatedAt);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

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
      jsxCopy
      <Modal
        title={null}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={900}
        footer={null}
        className="rounded-2xl overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Import Existing Components
            </h2>
            <Input
              placeholder="Search components..."
              prefix={<IoSearchOutline className="text-gray-400" />}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-72 rounded-full border-none"
            />
          </div>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-6 custom-scrollbar">
          <Collapse
            activeKey={activeTemplateKey}
            onChange={(key) => handleTemplateChange(key as string)}
            className="bg-white shadow-sm rounded-xl"
            expandIcon={({ isActive }) => (
              <BiChevronRight
                className={`w-5 h-5 text-indigo-600 transition-transform duration-200 ${
                  isActive ? "transform rotate-90" : ""
                }`}
              />
            )}
          >
            {filteredTableData.map((data, index) => (
              <Panel
                header={
                  <div className="flex items-center justify-between py-3 px-2">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-2xl font-bold text-white">
                          {data.templateName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-indigo-700 text-xl">
                          {data.templateName}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          Last updated: {formatDate(data.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                        {data.componentArray.length} components
                      </span>
                    </div>
                  </div>
                }
                key={index.toString()}
                className="border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
              >
                <List
                  itemLayout="horizontal"
                  dataSource={data.componentArray}
                  renderItem={(component) => (
                    <List.Item
                      key={component.component_name}
                      className="py-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between w-full px-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl text-indigo-600">
                            {getComponentIcon(component.component_name)}
                          </div>
                          <div className="font-medium text-gray-800">
                            {component.component_name}
                          </div>
                        </div>
                        <Tooltip title="Import Component" key="import">
                          <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={() => handleImportComponent(component)}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-none shadow-md transition duration-300 text-sm px-4 py-2 rounded-full"
                          >
                            Import
                          </Button>
                        </Tooltip>
                      </div>
                    </List.Item>
                  )}
                />
              </Panel>
            ))}
          </Collapse>
        </div>
      </Modal>
    </Layout>
  );
};

export default React.memo(CreateTemplate);
