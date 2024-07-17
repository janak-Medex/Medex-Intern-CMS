export interface TemplateDetails {
    _id: string;
    template_name: string;
    component_name: string;
    data: { [key: string]: any };
    is_active: boolean;
    __v: number;
    components: ComponentType[];
    handleSubmit: any;
    updatedAt: string;
}

export interface TableData {
    templateName: string;
    is_active: boolean;
    componentArray: ComponentType[];
    components: {
        componentName: string;
        componentId: string;
        data: any;
        is_active: boolean;
    }[];
    updatedAt: string;
}

export interface ComponentType {
    components: any;
    component_name: string;
    template_name: any;
    data: any;
    is_active: boolean;
    inner_component: number;
    component_image?: string;
    _id?: string;
    updatedAt?: string;
}