// templateService.ts

import axiosInstance from "../http/axiosInstance";
import { Template } from "../template/Template";
import { Component } from "../components/createComponents";



export const fetchTemplateDetails = async (template_name: string) => {
    try {
        const response = await axiosInstance.get<Template>(
            `/templates/${template_name}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching template details:", error);
        throw new Error("Failed to fetch template details");
    }
};

export const fetchAllComponents = async () => {
    try {
        const response = await axiosInstance.get<Component[]>("templates");
        return response.data;
    } catch (error) {
        console.error("Error fetching components:", error);
        throw new Error("Failed to fetch all components");
    }
};

export const deleteComponent = async (
    templateId: string,
    componentId: string
) => {
    try {
        await axiosInstance.delete(`/templates/${templateId}/components/${componentId}`);
    } catch (error) {
        console.error("Error deleting component:", error);
        throw new Error("Failed to delete component");
    }
};

export const createComponent = async (componentData: Component) => {
    try {
        const response = await axiosInstance.post<Component>("/components", componentData);
        return response.data;
    } catch (error) {
        console.error("Error creating component:", error);
        throw new Error("Failed to create component");
    }
};
