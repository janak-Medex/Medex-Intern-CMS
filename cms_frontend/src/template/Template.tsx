import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout, Input, Dropdown, message, Modal, Switch, Menu } from "antd";
import {
  MoreOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Cookies from "js-cookie";
import axios from "axios";
import { logout } from "../api/auth.api";
import {
  createTemplate,
  deleteTemplate,
  fetchTemplatesData,
  updateTemplateStatus,
} from "../api/template.api";
import { decodeToken } from "../utils/JwtUtils";
import UserManagement from "../login/userManagement";
import FormSubmissionsModal from "./FormSubmissionsModal";
import UserInfo from "./UserInfo";
import Sidebar from "./sider";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";

const { Header, Content } = Layout;

const colors = {
  primary: "#3498DB",
  secondary: "#2ECC71",
  background: "#ECF0F1",
  text: "#000000",
  accent: "#E74C3C",
  cardBg: "#FFFFFF",
  sidebarBg: "#34495E",
  sidebarContentBg: "#2C3E50",
  sidebarText: "#FFFFFF",
  sidebarItemSelectedBg: "#3498DB",
  sidebarTextSelected: "#FFFFFF",
};

const StyledLayout = styled(Layout)`
  min-height: 100vh;
  background: ${colors.background};
`;

const StyledHeader = styled(Header)`
  background: ${colors.cardBg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
`;

const StyledContent = styled(Content)`
  margin: 24px;
  padding: 24px;
  background: ${colors.cardBg};
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SearchInput = styled(Input)`
  width: 300px;
  border-radius: 20px;
  .ant-input-prefix {
    color: ${colors.text};
  }
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
`;

const TemplateList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TemplateCard = styled(motion.div)<{ active: boolean }>`
  background: ${colors.cardBg};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 5px solid
    ${(props) => (props.active ? colors.secondary : colors.accent)};
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const TemplateListItem = styled(motion.div)<{ active: boolean }>`
  background: ${colors.cardBg};
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  border-left: 5px solid
    ${(props) => (props.active ? colors.secondary : colors.accent)};
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const TemplateTitle = styled(Link)`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.primary};
  margin-bottom: 12px;
  display: block;
`;

const LastEdited = styled.p`
  font-size: 14px;
  color: ${colors.text};
  margin-bottom: 0;
`;

const StatusIndicator = styled.div<{ active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${(props) =>
    props.active ? colors.secondary : colors.accent};
  margin-right: 8px;
`;

interface TemplateProps {
  onLogout: () => void;
}

export interface Template {
  _id: string;
  template_name: string;
  is_active: boolean;
  updatedAt: string;
  status: number;
}

export interface UserInfo {
  user_name: string;
  role: "admin" | "user";
}

type SortKey = "template name" | "updatedAt" | "is_active";

type SortConfig = {
  key: SortKey;
  direction: "asc" | "desc";
};

const Template: React.FC<TemplateProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [template_name, settemplate_name] = useState<string>("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "updatedAt",
    direction: "desc",
  });
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "user" | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showFormSubmissionsModal, setShowFormSubmissionsModal] =
    useState(false);
  const [formType, setFormType] = useState<"booking" | "generic" | null>(null);

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      const decodedToken = decodeToken(token);
      if (decodedToken) {
        setUserRole(decodedToken?.role ?? "user");
        setUserInfo({
          user_name: decodedToken.user_name!,
          role: decodedToken.role!,
        });
      } else {
        handleLogout();
      }
    } else {
      handleLogout();
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchTemplates();
    } else {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const filtered = templates.filter((template) =>
      template.template_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const sorted = sortTemplates(filtered, sortConfig);
    setFilteredTemplates(sorted);
  }, [searchTerm, templates, sortConfig]);

  const checkLoginStatus = () => {
    const accessToken = Cookies.get("access_token");
    setIsLoggedIn(!!accessToken);
  };

  const fetchTemplates = async () => {
    try {
      const data = await fetchTemplatesData();
      setTemplates(data);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    }
  };

  const sortTemplates = (templatesToSort: Template[], config: SortConfig) => {
    return [...templatesToSort].sort((a, b) => {
      if (config.key === "template name") {
        return config.direction === "asc"
          ? a.template_name.localeCompare(b.template_name, undefined, {
              numeric: true,
              sensitivity: "base",
            })
          : b.template_name.localeCompare(a.template_name, undefined, {
              numeric: true,
              sensitivity: "base",
            });
      }
      if (config.key === "updatedAt") {
        return config.direction === "asc"
          ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (config.key === "is_active") {
        return config.direction === "asc"
          ? a.is_active === b.is_active
            ? 0
            : a.is_active
            ? -1
            : 1
          : a.is_active === b.is_active
          ? 0
          : a.is_active
          ? 1
          : -1;
      }
      return 0;
    });
  };

  const requestSort = (key: SortKey) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleCreateTemplate = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    settemplate_name("");
  };

  const handletemplate_nameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    settemplate_name(e.target.value);
  };

  const handleSaveTemplate = async () => {
    if (template_name.trim() !== "") {
      try {
        const accessToken = Cookies.get("access_token");
        if (!accessToken) {
          handleLogout();
          return;
        }

        const template = await createTemplate(template_name.trim());
        if (template) {
          fetchTemplates();
          settemplate_name("");
          setIsModalOpen(false);
          navigate(`/template/${template_name}`);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error("Error saving template:", error.message);
          if (error.response && error.response.status === 401) {
            handleLogout();
          }
        } else {
          console.error("An unexpected error occurred:", error);
        }
      }
    }
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const handleSwitchChange = async (checked: boolean, templateId: string) => {
    try {
      const template = await updateTemplateStatus(templateId, checked);
      const statusMessage = checked ? "active" : "inactive";
      message.success(
        `Template '${template.template_name}' is now ${statusMessage}`
      );
      fetchTemplates();
    } catch (error) {
      console.error("Error updating template status:", error);
      message.error("Failed to update template status");
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleViewChange = (newView: "grid" | "list") => {
    setView(newView);
  };

  const handleTemplateAction = async (action: string, templateId: string) => {
    switch (action) {
      case "edit":
        const template = templates.find((t) => t._id === templateId);
        if (template) {
          navigate(`/template/${template.template_name}`);
        }
        break;
      case "delete":
        try {
          await deleteTemplate(templateId);
          fetchTemplates();
        } catch (error) {
          console.error("Error deleting template:", error);
        }
        break;
      default:
        break;
    }
  };

  const handleFormSubmissionsClick = (type: "booking" | "generic") => {
    setFormType(type);
    setShowFormSubmissionsModal(true);
  };

  const menu = (templateId: string) => (
    <Menu>
      <Menu.Item
        key="1"
        icon={<EditOutlined />}
        onClick={() => handleTemplateAction("edit", templateId)}
      >
        Edit
      </Menu.Item>
      <Menu.Item
        key="2"
        icon={<DeleteOutlined />}
        onClick={() => handleTemplateAction("delete", templateId)}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  const GridView = () => (
    <TemplateGrid>
      {filteredTemplates.map((template) => (
        <TemplateCard
          key={template._id}
          active={template.is_active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <TemplateTitle to={`/template/${template.template_name}`}>
              {template.template_name}
            </TemplateTitle>
            <div>
              <Switch
                checked={template.is_active}
                onChange={(checked) =>
                  handleSwitchChange(checked, template._id)
                }
                style={{ marginRight: "8px" }}
              />
              <Dropdown overlay={menu(template._id)} trigger={["click"]}>
                <MoreOutlined
                  style={{
                    fontSize: "18px",
                    color: colors.text,
                    cursor: "pointer",
                  }}
                />
              </Dropdown>
            </div>
          </div>
          <LastEdited>
            Last edited: {new Date(template.updatedAt).toLocaleString()}
          </LastEdited>
        </TemplateCard>
      ))}
    </TemplateGrid>
  );

  const ListView = () => (
    <TemplateList>
      {filteredTemplates.map((template) => (
        <TemplateListItem
          key={template._id}
          active={template.is_active}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <StatusIndicator active={template.is_active} />
            <TemplateTitle to={`/template/${template.template_name}`}>
              {template.template_name}
            </TemplateTitle>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <LastEdited style={{ marginRight: "16px" }}>
              Last edited: {new Date(template.updatedAt).toLocaleString()}
            </LastEdited>
            <Switch
              checked={template.is_active}
              onChange={(checked) => handleSwitchChange(checked, template._id)}
              style={{ marginRight: "8px" }}
            />
            <Dropdown overlay={menu(template._id)} trigger={["click"]}>
              <MoreOutlined
                style={{
                  fontSize: "18px",
                  color: colors.text,
                  cursor: "pointer",
                }}
              />
            </Dropdown>
          </div>
        </TemplateListItem>
      ))}
    </TemplateList>
  );

  if (!isLoggedIn) {
    return null;
  }

  return (
    <StyledLayout>
      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        handleCreateTemplate={handleCreateTemplate}
        handleViewChange={handleViewChange}
        requestSort={requestSort}
        handleFormSubmissionsClick={handleFormSubmissionsClick}
        setShowUserManagement={setShowUserManagement}
        userRole={userRole}
      />
      <Layout>
        <StyledHeader>
          <h1 style={{ color: colors.primary, margin: 0, fontSize: "24px" }}>
            Templates
          </h1>
          <div style={{ display: "flex", alignItems: "center" }}>
            <SearchInput
              prefix={<SearchOutlined />}
              placeholder="Search templates"
              onChange={(e) => handleSearch(e.target.value)}
              style={{ marginRight: "16px" }}
            />
            {userInfo && <UserInfo user={userInfo} onLogout={handleLogout} />}
          </div>
        </StyledHeader>
        <StyledContent>
          <AnimatePresence>
            {filteredTemplates.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: "center", padding: "48px 0" }}
              >
                <p style={{ fontSize: "24px", color: colors.primary }}>
                  No templates found.
                </p>
                <p
                  style={{
                    fontSize: "16px",
                    color: colors.text,
                    marginTop: "12px",
                  }}
                >
                  Try adjusting your search or create a new template.
                </p>
              </motion.div>
            ) : view === "grid" ? (
              <GridView />
            ) : (
              <ListView />
            )}
          </AnimatePresence>
        </StyledContent>
      </Layout>

      <Modal
        title="Create New Template"
        visible={isModalOpen}
        onOk={handleSaveTemplate}
        onCancel={handleCloseModal}
      >
        <Input
          placeholder="Template Name"
          value={template_name}
          onChange={handletemplate_nameChange}
        />
      </Modal>

      <Modal
        visible={showUserManagement}
        onCancel={() => setShowUserManagement(false)}
        footer={null}
        width="80%"
        closable={false}
        bodyStyle={{ maxHeight: "77vh", overflow: "auto" }}
        className="custom-scrollbar"
      >
        <UserManagement onClose={() => setShowUserManagement(false)} />
      </Modal>

      <FormSubmissionsModal
        show={showFormSubmissionsModal}
        onClose={() => setShowFormSubmissionsModal(false)}
        formType={formType}
      />
    </StyledLayout>
  );
};

export default Template;
