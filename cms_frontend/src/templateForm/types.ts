// export interface NestedOption {
//     label: string;
//     isPackage: boolean;
//     options?: NestedOption[];
//     keyValuePairs?: { key: string; value: string | File | File[] }[];
// }
// // types.ts

export interface NestedOptionType {
    label: string;
    isPackage: boolean;
    options?: NestedOptionType[];
    keyValuePairs?: { key: string; value: string | File | File[] }[];
}

export type KeyValuePair = { key: string; value: string | File | File[]; };


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