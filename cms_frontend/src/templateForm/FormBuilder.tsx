import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Switch,
  Collapse,
  message,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import axiosInstance from "../http/axiosInstance";
import FormPreview from "./FormPreview";
import { FormType, FieldType } from "./types";

const { Option } = Select;
const { Panel } = Collapse;

const StyledButton = styled(Button)`
  transition: all 0.3s;
  &:hover {
    transform: scale(1.05);
  }
`;

const ScrollableDiv = styled.div`
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding-right: 16px;
  margin-right: -16px;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 3px;
  }
`;

interface FormBuilderProps {
  templateName: string;

  initialForm: FormType | null;
  onFormSaved: () => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  templateName,
  initialForm,
  onFormSaved,
}) => {
  const [form] = Form.useForm();
  const [fields, setFields] = useState<FieldType[]>([]);
  const formBuilderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialForm) {
      setFields(initialForm.fields);
      form.setFieldsValue({
        formName: initialForm.name,
        fields: initialForm.fields,
      });
    } else {
      resetForm();
    }
  }, [initialForm]);

  const onFinish = async (values: any) => {
    try {
      await axiosInstance.post("/form", {
        _id: initialForm?._id,
        name: values.formName,
        fields: values.fields,
        template_name: templateName,
      });
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

  const resetForm = () => {
    form.resetFields();
    setFields([]);
  };

  const addField = () => {
    const newFields = [
      ...fields,
      {
        type: "text",
        required: false,
        fieldName: "",
        placeholder: "",
        options: [],
      },
    ];
    setFields(newFields);
    form.setFieldsValue({ fields: newFields });
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
  };

  const handleFieldChange = (index: number, name: string, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [name]: value };
    setFields(newFields);
    form.setFieldsValue({ fields: newFields });
  };

  const handleOptionAdd = (fieldIndex: number) => {
    const newFields = [...fields];
    if (!newFields[fieldIndex].options) {
      newFields[fieldIndex].options = [];
    }
    newFields[fieldIndex].options.push("");
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
    newFields[fieldIndex].options[optionIndex] = value;
    setFields(newFields);
    form.setFieldsValue({ fields: newFields });
  };

  return (
    <div className="flex gap-6">
      <div className="w-1/2">
        <ScrollableDiv ref={formBuilderRef}>
          <Card title="Form Builder" className="shadow-lg mb-6">
            <Form
              form={form}
              onFinish={onFinish}
              layout="vertical"
              className="space-y-6"
            >
              <Form.Item
                name="formName"
                label="Form Name"
                rules={[
                  { required: true, message: "Please input the form name!" },
                ]}
              >
                <Input className="w-full" placeholder="Enter form name" />
              </Form.Item>

              <Collapse defaultActiveKey={["1"]} className="mb-6">
                <Panel header="Form Fields" key="1">
                  <Form.List name="fields">
                    {(fields, { add, remove }) => (
                      <AnimatePresence>
                        {fields.map((field, index) => (
                          <motion.div
                            key={field.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="mb-4 shadow-sm">
                              <Form.Item
                                {...field}
                                name={[field.name, "fieldName"]}
                                label="Field Name"
                                rules={[
                                  { required: true, message: "Required" },
                                ]}
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
                                {...field}
                                name={[field.name, "type"]}
                                label="Field Type"
                                rules={[
                                  { required: true, message: "Required" },
                                ]}
                              >
                                <Select
                                  onChange={(value) =>
                                    handleFieldChange(index, "type", value)
                                  }
                                >
                                  <Option value="text">Text</Option>
                                  <Option value="number">Number</Option>
                                  <Option value="boolean">Boolean</Option>
                                  <Option value="select">Select</Option>
                                  <Option value="checkbox">Checkbox</Option>
                                  <Option value="radio">Radio</Option>
                                  <Option value="switch">Switch</Option>
                                  <Option value="date">Date</Option>
                                </Select>
                              </Form.Item>
                              <Form.Item
                                {...field}
                                name={[field.name, "placeholder"]}
                                label="Placeholder"
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
                                {...field}
                                name={[field.name, "required"]}
                                label="Required"
                                valuePropName="checked"
                              >
                                <Switch
                                  onChange={(checked) =>
                                    handleFieldChange(
                                      index,
                                      "required",
                                      checked
                                    )
                                  }
                                />
                              </Form.Item>

                              {["select", "checkbox", "radio"].includes(
                                form.getFieldValue(["fields", index, "type"])
                              ) && (
                                <Form.List name={[field.name, "options"]}>
                                  {(
                                    options,
                                    { add: addOption, remove: removeOption }
                                  ) => (
                                    <>
                                      {options.map((option, optionIndex) => (
                                        <Form.Item
                                          key={option.key}
                                          label={
                                            optionIndex === 0 ? "Options" : ""
                                          }
                                          required={false}
                                        >
                                          <Input
                                            placeholder={`Option ${
                                              optionIndex + 1
                                            }`}
                                            style={{
                                              width: "calc(100% - 32px)",
                                            }}
                                            onChange={(e) =>
                                              handleOptionChange(
                                                index,
                                                optionIndex,
                                                e.target.value
                                              )
                                            }
                                          />
                                          <MinusCircleOutlined
                                            className="dynamic-delete-button ml-2"
                                            onClick={() => {
                                              removeOption(optionIndex);
                                              handleOptionRemove(
                                                index,
                                                optionIndex
                                              );
                                            }}
                                          />
                                        </Form.Item>
                                      ))}
                                      <Form.Item>
                                        <Button
                                          type="dashed"
                                          onClick={() => {
                                            addOption();
                                            handleOptionAdd(index);
                                          }}
                                          icon={<PlusOutlined />}
                                          block
                                        >
                                          Add Option
                                        </Button>
                                      </Form.Item>
                                    </>
                                  )}
                                </Form.List>
                              )}

                              <StyledButton
                                type="text"
                                danger
                                onClick={() => {
                                  remove(field.name);
                                  removeField(index);
                                }}
                                icon={<MinusCircleOutlined />}
                              >
                                Remove Field
                              </StyledButton>
                            </Card>
                          </motion.div>
                        ))}
                        <Form.Item>
                          <StyledButton
                            type="dashed"
                            onClick={() => {
                              add();
                              addField();
                            }}
                            block
                            icon={<PlusOutlined />}
                          >
                            Add Field
                          </StyledButton>
                        </Form.Item>
                      </AnimatePresence>
                    )}
                  </Form.List>
                </Panel>
              </Collapse>

              <Form.Item>
                <StyledButton
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  size="large"
                  block
                >
                  {initialForm ? "Update Form" : "Create Form"}
                </StyledButton>
              </Form.Item>
            </Form>
          </Card>
        </ScrollableDiv>
      </div>
      <div className="w-1/2">
        <Card title="Form Preview" className="shadow-lg sticky top-0">
          <FormPreview
            fields={form.getFieldValue("fields") || []}
            templateName={templateName}
            formName={initialForm ? initialForm.name : ""}
          />
        </Card>
      </div>
    </div>
  );
};

export default FormBuilder;
