import React, { useState } from "react";
import { FaEdit, FaTrash, FaGripVertical } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import { Switch } from "antd";

import { toast } from "react-toastify";
import {
  Component,
  updateComponentOrder,
  updateComponentStatus,
} from "../api/component.api";

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

    // Call the function to update the order
    updateOrder(newComponents);
  };

  const updateOrder = async (newComponents: Component[]) => {
    const success = await updateComponentOrder(template_name, newComponents);
    if (!success) {
      // If update failed, revert to the original order
      setComponents(components);
    }
  };

  const handleToggle = async (componentId: string) => {
    const toggledComponent = components.find(
      (comp) => comp._id === componentId
    );

    if (!toggledComponent) {
      toast.error("Component not found");
      return;
    }

    const updatedComponent = {
      template_name: template_name,
      component_name: toggledComponent.component_name,
      data: toggledComponent.data,
      isActive: !toggledComponent.is_active,
      inner_component: toggledComponent.inner_component,
      component_image: toggledComponent.component_image,
    };

    const success = await updateComponentStatus(updatedComponent);
    if (success) {
      const updatedComponents = components.map((comp) =>
        comp._id === componentId
          ? { ...comp, is_active: !comp.is_active }
          : comp
      );
      setComponents(updatedComponents);
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
                  checked={component.is_active}
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
