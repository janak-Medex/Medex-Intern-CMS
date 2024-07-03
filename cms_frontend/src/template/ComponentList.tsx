import React, { useState } from "react";
import { FaEdit, FaTrash, FaGripVertical } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import { Switch } from "antd";
import axiosInstance from "../http/axiosInstance";
import { toast } from "react-toastify";

// Define the Component interface (assuming it's in createComponents.ts)
interface Component {
  _id: string;
  component_name: string;
  data: any; // Adjust type as per your actual structure
  is_active: boolean;
  inner_component?: any; // Adjust type as per your actual structure
  component_image?: string; // Adjust type as per your actual structure
}

interface ComponentListProps {
  components: Component[];
  toggleStates: { [key: string]: boolean };
  onToggle: (component_id: string) => void;
  onEdit: (component: Component) => void;
  onDelete: (componentId: string) => void;
  onShowComponentForm: (component: Component) => void;
  template_name: string;
  setComponents: React.Dispatch<React.SetStateAction<Component[]>>;
}

const ComponentList: React.FC<ComponentListProps> = ({
  components,
  onEdit,
  onDelete,
  onShowComponentForm,
  template_name,
  setComponents,
}) => {
  const [draggedItem, setDraggedItem] = useState<Component | null>(null);

  const handleDragStart = (
    _e: React.DragEvent<HTMLDivElement>,
    item: Component
  ) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetItem: Component
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

  const updateOrder = async (newComponents: Component[]) => {
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

  const handleToggle = async (componentId: string) => {
    // Find the component by ID and toggle its is_active property
    const toggledComponent = components.find(
      (comp) => comp._id === componentId
    );

    if (!toggledComponent) {
      toast.error("Component not found");
      return;
    }

    // Prepare the data payload to send to the server
    const updatedComponent = {
      template_name: template_name,
      component_name: toggledComponent.component_name,
      data: toggledComponent.data,
      isActive: !toggledComponent.is_active,
      inner_component: toggledComponent.inner_component,
      component_image: toggledComponent.component_image,
    };

    try {
      // Make the API call to update the component status
      const response = await axiosInstance.post(
        `/components`,
        updatedComponent
      );

      if (response.status === 201) {
        toast.success("Component status updated successfully");
        // Update the component in the local state
        const updatedComponents = components.map((comp) =>
          comp._id === componentId
            ? { ...comp, is_active: !comp.is_active }
            : comp
        );
        setComponents(updatedComponents);
      } else {
        toast.error("Failed to update component status");
      }
    } catch (error) {
      console.error("Error updating component status:", error);
      toast.error("Failed to update component status");
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
    <div className="space-y-4 flex-1 p-4 bg-white h-full">
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
                  checked={component.is_active} // Use component.is_active directly for switch state
                  onChange={() => {
                    if (component._id) {
                      handleToggle(component._id);
                    }
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
