import React, { useState, useEffect } from "react";
import { BiAddToQueue } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../utils/Modal";
import Cookies from "js-cookie";
import { Switch, Input, Menu, Dropdown, message } from "antd";
import {
  MoreOutlined,
  DeleteOutlined,
  EditOutlined,
  DownOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { logout } from "../api/auth.api";
import {
  createTemplate,
  deleteTemplate,
  fetchTemplatesData,
  updateTemplateStatus,
} from "../api/template.api";
import CreateUser from "../login/createUserForm";
import { TiUserAddOutline } from "react-icons/ti";
import { decodeToken } from "../utils/JwtUtils";
import UserInfo from "./UserInfo";

const { Search } = Input;

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

interface UserInfo {
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
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "user" | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

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

  const sortMenu = (
    <Menu>
      <Menu.Item key="1" onClick={() => requestSort("template name")}>
        Sort by Name
      </Menu.Item>
      <Menu.Item key="2" onClick={() => requestSort("updatedAt")}>
        Sort by Last Edited
      </Menu.Item>
      <Menu.Item key="3" onClick={() => requestSort("is_active")}>
        Sort by Status
      </Menu.Item>
    </Menu>
  );

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white py-6 px-8 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-gray-800 text-3xl font-bold">Templates</h1>
          <div className="flex items-center space-x-6">
            {userRole === "admin" && (
              <button
                onClick={() => setShowCreateUser(true)}
                className="flex items-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 transition duration-300"
              >
                <TiUserAddOutline style={{ marginRight: "8px" }} />
                Create User
              </button>
            )}
            <Search
              placeholder="Search templates"
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300 }}
              className="border-2 border-gray-200 rounded-lg"
            />
            {userInfo && <UserInfo user={userInfo} onLogout={handleLogout} />}
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-12 px-8">
        <div className="flex justify-between items-center mb-10">
          <button
            onClick={handleCreateTemplate}
            className="flex items-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 focus:outline-none transition duration-300 ease-in-out shadow-lg hover:shadow-xl"
          >
            <BiAddToQueue size={24} className="mr-3" />
            <span className="text-lg font-semibold">New Template</span>
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => handleViewChange("grid")}
              className={`px-4 py-2 rounded-lg ${
                view === "grid"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-white text-gray-600"
              } transition-colors duration-300`}
            >
              Grid
            </button>
            <button
              onClick={() => handleViewChange("list")}
              className={`px-4 py-2 rounded-lg ${
                view === "list"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-white text-gray-600"
              } transition-colors duration-300`}
            >
              List
            </button>
            <Dropdown overlay={sortMenu} trigger={["click"]}>
              <button className="px-4 py-2 rounded-lg bg-white text-gray-600 transition-colors duration-300">
                Sort by {sortConfig.key}{" "}
                {sortConfig.direction === "asc" ? "↑" : "↓"} <DownOutlined />
              </button>
            </Dropdown>
          </div>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-2xl font-light">
              No templates found.
            </p>
            <p className="text-gray-400 mt-3 text-lg">
              Try adjusting your search or create a new template.
            </p>
          </div>
        ) : (
          <div
            className={`grid ${
              view === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                : "grid-cols-1 gap-6"
            }`}
          >
            {filteredTemplates.map((template) => (
              <div
                key={template._id}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out 
                      ${view === "grid" ? "p-6" : "p-5"}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <Link
                    to={`/template/${template.template_name}`}
                    className="block w-full"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-300">
                      {template.template_name}
                    </h3>
                  </Link>
                  <div className="flex items-center space-x-3">
                    <Switch
                      size="small"
                      checked={template.is_active}
                      onChange={(checked) =>
                        handleSwitchChange(checked, template._id)
                      }
                    />
                    <Dropdown overlay={menu(template._id)} trigger={["click"]}>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors duration-300">
                        <MoreOutlined style={{ fontSize: "20px" }} />
                      </button>
                    </Dropdown>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Last edited:{" "}
                  {new Date(template.updatedAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal show={isModalOpen} onClose={handleCloseModal}>
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-6">Create New Template</h2>
          <input
            type="text"
            className="border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full mb-6"
            placeholder="Template Name"
            value={template_name}
            onChange={handletemplate_nameChange}
          />
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleCloseModal}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTemplate}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>

      <Modal show={showCreateUser} onClose={() => setShowCreateUser(false)}>
        <CreateUser onClose={() => setShowCreateUser(false)} />
      </Modal>
    </div>
  );
};

export default Template;
