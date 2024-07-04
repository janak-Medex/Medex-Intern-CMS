import axiosInstance from "../http/axiosInstance";
import { toast } from "react-toastify";

import { Component } from "../components/createComponents";

// src/services/api.ts


export interface ComponentData {
    component_name: string;
    template_name?: string;
    data: any[];
    isActive: boolean;
    inner_component: number;
}

export const createComponent = async (componentData: ComponentData, componentImage: File | null) => {
    const formData = new FormData();

    formData.append("component_name", componentData.component_name);
    if (componentData.template_name) {
        formData.append("template_name", componentData.template_name);
    }
    formData.append("data", JSON.stringify(componentData.data));
    formData.append("isActive", String(componentData.isActive));
    formData.append("inner_component", String(componentData.inner_component));

    if (componentImage) {
        formData.append("component_image", componentImage);
    }

    const response = await axiosInstance.post("components", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export const updateComponent = async (id: string, componentData: ComponentData, componentImage: File | null) => {
    const formData = new FormData();

    formData.append("component_name", componentData.component_name);
    if (componentData.template_name) {
        formData.append("template_name", componentData.template_name);
    }
    formData.append("data", JSON.stringify(componentData.data));
    formData.append("isActive", String(componentData.isActive));
    formData.append("inner_component", String(componentData.inner_component));

    if (componentImage) {
        formData.append("component_image", componentImage);
    }



    const response = await axiosInstance.put(`components/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export const getSchemaRules = async () => {
    const response = await axiosInstance.get("schemas");
    return response.data;
};

export const addSchemaRule = async (rule: any) => {
    const response = await axiosInstance.post("schemas", [rule], {
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response.data;
};

export const updateSchemaRule = async (id: string, rule: any) => {
    const response = await axiosInstance.put(`schemas/${id}`, rule, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response.data;
};

export const deleteSchemaRule = async (id: string) => {
    const response = await axiosInstance.delete(`schemas/${id}`);
    return response.data;
};

export const updateComponentOrder = async (
    templateName: string,
    newComponents: Component[]
) => {
    try {
        const response = await axiosInstance.put(
            `/templates/${templateName}/reorder`,
            {
                components: newComponents.map((comp, index) => ({
                    _id: comp._id,
                    order: index,
                })),
            }
        );

        if (response.data.success) {
            toast.success("Component order updated successfully");
            return true;
        } else {
            toast.error("Failed to update component order");
            return false;
        }
    } catch (error) {
        console.error("Error updating component order:", error);
        toast.error("Failed to update component order");
        return false;
    }
};

// Function to update component status
export const updateComponentStatus = async (

    updatedComponent: Partial<Component>
) => {
    try {
        const response = await axiosInstance.post(`/components`, updatedComponent);

        if (response.status === 201) {
            toast.success("Component status updated successfully");
            return true;
        } else {
            toast.error("Failed to update component status");
            return false;
        }
    } catch (error) {
        console.error("Error updating component status:", error);
        toast.error("Failed to update component status");
        return false;
    }
};
