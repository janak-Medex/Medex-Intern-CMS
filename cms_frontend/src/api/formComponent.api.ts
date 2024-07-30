// api.ts
import axiosInstance from "../http/axiosInstance";
import { FormData, FormType } from "../templateForm/types";

export const createForm = async (formData: FormData): Promise<void> => {
    try {
        const response = await axiosInstance.post("/form", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log("Server response:", response.data);
    } catch (error: any) {
        console.error("Error in createForm:", error);
        if (error.response) {
            console.error("Server error response:", error.response.data);
        }
        throw new Error("Failed to save form");
    }
};
export const fetchForms = async (templateName: string): Promise<FormType[]> => {
    const response = await axiosInstance.get(`/form/${templateName}`);
    return response.data.data;
};

export const deleteForm = async (templateName: string, formName: string): Promise<void> => {
    await axiosInstance.delete(`/form/${templateName}/${formName}`);
};