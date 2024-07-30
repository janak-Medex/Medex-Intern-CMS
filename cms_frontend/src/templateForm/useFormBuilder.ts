import { useState, useEffect, useCallback, RefObject } from 'react';
import { FormInstance, message } from 'antd';
import { FormType, FieldType } from './types';
import { createForm } from '../api/formComponent.api';
import { FormData as CustomFormData } from './types';
const useFormBuilder = (
    form: FormInstance,
    initialForm: FormType | null,
    templateName: string,
    onFormSaved: () => void,
    formBuilderRef: RefObject<HTMLDivElement>
) => {
    const [fields, setFields] = useState<FieldType[]>([]);
    const [expandedFields, setExpandedFields] = useState<{ [key: number]: boolean }>({});
    const [formBuilderScrollPosition, setFormBuilderScrollPosition] = useState(0);

    useEffect(() => {
        if (initialForm) {
            const initialFields = initialForm.fields.map((field) => ({
                ...field,
                required: !!field.required,
            }));
            setFields(initialFields);
            form.setFieldsValue({
                formName: initialForm.name,
                fields: initialFields,
            });
        } else {
            resetForm();
        }
    }, [initialForm, form]);

    const resetForm = useCallback(() => {
        setFields([]);
        setExpandedFields({});
        form.resetFields();
    }, [form]);

    const onFinish = async (values: any) => {
        try {
            const formData = new FormData();
            formData.append('_id', initialForm?._id || '');
            formData.append('name', values.formName);
            formData.append('template_name', templateName);

            const processedFields = fields.map((field) => {
                if (field.type === 'keyValuePair') {
                    return {
                        ...field,
                        required: !!field.required,
                        keyValuePairs: field.keyValuePairs?.map((pair) => {
                            if (pair.value instanceof File) {
                                formData.append(pair.key, pair.value, pair.value.name);
                                return { key: pair.key, value: pair.value.name };
                            }
                            return pair;
                        }),
                    };
                }
                return {
                    ...field,
                    required: !!field.required,
                };
            });

            formData.append('fields', JSON.stringify(processedFields));

            await createForm(formData as unknown as CustomFormData);

            message.success(
                initialForm ? "Form updated successfully" : "Form created successfully"
            );

            onFormSaved();
            resetForm();
        } catch (error) {
            console.error("Error saving form:", error);
            message.error("Failed to save form");
        }
    };

    const addField = useCallback(() => {
        const newField: FieldType = {
            type: "text",
            required: false,
            fieldName: "",
            placeholder: "",
            options: [],
        };
        setFields((prevFields) => [...prevFields, newField]);
        setExpandedFields((prev) => ({ ...prev, [fields.length]: true }));
    }, [fields.length]);

    const removeField = useCallback((index: number) => {
        setFields((prevFields) => prevFields.filter((_, i) => i !== index));
        setExpandedFields((prev) => {
            const newExpandedFields = { ...prev };
            delete newExpandedFields[index];
            return newExpandedFields;
        });
    }, []);

    const handleFieldChange = useCallback(
        (index: number, name: string, value: any) => {
            setFields((prevFields) => {
                const newFields = [...prevFields];
                if (newFields[index]) {
                    if (name === "type" && value === "boolean") {
                        newFields[index] = {
                            ...newFields[index],
                            type: value,
                            switch: true,
                        };
                    } else if (name === "required") {
                        newFields[index] = { ...newFields[index], required: value };
                    } else {
                        newFields[index] = { ...newFields[index], [name]: String(value) };
                    }
                }
                return newFields;
            });
        },
        []
    );

    const handleNestedOptionChange = useCallback(
        (fieldIndex: number, path: number[], value: string, isGroup: boolean) => {
            setFields((prevFields) => {
                const newFields = [...prevFields];
                let current: any = newFields[fieldIndex].options;
                for (let i = 0; i < path.length - 1; i++) {
                    current = current[path[i]].options;
                }
                if (isGroup) {
                    current[path[path.length - 1]].label = value;
                } else {
                    current[path[path.length - 1]] = value;
                }
                return newFields;
            });
        },
        []
    );

    const handleNestedOptionAdd = useCallback(
        (fieldIndex: number, path: number[]) => {
            setFields((prevFields) => {
                const newFields = [...prevFields];
                let current: any = newFields[fieldIndex].options;
                for (let i = 0; i < path.length; i++) {
                    if (i === path.length - 1) {
                        if (typeof current[path[i]] === "string") {
                            current[path[i]] = {
                                label: current[path[i]],
                                options: [""],
                            };
                        } else {
                            current[path[i]].options.push("");
                        }
                    } else {
                        current = current[path[i]].options;
                    }
                }
                return newFields;
            });
        },
        []
    );

    const handleNestedOptionRemove = useCallback(
        (fieldIndex: number, path: number[]) => {
            setFields((prevFields) => {
                const newFields = [...prevFields];
                let current: any = newFields[fieldIndex].options;
                for (let i = 0; i < path.length - 1; i++) {
                    current = current[path[i]].options;
                }
                current.splice(path[path.length - 1], 1);
                return newFields;
            });
        },
        []
    );

    const handleOptionAdd = useCallback((fieldIndex: number) => {
        setFields((prevFields) => {
            const newFields = [...prevFields];
            if (
                ["select", "Nested select", "radio", "checkbox"].includes(
                    newFields[fieldIndex].type
                )
            ) {
                if (!newFields[fieldIndex].options) {
                    newFields[fieldIndex].options = [];
                }
                newFields[fieldIndex].options?.push("");
            }
            return newFields;
        });
    }, []);

    const handleOptionChange = useCallback(
        (fieldIndex: number, optionIndex: number, value: string) => {
            setFields((prevFields) => {
                const newFields = [...prevFields];
                const field = newFields[fieldIndex];
                if (field && field.options) {
                    const option = field.options[optionIndex];
                    if (typeof option === "string") {
                        field.options[optionIndex] = value;
                    } else if (option && typeof option === "object") {
                        field.options[optionIndex] = {
                            ...option,
                            label: value,
                        };
                    }
                }
                return newFields;
            });
        },
        []
    );

    const handleOptionRemove = useCallback(
        (fieldIndex: number, optionIndex: number) => {
            setFields((prevFields) => {
                const newFields = [...prevFields];
                const field = newFields[fieldIndex];
                if (field && field.options) {
                    field.options.splice(optionIndex, 1);
                }
                return newFields;
            });
        },
        []
    );

    const handleDragStart = useCallback(
        (e: React.DragEvent<HTMLDivElement>, _item: FieldType, index: number) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", index.toString());
            const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
            dragImage.style.position = "absolute";
            dragImage.style.top = "-1000px";
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 20, 20);
            setTimeout(() => document.body.removeChild(dragImage), 0);
        },
        []
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
            e.preventDefault();
            const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
            if (draggedIndex === targetIndex) return;

            setFields((prevFields) => {
                const newFields = prevFields.filter(Boolean);
                const [draggedField] = newFields.splice(draggedIndex, 1);
                newFields.splice(targetIndex, 0, draggedField);
                return newFields;
            });
        },
        []
    );

    const toggleFieldExpansion = useCallback((index: number) => {
        setExpandedFields((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    }, []);

    const handleScroll = useCallback(() => {
        if (formBuilderRef.current) {
            setFormBuilderScrollPosition(formBuilderRef.current.scrollTop);
        }
    }, [formBuilderRef]);

    const handleKeyValuePairAdd = useCallback((fieldIndex: number) => {
        setFields((prevFields) => {
            const newFields = [...prevFields];
            if (newFields[fieldIndex].type === 'keyValuePair') {
                if (!newFields[fieldIndex].keyValuePairs) {
                    newFields[fieldIndex].keyValuePairs = [];
                }
                newFields[fieldIndex].keyValuePairs?.push({ key: '', value: '' });
            }
            return newFields;
        });
    }, []);

    const handleKeyValuePairChange = useCallback(
        (fieldIndex: number,
            pairIndex: number,
            key: "key" | "value",
            value: string | File | File[]) => {
            setFields((prevFields) => {
                const newFields = [...prevFields];
                const field = newFields[fieldIndex];
                if (field && field.keyValuePairs) {
                    field.keyValuePairs[pairIndex] = {
                        ...field.keyValuePairs[pairIndex],
                        [key]: value,
                    };
                }
                return newFields;
            });
        },
        []
    );

    const handleKeyValuePairRemove = useCallback(
        (fieldIndex: number, pairIndex: number) => {
            setFields((prevFields) => {
                const newFields = [...prevFields];
                const field = newFields[fieldIndex];
                if (field && field.keyValuePairs) {
                    field.keyValuePairs.splice(pairIndex, 1);
                }
                return newFields;
            });
        },
        []
    );

    return {
        fields,
        expandedFields,
        formBuilderScrollPosition,
        addField,
        removeField,
        handleFieldChange,
        handleNestedOptionChange,
        handleNestedOptionAdd,
        handleNestedOptionRemove,
        handleOptionAdd,
        handleOptionChange,
        handleOptionRemove,
        handleDragStart,
        handleDrop,
        toggleFieldExpansion,
        onFinish,
        handleScroll,
        handleKeyValuePairAdd,
        handleKeyValuePairChange,
        handleKeyValuePairRemove,
    };
};

export default useFormBuilder;