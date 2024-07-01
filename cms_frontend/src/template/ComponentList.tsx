import React, { useState } from "react";
import { FaEdit, FaTrash, FaGripVertical } from "react-icons/fa";
import { Component as ComponentType } from "../components/createComponents";
import { confirmAlert } from "react-confirm-alert";
import { Switch } from "antd";
import axiosInstance from "../http/axiosInstance";
import { toast } from "react-toastify";

interface ComponentListProps {
  components: ComponentType[];
  toggleStates: { [key: string]: boolean };
  onToggle: (component_name: string) => void;
  onEdit: (component: ComponentType) => void;
  onDelete: (componentId: string) => void;
  onShowComponentForm: (component: ComponentType) => void;
  template_name: string;
  setComponents: React.Dispatch<React.SetStateAction<ComponentType[]>>;
}

const ComponentList: React.FC<ComponentListProps> = ({
  components,
  toggleStates,
  onToggle,
  onEdit,
  onDelete,
  onShowComponentForm,
  template_name,
  setComponents,
}) => {
  const [draggedItem, setDraggedItem] = useState<ComponentType | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    item: ComponentType
  ) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetItem: ComponentType
  ) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newComponents = [...components];
    const draggedIndex = newComponents.findIndex(
      (item) => item._id === draggedItem._id
    );
    const targetIndex = newComponents.findIndex(
      (item) => item._id === targetItem._id
    );

    newComponents.splice(draggedIndex, 1);
    newComponents.splice(targetIndex, 0, draggedItem);

    setComponents(newComponents);
    setDraggedItem(null);

    // Call the API to update the order
    updateOrder(newComponents);
  };

  const updateOrder = async (newComponents: ComponentType[]) => {
    try {
      const response = await axiosInstance.put(
        `/templates/${template_name}/reorder`,
        {
          components: newComponents.map((comp, index) => ({
            _id: comp._id,
            order: index,
          })),
        }
      );

      if (response.data.success) {
        toast.success("Component order updated successfully");
      } else {
        toast.error("Failed to update component order");
        // If the API call fails, revert to the original order
        setComponents(components);
      }
    } catch (error) {
      console.error("Error updating component order:", error);
      toast.error("Failed to update component order");
      // If the API call fails, revert to the original order
      setComponents(components);
    }
  };

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
          components.map((component) => (
            <div
              key={component._id}
              draggable
              onDragStart={(e) => handleDragStart(e, component)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, component)}
              className="flex items-center justify-between bg-gray-100 rounded-md p-3 cursor-move"
              onClick={() => onShowComponentForm(component)}
            >
              <div className="flex items-center space-x-2">
                <FaGripVertical className="text-gray-400 cursor-move" />
                <span>{component.component_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  size="small"
                  checked={toggleStates[component.component_name]}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggle(component.component_name);
                  }}
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
