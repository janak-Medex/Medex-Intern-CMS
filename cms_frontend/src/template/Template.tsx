import React, { useState, useEffect } from "react";
import { BiAddToQueue } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import Modal from "../utils/Modal";
import axiosInstance from "../http/axiosInstance";

const Template: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [templateName, setTemplateName] = useState<string>("");
  const [templates, setTemplates] = useState<any[]>([]); // Array to store template objects

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axiosInstance.get("/templates"); // Adjust endpoint as per your API
      setTemplates(response.data); // Assuming response.data is an array of template objects
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleCreateTemplate = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTemplateName("");
  };

  const handleTemplateNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateName(e.target.value);
  };

  const handleSaveTemplate = async () => {
    if (templateName.trim() !== "") {
      try {
        // Assuming your backend API supports creating a new template
        await axiosInstance.post("/templates", { name: templateName.trim() });
        fetchTemplates(); // Fetch templates again to update the list
        setTemplateName("");
        setIsModalOpen(false);
        navigate(`/create-template`);
      } catch (error) {
        console.error("Error saving template:", error);
      }
    }
  };

  return (
    <>
      <div className="bg-[#39AF9F] py-8">
        <div className="container mx-auto text-center">
          <h1 className="text-white text-3xl font-semibold">
            Template Management System
          </h1>
        </div>
      </div>
      <div className="h-80 flex flex-col justify-center items-center">
        <button
          onClick={handleCreateTemplate}
          className="flex items-center rounded-full bg-[#39AF9F] hover:bg-teal-600 text-white py-3 px-6 focus:outline-none transition duration-300 ease-in-out"
        >
          <span className="mr-2 text-xl">Create a New Template</span>
          <BiAddToQueue size={30} className="animate-pulse" />
        </button>
      </div>
      <div className="container mx-auto mt-8">
        <h2 className="text-2xl font-semibold mb-4">Existing Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.length === 0 ? (
            <p className="text-gray-600">No templates created yet.</p>
          ) : (
            templates.map((template) => (
              <Link
                key={template._id}
                to={`/create-template/${template.template_name}`}
              >
                <div className="bg-white rounded-md p-4 shadow-md flex justify-between items-center cursor-pointer">
                  <span className="text-lg font-semibold">
                    {template.template_name}
                  </span>
                </div>
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
            value={templateName}
            onChange={handleTemplateNameChange}
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
