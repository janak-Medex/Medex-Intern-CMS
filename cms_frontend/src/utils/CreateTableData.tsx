import { TableData, ComponentType } from "../template/types";

export const createTableData = (
  allComponents: ComponentType[]
): TableData[] => {
  return allComponents.map((template) => ({
    templateName: template.template_name,
    is_active: template.is_active,
    componentArray: template.components,
    components: template.components.map((component: ComponentType) => ({
      componentName: component.component_name,
      componentId: component._id,
      data: component.data,
      is_active: component.is_active,
    })),
    updatedAt: template.updatedAt ? template.updatedAt : "", // Add this line
  }));
};
