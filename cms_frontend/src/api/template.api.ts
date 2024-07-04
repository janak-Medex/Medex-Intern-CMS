// src/api/template.api.ts

import axiosInstance from "../http/axiosInstance";
import { Template } from "../template/Template";

// Fetch templates data

export const fetchTemplatesData = async (): Promise<Template[]> => {
    try {
        const response = await axiosInstance.get("/templates");
        return response.data;
    } catch (error) {
        console.error("Error fetching templates:", error);
        throw error;
    }
};

export const createTemplate = async (template_name: string): Promise<Template> => {
    try {
        const response = await axiosInstance.post("/templates", { template_name: template_name.trim() });
        return response.data;
    } catch (error) {
        console.error("Error creating template:", error);
        throw error;
    }
};

export const updateTemplateStatus = async (templateId: string, is_active: boolean): Promise<Template> => {
    try {
        const response = await axiosInstance.patch(`/templates/${templateId}`, { is_active });
        return response.data.data;
    } catch (error) {
        console.error("Error updating template status:", error);
        throw error;
    }
};

export const deleteTemplate = async (templateId: string): Promise<void> => {
    try {
        await axiosInstance.delete(`/templates/${templateId}`);
    } catch (error) {
        console.error("Error deleting template:", error);
        throw error;
    }
};