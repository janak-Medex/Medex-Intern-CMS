import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Switch,
  message,
  Radio,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  SaveOutlined,
  DragOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { BiChevronDown, BiChevronRight } from "react-icons/bi";
import FormPreview from "./FormPreview";
import { FormType, FieldType, NestedOption } from "./types";
import { createForm } from "../api/formComponent.api";
import "./scrollbar.css";

const { Option } = Select;

const FormBuilder: React.FC<{
  templateName: string;
  initialForm: FormType | null;
  onFormSaved: () => void;
}> = ({ templateName, initialForm, onFormSaved }) => {
  const [form] = Form.useForm();
  const [fields, setFields] = useState<FieldType[]>([]);
  const [expandedFields, setExpandedFields] = useState<{
    [key: number]: boolean;
  }>({});
  const [formBuilderScrollPosition, setFormBuilderScrollPosition] = useState(0);
  const formBuilderRef = useRef<HTMLDivElement>(null);
  const formPreviewRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleResize = () => {
      if (formBuilderRef.current && formPreviewRef.current) {
        const windowHeight = window.innerHeight;
        const headerHeight = 64;
        const contentHeight = windowHeight - headerHeight - 32;
        formBuilderRef.current.style.height = `${contentHeight}px`;
        formPreviewRef.current.style.height = `${contentHeight}px`;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setFormBuilderScrollPosition(formBuilderRef.current.scrollTop);
  }, [formBuilderScrollPosition]);

  const resetForm = useCallback(() => {
    setFields([]);
    setExpandedFields({});
    form.resetFields();
  }, [form]);

  const onFinish = async (values: any) => {
    try {
      const formData = {
        _id: initialForm?._id,
        name: values.formName,
        fields: fields.map((field) => ({
          ...field,
          required: !!field.required,
        })),
        template_name: templateName,
      };

      await createForm(formData);

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
    setTimeout(() => {
      if (formBuilderRef.current) {
        formBuilderRef.current.scrollTop = formBuilderRef.current.scrollHeight;
      }
    }, 100);
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

  const NestedOption: React.FC<{
    option: string | NestedOption;
    path: number[];
    onAdd: (path: number[]) => void;
    onRemove: (path: number[]) => void;
    onChange: (path: number[], value: string, isGroup: boolean) => void;
    depth?: number;
  }> = React.memo(({ option, path, onAdd, onRemove, onChange, depth = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const handleToggle = () => setIsExpanded(!isExpanded);
    const isGroup = typeof option !== "string";

    return (
      <div className={`mb-2 ${depth > 0 ? "ml-6" : ""}`}>
        <div className="flex items-center space-x-2">
          {isGroup && (
            <Button
              type="text"
              size="small"
              icon={isExpanded ? <BiChevronDown /> : <BiChevronRight />}
              onClick={handleToggle}
            />
          )}
          <Input
            value={isGroup ? option.label : option}
            onChange={(e) => onChange(path, e.target.value, isGroup)}
            placeholder={`${isGroup ? "Group" : "Option"} ${path.join(".")}`}
            className={isGroup ? "font-semibold" : ""}
          />
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => onAdd(path)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<MinusCircleOutlined />}
            onClick={() => onRemove(path)}
          />
        </div>
        {isGroup && isExpanded && (
          <div className="mt-2 border-l-2 border-gray-200 pl-4">
            {option.options.map((subOption, index) => (
              <NestedOption
                key={index}
                option={subOption}
                path={[...path, index]}
                onAdd={onAdd}
                onRemove={onRemove}
                onChange={onChange}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  });

  const renderNestedOptions = useCallback(
    (options: (string | NestedOption)[], fieldIndex: number) => {
      return options.map((option, index) => (
        <NestedOption
          key={index}
          option={option}
          path={[index]}
          onAdd={(path) => handleNestedOptionAdd(fieldIndex, path)}
          onRemove={(path) => handleNestedOptionRemove(fieldIndex, path)}
          onChange={(path, value, isGroup) =>
            handleNestedOptionChange(fieldIndex, path, value, isGroup)
          }
        />
      ));
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
        if (newFields[fieldIndex].options) {
          const option = newFields[fieldIndex].options[optionIndex];
          if (typeof option === "string") {
            newFields[fieldIndex].options[optionIndex] = value;
          } else {
            newFields[fieldIndex].options[optionIndex] = {
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
        if (newFields[fieldIndex].options) {
          newFields[fieldIndex].options.splice(optionIndex, 1);
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
  }, []);

  const renderOptions = useCallback(
    (field: FieldType, index: number) => {
      if (["select", "radio", "checkbox"].includes(field.type)) {
        return (
          <Form.Item label={<span className="font-semibold">Options</span>}>
            <div className="border p-4 rounded-lg bg-gray-50">
              {field.options?.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className="flex items-center space-x-2 mb-2"
                >
                  {field.type === "radio" && <Radio disabled />}
                  {field.type === "checkbox" && <Checkbox disabled />}
                  <Input
                    value={typeof option === "string" ? option : option.label}
                    onChange={(e) =>
                      handleOptionChange(index, optionIndex, e.target.value)
                    }
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => handleOptionRemove(index, optionIndex)}
                  />
                </div>
              ))}
              <Button
                type="dashed"
                onClick={() => handleOptionAdd(index)}
                className="w-full mt-2"
                icon={<PlusOutlined />}
              >
                Add Option
              </Button>
            </div>
          </Form.Item>
        );
      }
      return null;
    },
    [handleOptionAdd, handleOptionChange, handleOptionRemove]
  );

  return (
    <div className="flex gap-6">
      <div className="w-1/2">
        <div
          ref={formBuilderRef}
          className="max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar"
          onScroll={handleScroll}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-2xl font-bold mb-6">Form Builder</h3>
            <Form
              form={form}
              onFinish={onFinish}
              layout="vertical"
              className="space-y-4"
            >
              <Form.Item
                name="formName"
                label={<span className="font-semibold">Form Name</span>}
                rules={[
                  { required: true, message: "Please input the form name!" },
                ]}
              >
                <Input className="w-full" placeholder="Enter form name" />
              </Form.Item>

              <div className="border-t border-gray-200 my-4"></div>

              {fields.map((field, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => handleDragStart(e, field, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, index)}
                  className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200 cursor-move"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <DragOutlined className="text-gray-400" />
                      <span className="font-medium text-lg">
                        {field.fieldName || `Field ${index + 1}`}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="text"
                        size="small"
                        onClick={() => toggleFieldExpansion(index)}
                        icon={
                          expandedFields[index] ? (
                            <UpOutlined />
                          ) : (
                            <DownOutlined />
                          )
                        }
                      />
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => removeField(index)}
                      />
                    </div>
                  </div>
                  {expandedFields[index] && (
                    <div className="mt-4 space-y-4">
                      <Form.Item
                        label={
                          <span className="font-semibold">Field Name</span>
                        }
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Input
                          value={field.fieldName}
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              "fieldName",
                              e.target.value
                            )
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        label={<span className="font-semibold">Type</span>}
                      >
                        <Select
                          value={field.type}
                          onChange={(value) =>
                            handleFieldChange(index, "type", value)
                          }
                        >
                          <Option value="text">Text</Option>
                          <Option value="textarea">Textarea</Option>
                          <Option value="number">Number</Option>
                          <Option value="select">Select</Option>
                          <Option value="Nested select">Nested select</Option>
                          <Option value="radio">Radio</Option>
                          <Option value="checkbox">Checkbox</Option>
                          <Option value="switch">Switch</Option>
                          <Option value="boolean">Boolean</Option>
                          <Option value="date">Date</Option>
                          <Option value="file">File</Option>
                          <Option value="other">Other</Option>
                        </Select>
                      </Form.Item>
                      {field.type === "Nested select" && (
                        <Form.Item
                          label={
                            <span className="font-semibold">
                              Nested Options
                            </span>
                          }
                        >
                          <div className="border p-4 rounded-lg bg-gray-50">
                            {renderNestedOptions(field.options || [], index)}
                            <Button
                              type="dashed"
                              onClick={() => handleOptionAdd(index)}
                              className="w-full mt-4"
                              icon={<PlusOutlined />}
                            >
                              Add Option
                            </Button>
                          </div>
                        </Form.Item>
                      )}
                      {renderOptions(field, index)}
                      <Form.Item
                        label={
                          <span className="font-semibold">Placeholder</span>
                        }
                      >
                        <Input
                          value={field.placeholder}
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              "placeholder",
                              e.target.value
                            )
                          }
                        />
                      </Form.Item>
                      <Form.Item
                        label={<span className="font-semibold">Required</span>}
                      >
                        <Switch
                          checked={field.required}
                          onChange={(checked) =>
                            handleFieldChange(index, "required", checked)
                          }
                        />
                      </Form.Item>
                    </div>
                  )}
                </div>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={addField}
                  className="w-full"
                  icon={<PlusOutlined />}
                >
                  Add Field
                </Button>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full"
                  icon={<SaveOutlined />}
                >
                  Save Form
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
      <div className="w-1/2">
        <div
          ref={formPreviewRef}
          className="max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar"
        >
          <div className="bg-white rounded-lg shadow-lg p-6">
            <FormPreview
              fields={fields}
              templateName={templateName}
              formName={form.getFieldValue("formName") || ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
