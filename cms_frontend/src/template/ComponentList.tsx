import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Component as ComponentType } from "../components/createComponents";
import ToggleButton from "./ToogleButton"; // Adjust the import path as per your project

interface ComponentListProps {
  components: ComponentType[];
  toggleStates: { [key: string]: boolean };
  onToggle: (componentName: string) => void;
  onEdit: (component: ComponentType) => void;
  onDelete: (componentName: string) => void;
  onShowComponentForm: (component: ComponentType) => void; // Define onShowComponentForm
}
const ComponentList: React.FC<ComponentListProps> = ({
  components,
  toggleStates,
  onToggle,
  onEdit,
  onDelete,
  onShowComponentForm,
}) => (
  <div className="space-y-4 flex-1">
    <h2 className="text-xl font-semibold mb-4">Show Components</h2>
    <div className="space-y-2">
      {components.length === 0 ? (
        <p className="text-gray-600">No components created yet.</p>
      ) : (
        components.map((component, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-100 rounded-md p-3 cursor-pointer"
            onClick={() => onShowComponentForm(component)} // Handle click to show component form
          >
            <span>{component.componentName}</span>
            <div className="flex items-center space-x-2">
              <span
                className={`${
                  toggleStates[component.componentName]
                    ? "text-teal-600"
                    : "text-gray-400"
                }`}
              >
                {toggleStates[component.componentName] ? "Active" : "Inactive"}
              </span>
              <ToggleButton
                isActive={toggleStates[component.componentName]}
                onToggle={() => onToggle(component.componentName)}
              />
              <button onClick={() => onDelete(component.componentName)}>
                <FaTrash className="text-red-600" />
              </button>
              {/* Clicking the Edit button triggers onEdit */}
              <button
                className="focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent click propagation to parent
                  onEdit(component);
                }}
              >
                <FaEdit className="text-gray-600" size={20} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default ComponentList;
