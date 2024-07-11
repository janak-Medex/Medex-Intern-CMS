// api.ts
import axiosInstance from "../http/axiosInstance";
import { FormData, FormType } from "../templateForm/types";

export const createForm = async (formData: FormData): Promise<void> => {
    const { name, fields, template_name } = formData;

    const cleanFields = fields.filter(Boolean); // Filter out null fields

    try {
        await axiosInstance.post("/form", { name, fields: cleanFields, template_name });
    } catch (error) {
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