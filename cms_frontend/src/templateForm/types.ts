export interface FieldType {
    type: string;
    required: boolean;
    fieldName: string;
    placeholder: string;
    options?: string[];
    switch?: boolean;
}

export interface FormType {
    _id: string;
    name: string;
    fields: FieldType[];
}

export interface FormPreviewProps {
    fields: FieldType[];
    templateName: string;
    formName: string;
}
export interface FormData {
    _id?: string;
    name: string;
    fields: FieldType[];
    template_name: string;
}
