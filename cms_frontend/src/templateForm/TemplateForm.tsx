// TemplateForm.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Card,
  Switch,
  Tabs,
  Popconfirm,
  Spin,
  Tooltip,
  Radio,
  Checkbox,
  Collapse,
  Typography,
  Space,
  Tag,
  Empty,
  Avatar,
  Drawer,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  EditOutlined,
  SaveOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import axiosInstance from "../http/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

interface FieldType {
  type: string;
  required: boolean;
  fieldName: string;
  placeholder: string;
  options: string[];
}

interface FormType {
  _id: string;
  name: string;
  fields: FieldType[];
}

interface TemplateFormProps {
  templateName: string;
  visible: boolean;
  onClose: () => void;
  onFormCreated: () => void;
  onFormDeleted: () => void;
}

const StyledCard = styled(Card)`
  transition: all 0.3s;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

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

const TemplateForm: React.FC<TemplateFormProps> = ({
  templateName,
  visible,
  onClose,
  onFormCreated,
  onFormDeleted,
}) => {
  const [form] = Form.useForm();
  const [fields, setFields] = useState<FieldType[]>([]);
  const [forms, setForms] = useState<FormType[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const formBuilderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      fetchForms();
    }
  }, [visible, templateName]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/form/${templateName}`);
      setForms(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.error("Error fetching forms:", error);
      toast.error("Failed to fetch forms");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await axiosInstance.post("/form", {
        _id: selectedForm?._id,
        name: values.formName,
        fields: values.fields,
        template_name: templateName,
      });
      toast.success(
        isEditing ? "Form updated successfully" : "Form created successfully"
      );
      onFormCreated();
      fetchForms();
      resetForm();
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Failed to save form");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    form.resetFields();
    setFields([]);
    setSelectedForm(null);
    setIsEditing(false);
    setActiveTab("1");
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
    newFields[fieldIndex].options.splice(optionIndex, 1);
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

  const selectForm = (formToEdit: FormType) => {
    setSelectedForm(formToEdit);
    setFields(
      formToEdit.fields.map((field) => ({
        ...field,
        options: field.options || [],
      }))
    );
    setIsEditing(true);
    setFormValues(formToEdit);
    setActiveTab("2");
  };

  const setFormValues = (formToEdit: FormType) => {
    form.setFieldsValue({
      formName: formToEdit.name,
      fields: formToEdit.fields.map((field) => ({
        ...field,
        options: field.options || [],
      })),
    });
  };
  const deleteForm = async (formName: string) => {
    setLoading(true);
    try {
      const fullFormName = formName.startsWith("Form_")
        ? formName
        : `Form_${formName}`;
      console.log(fullFormName);
      await axiosInstance.delete(`/form/${templateName}/${fullFormName}`);
      toast.success("Form deleted successfully");
      onFormDeleted(); // Call the callback function
    } catch (error) {
      console.error("Error deleting form:", error);
      toast.error("Failed to delete form");
    } finally {
      setLoading(false);
    }
  };

  const renderFormsList = () => (
    <ScrollableDiv>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {forms.length > 0 ? (
          forms.map((item) => (
            <StyledCard
              key={item._id}
              hoverable
              className="shadow-sm"
              bodyStyle={{ padding: "12px" }}
              actions={[
                <Tooltip title="Edit">
                  <EditOutlined key="edit" onClick={() => selectForm(item)} />
                </Tooltip>,
                <Tooltip title="Preview">
                  <EyeOutlined
                    key="preview"
                    onClick={() => {
                      setSelectedForm(item);
                      setPreviewVisible(true);
                    }}
                  />
                </Tooltip>,
                <Tooltip title="Duplicate">
                  <CopyOutlined
                    key="copy"
                    onClick={() => {
                      const newForm = {
                        ...item,
                        _id: "",
                        name: `${item.name} (Copy)`,
                      };
                      selectForm(newForm);
                    }}
                  />
                </Tooltip>,
                <Popconfirm
                  title="Delete this form?"
                  onConfirm={() => deleteForm(item.name)}
                  okText="Yes"
                  cancelText="No"
                >
                  <DeleteOutlined key="delete" />
                </Popconfirm>,
              ]}
            >
              <div className="flex items-center mb-2">
                <Avatar
                  style={{ backgroundColor: "#1890ff", marginRight: "8px" }}
                >
                  {item.name[0].toUpperCase()}
                </Avatar>
                <Typography.Text strong className="text-sm truncate flex-1">
                  {item.name}
                </Typography.Text>
              </div>
              <div className="flex justify-between items-center">
                <Typography.Text type="secondary" className="text-xs">
                  Fields: {item.fields.length}
                </Typography.Text>
                <div className="flex flex-wrap justify-end">
                  {item.fields.slice(0, 2).map((field, index) => (
                    <Tag key={index} color="blue" className="text-xs mr-1 mb-1">
                      {field.type}
                    </Tag>
                  ))}
                  {item.fields.length > 2 && (
                    <Tag color="blue" className="text-xs mb-1">
                      +{item.fields.length - 2}
                    </Tag>
                  )}
                </div>
              </div>
            </StyledCard>
          ))
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No forms yet. Create your first form!"
            className="col-span-full"
          />
        )}
      </div>
    </ScrollableDiv>
  );

  const renderFormBuilder = () => (
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
            rules={[{ required: true, message: "Please input the form name!" }]}
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
                          <Space direction="vertical" className="w-full">
                            <Form.Item
                              {...field}
                              name={[field.name, "fieldName"]}
                              label="Field Name"
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
                              {...field}
                              name={[field.name, "type"]}
                              label="Field Type"
                              rules={[{ required: true, message: "Required" }]}
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
                                  handleFieldChange(index, "required", checked)
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
                                          style={{ width: "calc(100% - 32px)" }}
                                          defaultValue={
                                            form.getFieldValue([
                                              "fields",
                                              index,
                                              "options",
                                            ])?.[optionIndex] || ""
                                          }
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
                          </Space>
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
              {isEditing ? "Update Form" : "Create Form"}
            </StyledButton>
          </Form.Item>
        </Form>
      </Card>
    </ScrollableDiv>
  );

  const renderField = (field: FieldType) => {
    switch (field.type) {
      case "text":
        return <Input placeholder={field.placeholder} className="w-full" />;
      case "number":
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            className="w-full"
          />
        );
      case "boolean":
        return <Switch />;
      case "select":
        return (
          <Select placeholder={field.placeholder} className="w-full">
            {field.options.map((option, index) => (
              <Option key={index} value={option}>
                {option}
              </Option>
            ))}
          </Select>
        );
      case "checkbox":
        return (
          <Checkbox.Group className="w-full">
            {field.options.map((option, index) => (
              <Checkbox key={index} value={option} className="mb-2 block">
                {option}
              </Checkbox>
            ))}
          </Checkbox.Group>
        );
      case "radio":
        return (
          <Radio.Group className="w-full">
            {field.options.map((option, index) => (
              <Radio key={index} value={option} className="mb-2 block">
                {option}
              </Radio>
            ))}
          </Radio.Group>
        );
      case "switch":
        return <Switch />;
      case "date":
        return <Input type="date" className="w-full" />;
      default:
        return <Input placeholder={field.placeholder} className="w-full" />;
    }
  };

  const renderPreview = () => (
    <ScrollableDiv>
      <Card className="bg-gray-50 rounded-lg shadow-inner">
        <AnimatePresence>
          {fields.map((field, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Form.Item
                label={<span className="font-semibold">{field.fieldName}</span>}
                required={field.required}
                className="mb-6"
              >
                {renderField(field)}
              </Form.Item>
            </motion.div>
          ))}
        </AnimatePresence>
        {fields.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No fields added yet. Start building your form!"
          />
        )}
      </Card>
    </ScrollableDiv>
  );

  return (
    <>
      <Modal
        visible={visible}
        onCancel={onClose}
        footer={null}
        width="90vw"
        bodyStyle={{
          maxHeight: "77vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Spin spinning={loading}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} className="mt-2">
            <TabPane tab="Forms List" key="1" className="w-full">
              {renderFormsList()}
              <div className="flex justify-center mt-6">
                <StyledButton
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    resetForm();
                    setActiveTab("2");
                  }}
                  size="large"
                >
                  Create New Form
                </StyledButton>
              </div>
            </TabPane>
            <TabPane tab={isEditing ? "Edit Form" : "Create Form"} key="2">
              <div className="flex gap-6">
                <div className="w-1/2">{renderFormBuilder()}</div>
                <div className="w-1/2">
                  <Card title="Form Preview" className="shadow-lg sticky top-0">
                    {renderPreview()}
                  </Card>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </Spin>
      </Modal>

      <Drawer
        title="Form Preview"
        placement="right"
        onClose={() => setPreviewVisible(false)}
        visible={previewVisible}
        width="50%"
      >
        {selectedForm && (
          <ScrollableDiv>
            <Card className="bg-gray-50 rounded-lg shadow-inner">
              {selectedForm.fields.map((field, index) => (
                <Form.Item
                  key={index}
                  label={
                    <span className="font-semibold">{field.fieldName}</span>
                  }
                  required={field.required}
                  className="mb-6"
                >
                  {renderField(field)}
                </Form.Item>
              ))}
            </Card>
          </ScrollableDiv>
        )}
      </Drawer>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default TemplateForm;
