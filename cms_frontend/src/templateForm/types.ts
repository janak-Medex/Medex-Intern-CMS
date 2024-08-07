export type KeyValuePair = {
    key: string;
    value: string | File | File[];
}
export interface NestedOptionType {
    label: string;
    isPackage: boolean;
    options?: NestedOptionType[];
    keyValuePairs?: { [key: string]: string | File | File[] };
}



export interface FieldType {
    type: string;
    required: boolean;
    fieldName: string;
    placeholder: string;
    options?: (string | NestedOptionType)[];
    switch?: boolean;
    description?: string;
    keyValuePairs?: { key: string; value: string | File | File[] }[];

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
    formDataFields?: string;
    formDataTemplateName?: string;
}
export interface CustomFormData extends Omit<FormData, keyof globalThis.FormData>, globalThis.FormData { }