import React, { useState, useEffect } from "react";
import { BiAddToQueue } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../utils/Modal";
import axiosInstance from "../http/axiosInstance";
import Cookies from "js-cookie";
import { Card, Switch, Tooltip } from "antd";
import { LogoutOutlined } from "@ant-design/icons";

const { Meta } = Card;

interface TemplateProps {
  onLogout: () => void;
}

const Template: React.FC<TemplateProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [template_name, settemplate_name] = useState<string>("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

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

  const checkLoginStatus = () => {
    const accessToken = Cookies.get("access_token");
    setIsLoggedIn(!!accessToken);
  };

  const fetchTemplates = async () => {
    try {
      const response = await axiosInstance.get("/templates");
      setTemplates(response.data);
    } catch (error) {
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
      } catch (error) {
        console.error("Error saving template:", error);
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
      }
    }
  };

  const handleLogout = () => {
    Cookies.remove("access_token");
    setIsLoggedIn(false);
    onLogout(); // Call the onLogout function passed from App
  };

  const handleSwitchChange = (checked: boolean, templateId: string) => {
    console.log(
      `Switch for template ${templateId} is ${checked ? "on" : "off"}`
    );
    // Add your logic for handling the switch change here
  };

  if (!isLoggedIn) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#39AF9F] py-4 px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-white text-2xl font-semibold">
            Template Management System
          </h1>
          <Tooltip title="Logout">
            <button
              onClick={handleLogout}
              className="text-white hover:text-gray-200 transition duration-300"
            >
              <LogoutOutlined style={{ fontSize: "24px" }} />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="container mx-auto mt-10 px-6">
        <div className="flex justify-center mb-10">
          <button
            onClick={handleCreateTemplate}
            className="flex items-center rounded-full bg-[#39AF9F] hover:bg-teal-600 text-white py-3 px-6 focus:outline-none transition duration-300 ease-in-out shadow-lg"
          >
            <span className="mr-2 text-xl">Create a New Template</span>
            <BiAddToQueue size={30} className="animate-pulse" />
          </button>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Existing Templates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {templates.length === 0 ? (
            <p className="text-gray-600 col-span-full text-center">
              No templates created yet.
            </p>
          ) : (
            templates.map((template) => (
              <div key={template._id} className="relative">
                <Link to={`/create-template/${template.template_name}`}>
                  <Card
                    className="w-full h-[120px] border border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out"
                    hoverable
                  >
                    <Meta
                      title={template.template_name}
                      description="View component"
                    />
                  </Card>
                </Link>
                <div className="absolute top-2 right-2">
                  <Tooltip
                    title={`${
                      template.active ? "Deactivate" : "Activate"
                    } template`}
                  >
                    <Switch
                      size="small"
                      defaultChecked={template.active}
                      onChange={(checked) =>
                        handleSwitchChange(checked, template._id)
                      }
                    />
                  </Tooltip>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal show={isModalOpen} onClose={handleCloseModal}>
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Enter Template Name</h2>
          <input
            type="text"
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full mb-4"
            placeholder="Template Name"
            value={template_name}
            onChange={handletemplate_nameChange}
          />
          <div className="flex justify-end">
            <button
              onClick={handleSaveTemplate}
              className="px-4 py-2 bg-[#39AF9F] hover:bg-teal-600 text-white rounded-md focus:outline-none transition duration-300 ease-in-out"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Template;
