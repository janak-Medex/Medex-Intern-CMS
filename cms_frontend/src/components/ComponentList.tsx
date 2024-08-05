import React, { useEffect, useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaGripVertical,
  FaClipboardList,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import { Switch, Tooltip, Badge, message } from "antd";
import {
  updateComponentOrder,
  updateComponentStatus,
} from "../api/component.api";
import { Component } from "./types";
import TemplateForm from "../templateForm/TemplateForm";
import { decodeToken } from "../utils/JwtUtils";
import Cookies from "js-cookie";

interface ComponentListProps {
  components: Component[];
  toggleStates: { [key: string]: boolean };
  onToggle: (component_id: string) => void;
  onEdit: (component: Component) => void;
  onDelete: (componentId: string) => void;
  onShowComponentForm: (component: Component) => void;
  template_name: string;
  setComponents: React.Dispatch<React.SetStateAction<Component[]>>;
  refreshComponents: () => void;
}

const ComponentList: React.FC<ComponentListProps> = ({
  components,
  onEdit,
  onDelete,
  onShowComponentForm,
  template_name,
  setComponents,
  refreshComponents,
}) => {
  const [draggedItem, setDraggedItem] = useState<Component | null>(null);
  const [templateFormVisible, setTemplateFormVisible] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Component | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [userRole, setUserRole] = useState<string>("user");

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      const decodedToken = decodeToken(token);
      setUserRole(decodedToken?.role ?? "user");
    } else {
      setUserRole("user");
    }
  }, []);

  const isFormComponent = (componentName: string) =>
    componentName?.toLowerCase().startsWith("form_");

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    item: Component
  ) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    if (item._id) {
      e.dataTransfer.setData("text/plain", item._id);
    }
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 20, 20);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
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

    updateOrder(newComponents);
  };

  const updateOrder = async (newComponents: Component[]) => {
    const success = await updateComponentOrder(template_name, newComponents);
    if (!success) {
      setComponents(components);
    }
  };

  const handleToggle = async (componentId: string) => {
    const toggledComponent = components.find(
      (comp) => comp._id === componentId
    );

    if (!toggledComponent) {
      message.error("Component not found");
      return;
    }

    const updatedComponent = {
      template_name: template_name,
      component_name: toggledComponent.component_name,
      data: toggledComponent.data,
      is_active: !toggledComponent.is_active,
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

  const handleFormClick = (component: Component) => {
    setSelectedForm(component);
    setEditMode(false);
    setTemplateFormVisible(true);
  };

  const handleFormEdit = (e: React.MouseEvent, component: Component) => {
    e.stopPropagation();
    setSelectedForm(component);
    setEditMode(true);
    setTemplateFormVisible(true);
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
            refreshComponents();
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  const handleComponentClick = (component: Component) => {
    if (isFormComponent(component.component_name)) {
      handleFormClick(component);
    } else {
      onShowComponentForm(component);
    }
  };

  const truncateText = (text: string | undefined, maxLength: number) => {
    if (text === undefined) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <div className="space-y-4 flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg min-h-full overflow-hidden">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <FaClipboardList className="mr-3 text-indigo-600" />
        Component List
      </h2>
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] pr-2 custom-scrollbar pb-5">
        {components.length === 0 ? (
          <p className="text-gray-600 text-center py-8 bg-white rounded-lg shadow">
            No components available.
          </p>
        ) : (
          components.map((component) => (
            <div
              key={`${component._id}-${component.component_name}`}
              draggable
              onDragStart={(e) => handleDragStart(e, component)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, component)}
              className={`flex items-center justify-between rounded-lg p-4 transition-all duration-300 ease-in-out transform hover:scale-102 hover:shadow-md ${
                isFormComponent(component.component_name)
                  ? component.is_active
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                    : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                  : component.is_active
                  ? "bg-white border-l-4 border-green-500"
                  : "bg-gray-100 border-l-4 border-red-500"
              }`}
              onClick={() => handleComponentClick(component)}
            >
              <div className="flex items-center space-x-3 flex-grow min-w-0 cursor-pointer">
                <FaGripVertical
                  className={`cursor-grab flex-shrink-0 ${
                    isFormComponent(component.component_name)
                      ? "text-blue-200"
                      : component.is_active
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                />
                <div className="flex-grow min-w-0">
                  <Tooltip title={component.component_name}>
                    <span
                      className={`font-medium truncate block ${
                        isFormComponent(component.component_name)
                          ? "text-white"
                          : component.is_active
                          ? "text-gray-700"
                          : "text-gray-500"
                      }`}
                      style={{ maxWidth: "200px" }}
                    >
                      {truncateText(component.component_name, 20)}
                    </span>
                  </Tooltip>
                </div>
                <div className="flex-shrink-0 pl-3 pr-3">
                  {isFormComponent(component.component_name) && (
                    <Badge
                      count="Form"
                      style={{
                        backgroundColor: component.is_active
                          ? "#10B981"
                          : "#6B7280",
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 flex-shrink-0">
                {isFormComponent(component.component_name) ? (
                  <>
                    <Tooltip
                      title={component.is_active ? "Active" : "Inactive"}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (component._id) {
                            handleToggle(component._id);
                          }
                        }}
                        className="text-white hover:text-blue-200 transition-colors duration-200"
                      >
                        {component.is_active ? (
                          <FaToggleOn size={24} />
                        ) : (
                          <FaToggleOff size={24} />
                        )}
                      </button>
                    </Tooltip>
                    <Tooltip title="Edit Form">
                      <button
                        className="text-white hover:text-blue-200 transition-colors duration-200"
                        onClick={(e) => handleFormEdit(e, component)}
                      >
                        <FaEdit size={20} />
                      </button>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <Tooltip
                      title={component.is_active ? "Active" : "Inactive"}
                    >
                      <Switch
                        size="small"
                        checked={component.is_active}
                        onChange={() => {
                          if (component._id) {
                            handleToggle(component._id);
                          }
                        }}
                        className={`${
                          component.is_active ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    </Tooltip>
                    {userRole !== "user" && (
                      <>
                        <Tooltip title="Delete">
                          <button
                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(component._id);
                            }}
                          >
                            <FaTrash size={18} />
                          </button>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <button
                            className="text-indigo-500 hover:text-indigo-700 transition-colors duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(component);
                            }}
                          >
                            <FaEdit size={20} />
                          </button>
                        </Tooltip>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {templateFormVisible && (
        <TemplateForm
          userRole={userRole}
          templateName={template_name}
          visible={templateFormVisible}
          onClose={() => {
            setTemplateFormVisible(false);
            refreshComponents();
          }}
          onFormCreated={() => {
            refreshComponents();
            setTemplateFormVisible(false);
          }}
          onFormDeleted={() => {
            refreshComponents();
            setTemplateFormVisible(false);
          }}
          initialFormData={editMode ? selectedForm : null}
        />
      )}
    </div>
  );
};

export default ComponentList;
