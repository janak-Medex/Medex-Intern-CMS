import axios from '../http/axiosInstance';

export interface FormField {
    fieldName: string;
    fieldType: string;
    value: any;
}

export interface FormSubmission {
    _id: string;
    template_name: string;
    form_name: string;
    fields: FormField[];
    createdAt: string;
    updatedAt: string;
}

interface GetFormSubmissionsParams {
    page?: number;
    pageSize?: number;
}

interface GetFormSubmissionsResponse {
    submissions: FormSubmission[];
    page: number;
    total: number;
}

export const getFormSubmissions = async (
    formType: 'booking' | 'generic',
    params: GetFormSubmissionsParams
): Promise<GetFormSubmissionsResponse> => {
    try {
        const response = await axios.get<GetFormSubmissionsResponse>('formData/form-submissions', {
            params: {
                form_type: formType,
                page: params.page || 1,
                limit: params.pageSize || 10,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching form submissions:', error);
        throw error;
    }
};

export const getFormSubmissionById = async (
    id: string,
    formType: 'booking' | 'generic'
): Promise<FormSubmission> => {
    try {
        const response = await axios.get<FormSubmission>(`formData/form-submissions/${id}`, {
            params: { form_type: formType },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching form submission:', error);
        throw error;
    }
};