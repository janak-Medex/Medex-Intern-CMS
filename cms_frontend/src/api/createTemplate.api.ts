// templateService.ts

import axiosInstance from "../http/axiosInstance";
import { ComponentType, TemplateDetails } from "../template/types";



export const fetchTemplateDetails = async (template_name: string) => {
    const response = await axiosInstance.get<TemplateDetails>(`/templates/${template_name}`);
    return response.data;
};

export const fetchAllComponents = async () => {
    const response = await axiosInstance.get<ComponentType[]>("templates");
    return response.data;
};

export const deleteComponent = async (templateId: string, componentId: string) => {
    await axiosInstance.delete(`/templates/${templateId}/components/${componentId}`);
};

export const saveComponent = async (component: ComponentType, template_name: string) => {
    const response = await axiosInstance.post<ComponentType>("/components", {
        component_name: component.component_name,
        data: JSON.stringify(component.data),
        is_active: true,
        template_name: template_name,
    });
    return response.data;
};

export const importComponent = async (component: ComponentType, template_name: string) => {
    const response = await axiosInstance.post<ComponentType>("/components", {
        ...component,
        template_name,
    });
    return response.data;
};

