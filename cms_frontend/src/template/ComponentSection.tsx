import React from "react";
import { Card, Empty } from "antd";
import SelectExistingComponent from "../components/selectExistingComponent";
import CreateComponent from "../components/createComponents";
import FormComponent from "../template/FormComponent";
import { ComponentType } from "./types";

interface ComponentSectionProps {
  isSelectingComponent: boolean;
  isCreatingComponent: boolean;
  editingComponent: ComponentType | null;
  activeComponent: ComponentType | null;
  components: ComponentType[];
  template_name: string | undefined;
  handleExistingComponentSelect: (component: ComponentType) => Promise<void>;
  fetchData: () => Promise<void>;
  closeAllComponents: () => void;
  handleCloseCreateComponent: () => void;
  onCreateComponent: (newComponent: ComponentType) => Promise<void>;
  handleSetFormData: (updatedFormData: any) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  refetchData: () => Promise<void>;
}

const ComponentSection: React.FC<ComponentSectionProps> = ({
  isSelectingComponent,
  isCreatingComponent,
  editingComponent,
  activeComponent,
  components,
  template_name,
  handleExistingComponentSelect,
  fetchData,
  closeAllComponents,
  handleCloseCreateComponent,
  onCreateComponent,
  handleSetFormData,
  handleSubmit,
  refetchData,
}) => {
  return (
    <div className="flex space-x-4 h-full">
      <Card
        className="w-1/2 shadow-lg bg-white overflow-y-auto hide-scrollbar"
        style={{ height: "calc(100vh - 96px)" }}
      >
        <h2 className="text-xl font-semibold mb-4">Component Details</h2>
        {isSelectingComponent && (
          <SelectExistingComponent
            onComponentSelect={handleExistingComponentSelect}
            template_name={template_name || ""}
            refetchData={fetchData}
            closeComponent={closeAllComponents}
          />
        )}
        {(isCreatingComponent || editingComponent) && (
          <CreateComponent
            key={editingComponent ? editingComponent._id : "new"}
            onClose={handleCloseCreateComponent}
            onCreate={onCreateComponent}
            initialComponent={editingComponent}
          />
        )}
        {activeComponent &&
          !isCreatingComponent &&
          !isSelectingComponent &&
          !editingComponent && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-indigo-600">
                {activeComponent.component_name}
              </h3>
              <FormComponent
                formData={
                  Array.isArray(activeComponent.data)
                    ? activeComponent.data
                    : [activeComponent.data]
                }
                component_name={activeComponent.component_name}
                template_name={template_name}
                setFormData={handleSetFormData}
                handleSubmit={handleSubmit}
                refetchData={refetchData}
                inner_component={activeComponent.inner_component || 1}
              />
            </div>
          )}
        {!activeComponent &&
          !isCreatingComponent &&
          !isSelectingComponent &&
          !editingComponent && (
            <Empty description="Select a component to view details" />
          )}
      </Card>

      <Card
        className="w-1/2 shadow-lg bg-white overflow-y-auto hide-scrollbar"
        style={{ height: "calc(100vh - 96px)" }}
      >
        <h2 className="text-xl font-semibold mb-4">Component Images</h2>
        <div className="space-y-4 flex flex-col items-center justify-center">
          {!activeComponent && !editingComponent ? (
            components?.map((component, index) => (
              <Card key={index} className="mb-4 w-full" size="small">
                <p className="text-center text-lg font-semibold mb-2 text-indigo-600">
                  {component.component_name}
                </p>
                <div className="flex justify-center items-center">
                  <img
                    src={
                      component.component_name
                        ?.toLocaleLowerCase()
                        .startsWith("form_")
                        ? "/images/form.svg"
                        : `${import.meta.env.VITE_APP_BASE_IMAGE_URL}${
                            component?.component_image?.split("uploads\\")[1]
                          }`
                    }
                    className="rounded-lg shadow-sm max-w-full h-auto"
                    alt={component.component_name}
                  />
                </div>
              </Card>
            ))
          ) : (
            <Card size="small">
              <p className="text-center text-xl font-semibold mb-2 text-indigo-700">
                {activeComponent?.component_name ||
                  editingComponent?.component_name}
              </p>
              <div className="flex justify-center items-center">
                <img
                  src={
                    (
                      activeComponent || editingComponent
                    )?.component_name?.startsWith("Form_")
                      ? "/images/form.svg"
                      : `${import.meta.env.VITE_APP_BASE_IMAGE_URL}${
                          (
                            activeComponent || editingComponent
                          )?.component_image?.split("uploads\\")[1]
                        }`
                  }
                  className="rounded-lg shadow-sm"
                  alt={
                    activeComponent?.component_name ||
                    editingComponent?.component_name
                  }
                />
              </div>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
};

export default React.memo(ComponentSection);
