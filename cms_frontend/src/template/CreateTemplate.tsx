import React, { useState } from "react";
import { FaPlus, FaToggleOn, FaToggleOff } from "react-icons/fa";

interface Props {
  // Define your props here
}

const CreateTemplate: React.FC<Props> = (/* Destructure props here */) => {
  const [toggleStates, setToggleStates] = useState({
    component1: false,
    component2: false,
  });

  const handleToggle = (component: keyof typeof toggleStates) => {
    setToggleStates((prevState) => ({
      ...prevState,
      [component]: !prevState[component],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-teal-600 py-4">
        <div className="container mx-auto">
          <h1 className="text-white text-2xl font-semibold text-center">
            Template Management System
          </h1>
        </div>
      </header>
      <main className="container mx-auto py-8 grid grid-cols-12 gap-8 p-4">
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">Create Component</h2>
            <button className="w-full flex items-center justify-center px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700 transition duration-200">
              <FaPlus className="mr-2" /> Create
            </button>
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Show Components</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between bg-gray-100 rounded-md p-4">
                  <span>Component 1</span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`${
                        toggleStates.component1
                          ? "text-teal-600"
                          : "text-gray-400"
                      }`}
                    >
                      {toggleStates.component1 ? "Active" : "Inactive"}
                    </span>
                    <button
                      className="focus:outline-none"
                      onClick={() => handleToggle("component1")}
                    >
                      {toggleStates.component1 ? (
                        <FaToggleOn className="text-teal-600" size={24} />
                      ) : (
                        <FaToggleOff className="text-gray-400" size={24} />
                      )}
                    </button>
                  </div>
                </div>
                {/* Add more components as needed */}
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4">
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
            <h2 className="text-xl font-semibold mb-4">Main Content Area</h2>
            <p>
              This area can be used to display main content or other
              information.
            </p>
          </div>
        </div>
        <div className="col-span-12 md:col-span-5">
          <div className="bg-white rounded-lg shadow-md p-2 h-full">
            <h2 className="text-xl font-semibold mb-4">Component Images</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="bg-gray-100 rounded-md p-2 flex flex-col items-center">
                <img
                  src="../../public/images/component1.jpg"
                  alt="Component 1"
                  className="max-w-full h-auto mb-2 rounded-md"
                />
                <span>Component 1</span>
              </div>
              {/* Add more components as needed */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTemplate;
