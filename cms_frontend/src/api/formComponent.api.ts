// api.ts
import axiosInstance from "../http/axiosInstance";
import { FormType } from "../templateForm/types";

export const fetchForms = async (templateName: string): Promise<FormType[]> => {
    const response = await axiosInstance.get(`/form/${templateName}`);
    return response.data.data;
};

export const deleteForm = async (templateName: string, formName: string): Promise<void> => {
    await axiosInstance.delete(`/form/${templateName}/${formName}`);
};