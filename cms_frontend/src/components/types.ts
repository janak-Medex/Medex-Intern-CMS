export interface FormField {
    key: string;
    value: string;
}

export interface SchemaRule {
    _id: string;
    fieldName: string;
    type: string;
    required: boolean;
    originalFieldName?: string;
}

export interface Component {
    components: any;
    component_name: string;
    template_name: string | undefined;
    data: FormField[];
    is_active: boolean;
    inner_component: number;
    component_image?: string;
    _id?: string;

}

export interface Props {
    onClose: () => void;
    onCreate: (newComponent: Component) => void;
    initialComponent: Component | null;
}