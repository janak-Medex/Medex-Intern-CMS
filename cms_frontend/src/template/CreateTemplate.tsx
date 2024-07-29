import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ComponentType, TemplateDetails, TableData } from "./types";
import ComponentList from "../components/ComponentList";
import {
  Layout,
  Button,
  Tooltip,
  Spin,
  message,
  Dropdown,
  Space,
  Menu,
} from "antd";
import {
  MenuOutlined,
  ReloadOutlined,
  AppstoreAddOutlined,
  FileAddOutlined,
  FormOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import { HiHome } from "react-icons/hi2";
import { IoIosAdd } from "react-icons/io";
import Cookies from "js-cookie";
import { DecodedToken, decodeToken } from "../utils/JwtUtils";
import * as templateApi from "../api/createTemplate.api";
import { createTableData } from "../utils/CreateTableData";
import ComponentSection from "./ComponentSection";
import ImportModal from "./ImportModal";
import TemplateForm from "../templateForm/TemplateForm";
import UserInfo from "./UserInfo";

const { Header, Sider, Content } = Layout;

const CreateTemplate: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
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
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
  const [isTemplateFormVisible, setIsTemplateFormVisible] =
    useState<boolean>(false);
  const [isSelectingComponent, setIsSelectingComponent] =
    useState<boolean>(false);
  const [selectedMenuKey, setSelectedMenuKey] = useState("");
  const [addButtonText, setAddButtonText] = useState("Add Component");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeTemplateKey, setActiveTemplateKey] = useState<string | string[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState<string>("user");
  const [_userInfo, setUserInfo] = useState<DecodedToken | null>(null);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  useEffect(() => {
    if (isLoggedOut) {
      navigate("/", { replace: true });
    }
  }, [isLoggedOut, navigate]);
  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      try {
        const decodedToken = decodeToken(token);
        if (decodedToken) {
          setUserInfo(decodedToken);
          setUserRole(decodedToken.role || "user");
        } else {
          setIsLoggedOut(true);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsLoggedOut(true);
      }
    } else {
      setIsLoggedOut(true);
    }
  }, []);

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
          setIsCreatingComponent(false);
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
        const existingNames = components.map((comp) => comp.component_name);
        let componentToImport = { ...component };

        const baseComponentName = component.component_name;
        const regex = new RegExp(`^${baseComponentName}(_\\d+)?$`);
        const matchingComponents = existingNames.filter((name) =>
          regex.test(name)
        );

        if (matchingComponents.length > 0) {
          const suffixes = matchingComponents
            .map((name) => {
              const match = name.match(/_(\d+)$/);
              return match ? parseInt(match[1], 10) : 0;
            })
            .sort((a, b) => a - b);

          let newSuffix = 1;
          for (let i = 0; i <= suffixes.length; i++) {
            if (i === suffixes.length || suffixes[i] > newSuffix) {
              // We've found a gap or reached the end
              break;
            }
            if (suffixes[i] === newSuffix) {
              newSuffix++;
            }
          }

          if (matchingComponents.includes(baseComponentName)) {
            componentToImport.component_name = `${baseComponentName}_${newSuffix}`;
          } else {
            componentToImport.component_name = baseComponentName;
          }
        }

        const importedComponent = await templateApi.importComponent(
          componentToImport,
          template_name!
        );

        const finalComponentName =
          importedComponent.component_name || componentToImport.component_name;

        setComponents((prevComponents) => [
          ...prevComponents,
          importedComponent,
        ]);
        await fetchData();
        message.success(
          `Component "${finalComponentName}" imported successfully`
        );
      } catch (error) {
        console.error("Error importing component:", error);
        message.error("Failed to import component");
      }
    },
    [components, template_name, fetchData]
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
    if (Array.isArray(key) && key.length > 0) {
      setActiveTemplateKey(key[key.length - 1]);
    } else if (typeof key === "string") {
      setActiveTemplateKey(key);
    } else {
      setActiveTemplateKey([]);
    }
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
        {userRole !== "user" && (
          <Menu.Item
            key="2"
            onClick={() => handleMenuClick("2", "Create New Component")}
          >
            <Space>
              <FileAddOutlined />
              Create New Component
            </Space>
          </Menu.Item>
        )}
        {userRole !== "user" && (
          <Menu.Item
            key="3"
            onClick={() => handleMenuClick("3", "Create Form")}
          >
            <Space>
              <FormOutlined />
              Create Form
            </Space>
          </Menu.Item>
        )}
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
    [selectedMenuKey, handleMenuClick, userRole]
  );

  const handleLogout = useCallback(() => {
    onLogout();
  }, [onLogout]);

  return (
    <Layout className="h-screen">
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
              className="border-1 border-indigo-600 hover:border-gray-400 rounded-full shadow-sm"
              style={{
                width: "240px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "8px 16px",
                gap: "8px",
              }}
              icon={<IoIosAdd size={20} />}
            >
              <span className="text-indigo-600">{addButtonText}</span>
            </Button>
          </Dropdown>
          <UserInfo
            onLogout={handleLogout}
            user={{
              user_name: "",
              role: "admin",
            }}
          />
        </div>
      </Header>
      <TemplateForm
        templateName={template_name || ""}
        visible={isTemplateFormVisible}
        onClose={handleCloseTemplateForm}
        onFormCreated={handleFormCreated}
        onFormDeleted={refetchData}
        userRole={userRole}
      />
      <Layout className="flex-1 overflow-hidden">
        <Sider
          width={350}
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
            <ComponentSection
              isSelectingComponent={isSelectingComponent}
              isCreatingComponent={isCreatingComponent}
              editingComponent={editingComponent}
              activeComponent={activeComponent}
              components={components}
              template_name={template_name}
              handleExistingComponentSelect={handleExistingComponentSelect}
              fetchData={fetchData}
              closeAllComponents={closeAllComponents}
              handleCloseCreateComponent={handleCloseCreateComponent}
              onCreateComponent={onCreateComponent}
              handleSetFormData={handleSetFormData}
              handleSubmit={handleSubmit}
              refetchData={refetchData}
            />
          </Spin>
        </Content>
      </Layout>
      <ImportModal
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredTableData={filteredTableData}
        activeTemplateKey={activeTemplateKey}
        handleTemplateChange={handleTemplateChange}
        handleImportComponent={handleImportComponent}
        existingTemplateComponentNames={components.map(
          (comp) => comp.component_name
        )}
      />
    </Layout>
  );
};

export default React.memo(CreateTemplate);
