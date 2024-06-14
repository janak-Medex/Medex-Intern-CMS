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
    <div className="h-screen flex flex-col">
      <div className="bg-[#39AF9F] h-1/8">
        <div className="container mx-auto py-8">
          <p className="text-white text-2xl text-center">
            Template Management System
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto p-4 h-full">
          <div className="grid grid-cols-12 gap-4 h-full">
            <div className="col-span-12 md:col-span-3 bg-teal-200 p-4 rounded-md shadow h-full overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Create Component</h2>
              <button className="w-full flex items-center justify-center px-4 py-2 text-white bg-teal-600 rounded-md hover:bg-teal-700">
                <FaPlus className="mr-2" /> Create
              </button>
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Show Components</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-md shadow">
                    <span>Component 1</span>
                    <button
                      className="flex items-center space-x-2 focus:outline-none"
                      onClick={() => handleToggle("component1")}
                    >
                      <span>
                        {toggleStates.component1 ? "Active" : "Inactive"}
                      </span>
                      {toggleStates.component1 ? (
                        <FaToggleOn className="text-green-500" size={34} />
                      ) : (
                        <FaToggleOff className="text-gray-500" size={34} />
                      )}
                    </button>
                  </div>
                  {/* Add more components as needed */}
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-4 border-2 border-dashed border-teal-400 p-4 rounded-md shadow h-full overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Main Content Area</h2>
              <p>
                This area can be used to display main content or other
                information.
              </p>
            </div>
            <div className="col-span-12 md:col-span-5 bg-teal-200 p-4 rounded-md shadow h-full overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Component Images</h2>
              <div className="space-y-4">
                <div className="bg-white rounded-md shadow p-4 flex flex-col items-center">
                  <img
                    src="../../public/images/component1.jpg"
                    alt="Component 1"
                    className="max-w-full h-auto mb-2"
                  />
                  <span>Component 1</span>
                </div>

                {/* Add more components as needed */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTemplate;
