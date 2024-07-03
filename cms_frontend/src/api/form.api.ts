import { AxiosResponse } from "axios";
import axiosInstance from "../http/axiosInstance";

export const submitFormData = async (formPayload: FormData): Promise<AxiosResponse> => {
    try {
        const response = await axiosInstance.post("/components", formPayload, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response;
    } catch (error) {
        console.error("Error submitting form:", error);
        throw error;
    }
};
