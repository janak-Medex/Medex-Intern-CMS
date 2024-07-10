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
    isActive: boolean;
    component_name: string;
    template_name: string;
    data: FormField[];
    is_active: boolean;
    inner_component: number;
    component_image?: string;
    _id?: string;
    __v?: number;
}
export interface ComponentPreviewProps {
    component_name?: string; // Made optional
    formFields?: FormField[] | FormField; // Made optional and allowed for single FormField
}
export interface Props {
    onClose: () => void;
    onCreate: (component: Component) => void;
    initialComponent?: Component | null;
    setCreateComponentName?: React.Dispatch<React.SetStateAction<string>>;
    setCreatePreviewData?: React.Dispatch<React.SetStateAction<Component | null>>;
}