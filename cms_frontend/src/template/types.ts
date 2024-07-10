export interface TemplateDetails {
    _id: string;
    template_name: string;
    component_name: string;
    data: { [key: string]: any };
    isActive: boolean;
    __v: number;
    components: ComponentType[];
    handleSubmit: any;
}

export interface TableData {
    templateName: string;
    isActive: boolean;
    componentArray: ComponentType[];
    components: {
        componentName: string;
        componentId: string;
        data: any;
        isActive: boolean;
    }[];
}

export interface ComponentType {
    _id: string;
    component_name: string;
    data: any;
    is_active: boolean;
    template_name: string;
    component_image?: string;
}