import React, { useState, useEffect } from "react";
import { BiAddToQueue } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../utils/Modal";
import axiosInstance from "../http/axiosInstance";
import Cookies from "js-cookie";
import { Card } from "antd";
const { Meta } = Card;

const Template: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [template_name, settemplate_name] = useState<string>("");
  const [templates, setTemplates] = useState<any[]>([]); // Array to store template objects

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axiosInstance.get("/templates");
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
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
          return;
        }

        // Send POST request to create a new template
        const response = await axiosInstance.post(
          "/templates",
          { template_name: template_name.trim() },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`, // Include access token in Authorization header
            },
          }
        );

        // Check if response is successful
        if (response.status === 200 || response.status === 201) {
          fetchTemplates(); // Update templates list
          settemplate_name(""); // Clear input field
          setIsModalOpen(false); // Close modal
          navigate(`/create-template/${template_name}`); // Navigate to new template page
        } else {
        }
      } catch (error) {}
    } else {
    }
  };

  return (
    <>
      <div className="bg-[#39AF9F] py-6">
        <div className="container mx-auto text-center">
          <h1 className="text-white text-2xl font-semibold">
            Template Management System
          </h1>
        </div>
      </div>

      <div className="mt-16 flex flex-col justify-center items-center">
        <button
          onClick={handleCreateTemplate}
          className="flex items-center rounded-full bg-[#39AF9F] hover:bg-teal-600 text-white py-3 px-6 focus:outline-none transition duration-300 ease-in-out"
        >
          <span className="mr-2 text-xl">Create a New Template</span>
          <BiAddToQueue size={30} className="animate-pulse" />
        </button>
      </div>

      <div className="container mx-auto my-10 px-6">
        <h2 className="text-2xl font-semibold mb-4">Existing Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {templates.length === 0 ? (
            <p className="text-gray-600">No templates created yet.</p>
          ) : (
            templates.map((template) => (
              <Link
                key={template._id}
                to={`/create-template/${template.template_name}`}
              >
                <Card
                  className="w-[280px] h-[100px] border border-gray-300 shadow-sm hover:shadow-lg transform hover:scale-105 transition-transform duration-200"
                  hoverable
                  // cover={<img alt="example" src="https://example.com/example.jpg" />}
                >
                  <Meta
                    title={template.template_name}
                    description="View component"
                  />
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>

      <Modal show={isModalOpen} onClose={handleCloseModal}>
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Enter Template Name</h2>
          <input
            type="text"
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-teal-500 w-full"
            placeholder="Template Name"
            value={template_name}
            onChange={handletemplate_nameChange}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveTemplate}
              className="px-4 py-2 bg-[#39AF9F] hover:bg-teal-600 text-white rounded-md focus:outline-none"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Template;
