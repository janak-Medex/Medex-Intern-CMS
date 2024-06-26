import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Component as ComponentType } from "../components/createComponents";
import ToggleButton from "./ToogleButton";
import { confirmAlert } from "react-confirm-alert";

interface ComponentListProps {
  components: ComponentType[];
  toggleStates: { [key: string]: boolean };
  onToggle: (component_name: string) => void;
  onEdit: (component: ComponentType) => void;
  onDelete: (componentId: string) => void;
  onShowComponentForm: (component: ComponentType) => void;
}

const ComponentList: React.FC<ComponentListProps> = ({
  components,
  toggleStates,
  onToggle,
  onEdit,
  onDelete,
  onShowComponentForm,
}) => {
  const handleDelete = (componentId: any) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this component?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            onDelete(componentId);
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  return (
    <div className="space-y-4 flex-1">
      <h2 className="text-xl font-semibold mb-4">Show Components</h2>
      <div className="space-y-2">
        {components.length === 0 ? (
          <p className="text-gray-600">No components available.</p>
        ) : (
          components.map((component, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-100 rounded-md p-3 cursor-pointer"
              onClick={() => onShowComponentForm(component)}
            >
              <span>{component.component_name}</span>
              <div className="flex items-center space-x-2">
                <span
                  className={`${
                    toggleStates[component.component_name]
                      ? "text-teal-600"
                      : "text-gray-400"
                  }`}
                >
                  {toggleStates[component.component_name]
                    ? "Active"
                    : "Inactive"}
                </span>
                <ToggleButton
                  isActive={toggleStates[component.component_name]}
                  onToggle={() => onToggle(component.component_name)}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(component._id);
                  }}
                >
                  <FaTrash className="text-red-600" />
                </button>
                <button
                  className="focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
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
};

export default ComponentList;
