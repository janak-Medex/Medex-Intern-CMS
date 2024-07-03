import axiosInstance from "../http/axiosInstance";
import { toast } from "react-toastify";

import { Component } from "../components/createComponents";

// Function to update component order
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
