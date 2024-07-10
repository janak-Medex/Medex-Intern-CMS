export interface FieldType {
    type: string;
    required: boolean;
    fieldName: string;
    placeholder: string;
    options?: string[];
}

export interface FormType {
    _id: string;
    name: string;
    fields: FieldType[];
    templateName: string;
    formName: string;
}