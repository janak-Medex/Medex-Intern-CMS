import React, { useState, useEffect, useRef } from "react";
import { Form, Input, Select, Button, Switch, message } from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  SaveOutlined,
  DragOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import FormPreview from "./FormPreview";
import { FormType, FieldType } from "./types";
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
  const [_draggedItem, setDraggedItem] = useState<FieldType | null>(null);
  const formBuilderRef = useRef<HTMLDivElement>(null);
  const formPreviewRef = useRef<HTMLDivElement>(null);
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
  }, [initialForm]);

  useEffect(() => {
    const handleResize = () => {
      if (formBuilderRef.current && formPreviewRef.current) {
        const windowHeight = window.innerHeight;
        const headerHeight = 64; // Adjust this value based on your actual header height
        const contentHeight = windowHeight - headerHeight - 32; // 32px for padding
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
    if (formBuilderRef.current) {
      formBuilderRef.current.scrollTop = formBuilderScrollPosition;
    }
  }, [fields]);

  const resetForm = () => {
    setFields([]);
    setExpandedFields({});
    form.resetFields();
  };

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

      console.log("FormData to be sent:", formData);

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

  const addField = () => {
    const newField: FieldType = {
      type: "text",
      required: false,
      fieldName: "",
      placeholder: "",
      options: [],
    };
    const newFields = [...fields, newField];
    setFields(newFields);
    form.setFieldsValue({ fields: newFields });
    setExpandedFields({ ...expandedFields, [newFields.length - 1]: true });
    setTimeout(() => {
      if (formBuilderRef.current) {
        formBuilderRef.current.scrollTop = formBuilderRef.current.scrollHeight;
      }
    }, 100);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
    form.setFieldsValue({ fields: newFields });
    const newExpandedFields = { ...expandedFields };
    delete newExpandedFields[index];
    setExpandedFields(newExpandedFields);
  };

  const handleFieldChange = (index: number, name: string, value: any) => {
    const newFields = [...fields];
    if (newFields[index]) {
      if (name === "type" && value === "boolean") {
        newFields[index] = { ...newFields[index], type: value, switch: true };
      } else if (name === "required") {
        newFields[index] = { ...newFields[index], required: value };
      } else {
        newFields[index] = { ...newFields[index], [name]: value };
      }
      setFields(newFields);
      form.setFieldsValue({ fields: newFields });
    }
  };

  const handleOptionAdd = (fieldIndex: number) => {
    const newFields = [...fields];
    if (
      newFields[fieldIndex].type === "checkbox" &&
      !newFields[fieldIndex].options
    ) {
      newFields[fieldIndex].options = [];
    }
    newFields[fieldIndex].options?.push("");
    setFields(newFields);
    form.setFieldsValue({ fields: newFields });
  };

  const handleOptionRemove = (fieldIndex: number, optionIndex: number) => {
    const newFields = [...fields];
    newFields[fieldIndex].options?.splice(optionIndex, 1);
    setFields(newFields);
    form.setFieldsValue({ fields: newFields });
  };

  const handleOptionChange = (
    fieldIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newFields = [...fields];
    if (!newFields[fieldIndex].options) {
      newFields[fieldIndex].options = [];
    }
    const options = newFields[fieldIndex].options;
    if (Array.isArray(options)) {
      options[optionIndex] = value;
      setFields(newFields);
      form.setFieldsValue({ fields: newFields });
    }
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    item: FieldType,
    index: number
  ) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 20, 20);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetIndex: number
  ) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (draggedIndex === targetIndex) return;

    const newFields = fields.filter(Boolean);
    const [draggedField] = newFields.splice(draggedIndex, 1);
    newFields.splice(targetIndex, 0, draggedField);

    setFields(newFields);
    form.setFieldsValue({ fields: newFields });
    setDraggedItem(null);
  };

  const toggleFieldExpansion = (index: number) => {
    setExpandedFields({
      ...expandedFields,
      [index]: !expandedFields[index],
    });
  };

  const handleScroll = () => {
    if (formBuilderRef.current) {
      setFormBuilderScrollPosition(formBuilderRef.current.scrollTop);
    }
  };

  return (
    <div className="flex gap-6">
      <div className="w-1/2 ">
        <div
          ref={formBuilderRef}
          className="max-h-[70vh] overflow-y-auto pr-4  custom-scrollbar"
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

              {fields.map(
                (field, index) =>
                  field && (
                    <div
                      key={index}
                      draggable
                      onDragStart={(e) => handleDragStart(e, field, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200 cursor-move"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DragOutlined className="text-gray-400" />
                          <span className="font-medium">
                            {field.fieldName || `Field ${index + 1}`}
                            {field.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
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
                        <div className="mt-2">
                          <Form.Item
                            name={["fields", index, "fieldName"]}
                            label={
                              <span className="font-semibold">Field Name</span>
                            }
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <Input
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
                            name={["fields", index, "type"]}
                            label={<span className="font-semibold">Type</span>}
                          >
                            <Select
                              onChange={(value) =>
                                handleFieldChange(index, "type", value)
                              }
                            >
                              <Option value="text">Text</Option>
                              <Option value="textarea">Textarea</Option>
                              <Option value="number">Number</Option>
                              <Option value="select">Select</Option>
                              <Option value="radio">Radio</Option>
                              <Option value="checkbox">Checkbox</Option>
                              <Option value="switch">Switch</Option>
                              <Option value="boolean">Boolean</Option>
                              <Option value="date">Date</Option>
                              <Option value="other">Other</Option>
                            </Select>
                          </Form.Item>
                          {(field.type === "select" ||
                            field.type === "radio" ||
                            field.type === "checkbox") && (
                            <Form.Item
                              label={
                                <span className="font-semibold">Options</span>
                              }
                            >
                              {field.options?.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className="flex items-center space-x-2 mb-2"
                                >
                                  <Input
                                    value={option}
                                    onChange={(e) =>
                                      handleOptionChange(
                                        index,
                                        optionIndex,
                                        e.target.value
                                      )
                                    }
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  <Button
                                    type="text"
                                    danger
                                    icon={<MinusCircleOutlined />}
                                    onClick={() =>
                                      handleOptionRemove(index, optionIndex)
                                    }
                                  />
                                </div>
                              ))}
                              <Button
                                type="dashed"
                                onClick={() => handleOptionAdd(index)}
                                className="w-full"
                                icon={<PlusOutlined />}
                              >
                                Add Option
                              </Button>
                            </Form.Item>
                          )}
                          <Form.Item
                            name={["fields", index, "placeholder"]}
                            label={
                              <span className="font-semibold">Placeholder</span>
                            }
                          >
                            <Input
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
                            label={
                              <span className="font-semibold">Required</span>
                            }
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
                  )
              )}

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
      <div className="max-h-[70vh] overflow-y-auto pr-4  custom-scrollbar w-1/2">
        <div
          ref={formPreviewRef}
          className=" bg-white rounded-lg shadow-lg "
          onScroll={handleScroll} // Add this line if you want to handle scroll event
        >
          <FormPreview
            fields={fields}
            templateName={templateName}
            formName={form.getFieldValue("formName") || ""}
          />
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
