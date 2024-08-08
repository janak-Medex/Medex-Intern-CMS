import { useState, useEffect, useCallback, RefObject } from 'react';
import { FormInstance, message } from 'antd';
import { FormType, FieldType, NestedOptionType, CustomFormData } from './types';
import { createForm } from '../api/formComponent.api';
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


    const processFields = (fields: FieldType[] | undefined, formData: CustomFormData, parentPath: string = ''): FieldType[] => {
        if (!fields || !Array.isArray(fields)) {
            console.warn('Fields is undefined or not an array');
            return [];
        }

        const processField = (field: FieldType, currentPath: string): FieldType => {
            const processedField: FieldType = { ...field };

            const processValue = (value: any, valuePath: string): any => {
                if (value instanceof File) {
                    formData.append(valuePath, value, value.name);
                    return value.name;
                } else if (Array.isArray(value)) {
                    return value.map((item, itemIndex) => processValue(item, `${valuePath}.${itemIndex}`));
                } else if (typeof value === 'object' && value !== null) {
                    return processField(value, valuePath);
                }
                return value;
            };

            // Spread keyValuePairs into the main object while keeping the original
            if (processedField.keyValuePairs && typeof processedField.keyValuePairs === 'object') {
                Object.assign(processedField, processedField.keyValuePairs);
            }

            for (const key in processedField) {
                if (Object.prototype.hasOwnProperty.call(processedField, key)) {
                    (processedField as any)[key] = processValue((processedField as any)[key], `${currentPath}.${key}`);
                }
            }

            return processedField;
        };

        return fields.map((field, index) => {
            const currentPath = parentPath ? `${parentPath}.${index}` : `${index}`;
            return processField(field, currentPath);
        });
    };

    const onFinish = async (values: { formName: string }) => {
        try {
            const formData = new FormData() as CustomFormData;
            formData.append('_id', initialForm?._id || '');
            formData.append('name', values.formName);
            formData.append('template_name', templateName);

            // Process fields and append to FormData
            const processedFields = processFields(fields, formData);

            formData.append('fields', JSON.stringify(processedFields));

            await createForm(formData);

            message.success(
                initialForm ? "Form updated successfully" : "Form created successfully"
            );
            onFormSaved();
            resetForm();
        } catch (error) {
            console.error("Error saving form:", error);
            if (error instanceof Error) {
                message.error(error.message || "Failed to save form");
            } else {
                message.error("An unknown error occurred");
            }
        }
    };



    const addField = useCallback(() => {
        const newField: FieldType = {
            type: "text",
            required: false,
            fieldName: "",
            placeholder: "",
            options: [],
            keyValuePairs: [],
        };
        setFields((prevFields) => {
            const newFields = [...prevFields, newField];
            setExpandedFields((prev) => ({ ...prev, [newFields.length - 1]: true }));
            return newFields;
        });
    }, []);


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
    const updateNestedOptions = useCallback((
        fieldIndex: number,
        path: number[],
        updateFn: (option: NestedOptionType) => NestedOptionType
    ) => {
        setFields((prevFields) => {
            const newFields = [...prevFields];
            let current: any = newFields[fieldIndex].options || [];
            for (let i = 0; i < path.length - 1; i++) {
                current = current[path[i]]?.options || [];
            }
            const lastIndex = path[path.length - 1];
            current[lastIndex] = updateFn(current[lastIndex] || {});
            return newFields;
        });
    }, []);

    const handleNestedOptionAdd = useCallback(
        (fieldIndex: number, path: number[]) => {
            setFields((prevFields) => {
                const newFields = [...prevFields];
                const field = newFields[fieldIndex];

                if (field.type === "Nested select") {
                    if (!field.options) {
                        field.options = [];
                    }

                    let current: any = field.options;
                    for (let i = 0; i < path.length; i++) {
                        if (!current[path[i]]) {
                            current[path[i]] = { options: [] };
                        }
                        current = current[path[i]].options;
                    }

                    current?.push({
                        label: "",
                        isPackage: false,
                        options: [],
                        keyValuePairs: {},
                    });
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
    const handleNestedOptionChange = useCallback(
        (fieldIndex: number, path: number[], value: string | File | File[]) => {
            updateNestedOptions(fieldIndex, path, (option) => ({
                ...option,
                label: typeof value === 'string'
                    ? value
                    : Array.isArray(value)
                        ? value.map(file => file?.name || 'Unnamed file').join(', ')
                        : value?.name || 'Unnamed file'
            }));
        },
        [updateNestedOptions]
    );
    const handleNestedOptionPackageToggle = useCallback(
        (fieldIndex: number, path: number[], isPackage: boolean) => {
            updateNestedOptions(fieldIndex, path, (option) => ({
                ...option,
                isPackage,
                keyValuePairs: isPackage ? (option.keyValuePairs || {}) : undefined
            }));
        },
        [updateNestedOptions]
    );
    const handleNestedOptionKeyValuePairAdd = useCallback(
        (fieldIndex: number, path: number[]) => {
            updateNestedOptions(fieldIndex, path, (option) => ({
                ...option,
                keyValuePairs: { ...option.keyValuePairs, "": "" }
            }));
        },
        [updateNestedOptions]
    );

    const handleNestedOptionKeyValuePairChange = useCallback(
        (fieldIndex: number, path: number[], pairIndex: number, key: "key" | "value", value: string | File | File[]) => {
            updateNestedOptions(fieldIndex, path, (option) => {
                const keyValuePairs = { ...option.keyValuePairs };
                const keys = Object.keys(keyValuePairs);

                if (key === "key") {
                    const oldValue = keyValuePairs[keys[pairIndex]];
                    delete keyValuePairs[keys[pairIndex]];
                    keyValuePairs[value as string] = oldValue;
                } else {
                    keyValuePairs[keys[pairIndex]] = value;
                }

                return { ...option, keyValuePairs };
            });
        },
        [updateNestedOptions]
    );

    const handleNestedOptionKeyValuePairRemove = useCallback(
        (fieldIndex: number, path: number[], pairIndex: number) => {
            updateNestedOptions(fieldIndex, path, (option) => {
                const newKeyValuePairs = { ...option.keyValuePairs };
                const entries = Object.entries(newKeyValuePairs);

                if (entries.length > pairIndex) {
                    const [keyToRemove] = entries[pairIndex];
                    delete newKeyValuePairs[keyToRemove];
                }

                return { ...option, keyValuePairs: newKeyValuePairs };
            });
        },
        [updateNestedOptions]
    );




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

    const handleOptionAdd = useCallback((fieldIndex: number) => {
        setFields((prevFields) => {
            const newFields = [...prevFields];
            const field = newFields[fieldIndex];

            if (["select", "radio", "checkbox"].includes(field.type)) {
                if (!field.options) {
                    field.options = [];
                }
                field.options.push("");
            } else if (field.type === "Nested select") {
                if (!field.options) {
                    field.options = [];
                }
                const newNestedOption: NestedOptionType = {
                    label: "",
                    isPackage: false,
                    options: []
                };
                field.options.push(newNestedOption);
            }

            return newFields;
        });
    }, []);

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
        (fieldIndex: number, pairIndex: number, key: "key" | "value", value: string | File | File[]) => {
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
                    field.keyValuePairs = field.keyValuePairs.filter((_, index) => index !== pairIndex);
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
        updateNestedOptions,
        handleNestedOptionRemove,
        handleOptionAdd,
        handleNestedOptionPackageToggle,
        handleNestedOptionKeyValuePairAdd,
        handleOptionChange,
        handleNestedOptionKeyValuePairRemove,
        handleNestedOptionKeyValuePairChange,
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