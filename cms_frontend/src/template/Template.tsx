import React, { useState, useEffect } from "react";
import { BiAddToQueue } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../utils/Modal";
import axiosInstance from "../http/axiosInstance";
import Cookies from "js-cookie";
import { Switch, Tooltip, Input, Menu, Dropdown } from "antd";
import {
  LogoutOutlined,
  MoreOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Search } = Input;

interface TemplateProps {
  onLogout: () => void;
}

interface Template {
  _id: string;
  template_name: string;
  active: boolean;
  updatedAt: string;
}

const Template: React.FC<TemplateProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [template_name, settemplate_name] = useState<string>("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);

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
    setFilteredTemplates(filtered);
  }, [searchTerm, templates]);

  const checkLoginStatus = () => {
    const accessToken = Cookies.get("access_token");
    setIsLoggedIn(!!accessToken);
  };

  const fetchTemplates = async () => {
    try {
      const response = await axiosInstance.get("/templates");
      setTemplates(response.data);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    }
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

        const response = await axiosInstance.post(
          "/templates",
          { template_name: template_name.trim() },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          fetchTemplates();
          settemplate_name("");
          setIsModalOpen(false);
          navigate(`/create-template/${template_name}`);
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
    Cookies.remove("access_token");
    setIsLoggedIn(false);
    onLogout();
  };

  const handleSwitchChange = async (checked: boolean, templateId: string) => {
    try {
      await axiosInstance.patch(`/templates/${templateId}`, {
        active: checked,
      });
      fetchTemplates();
    } catch (error) {
      console.error("Error updating template status:", error);
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
          navigate(`/create-template/${template.template_name}`);
        }
        break;
      case "delete":
        try {
          await axiosInstance.delete(`/templates/${templateId}`);
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

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white py-6 px-8 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-gray-800 text-3xl font-bold">Templates</h1>
          <div className="flex items-center space-x-6">
            <Search
              placeholder="Search templates"
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300 }}
              className="border-2 border-gray-200 rounded-lg"
            />
            <Tooltip title="Logout">
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 transition duration-300"
              >
                <LogoutOutlined style={{ fontSize: "24px" }} />
              </button>
            </Tooltip>
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
                    to={`/create-template/${template.template_name}`}
                    className="block w-full"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-300">
                      {template.template_name}
                    </h3>
                  </Link>
                  <div className="flex items-center space-x-3">
                    <Switch
                      size="small"
                      checked={template.active}
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
                  {new Date(template.updatedAt).toLocaleDateString()}
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
    </div>
  );
};

export default Template;
