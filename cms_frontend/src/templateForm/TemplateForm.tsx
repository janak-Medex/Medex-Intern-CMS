// TemplateForm.tsx
import React, { useState, useEffect } from "react";
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
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  EditOutlined,
  SaveOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import axiosInstance from "../http/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

const { Option } = Select;
const { TabPane } = Tabs;

interface FieldType {
  type: string;
  required: boolean;
  fieldName: string;
  placeholder: string;
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
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  templateName,
  visible,
  onClose,
  onFormCreated,
}) => {
  const [form] = Form.useForm();
  const [fields, setFields] = useState<FieldType[]>([]);
  const [forms, setForms] = useState<FormType[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(false);

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
      { type: "text", required: false, fieldName: "", placeholder: "" },
    ];
    setFields(newFields);
    form.setFieldsValue({ fields: newFields });
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

  const selectForm = (formToEdit: FormType) => {
    setSelectedForm(formToEdit);
    setFields(formToEdit.fields);
    setIsEditing(true);
    setFormValues(formToEdit);
    setActiveTab("2");
  };

  const setFormValues = (formToEdit: FormType) => {
    form.setFieldsValue({
      formName: formToEdit.name,
      fields: formToEdit.fields,
    });
  };

  const deleteForm = async (formId: string) => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/form/${templateName}/${formId}`);
      toast.success("Form deleted successfully");
      fetchForms();
    } catch (error) {
      console.error("Error deleting form:", error);
      toast.error("Failed to delete form");
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    return (
      <Card title="Form Preview" className="bg-gray-100 rounded-lg h-full">
        <AnimatePresence>
          {fields.map((field, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Form.Item label={field.fieldName} required={field.required}>
                {renderField(field)}
              </Form.Item>
            </motion.div>
          ))}
        </AnimatePresence>
      </Card>
    );
  };

  const renderField = (field: FieldType) => {
    switch (field.type) {
      case "text":
        return <Input placeholder={field.placeholder} />;
      case "number":
        return <Input type="number" placeholder={field.placeholder} />;
      case "boolean":
        return <Switch />;
      case "select":
        return (
          <Select placeholder={field.placeholder}>
            <Option value="option">Option</Option>
          </Select>
        );
      case "checkbox":
        return <Input type="checkbox" />;
      case "radio":
        return <Input type="radio" />;
      case "switch":
        return <Switch />;
      case "date":
        return <Input type="date" />;
      default:
        return <Input placeholder={field.placeholder} />;
    }
  };

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={"90vw"}
      bodyStyle={{ height: "77vh", overflowY: "hidden" }}
    >
      <Spin spinning={loading}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="mt-2 sticky top-0 z-10 bg-white"
        >
          <TabPane tab="Forms List" key="1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {forms.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-200"
                >
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <h4 className="text-base font-semibold text-gray-800">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Fields: {item.fields.length}
                    </p>
                  </div>
                  <div className="p-2 flex justify-end space-x-2">
                    <Tooltip title="Edit">
                      <button
                        onClick={() => selectForm(item)}
                        className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors duration-300"
                      >
                        <EditOutlined />
                      </button>
                    </Tooltip>
                    <Popconfirm
                      title="Are you sure you want to delete this form?"
                      onConfirm={() => deleteForm(item._id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Tooltip title="Delete">
                        <button className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-300">
                          <DeleteOutlined />
                        </button>
                      </Tooltip>
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  resetForm();
                  setActiveTab("2");
                }}
                size="middle"
                className="px-4 py-1"
              >
                Create New Form
              </Button>
            </div>
          </TabPane>

          <TabPane tab={isEditing ? "Edit Form" : "Create Form"} key="2">
            <div className="flex flex-col lg:flex-row gap-4 p-4">
              <div className="w-full lg:w-1/2 h-full overflow-y-auto">
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  <div className="bg-gray-200 p-3 sticky z-10">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Form Name
                    </h4>
                  </div>
                  <div className="p-4 overflow-y-auto max-h-[calc(80vh-200px)]">
                    <Form
                      form={form}
                      onFinish={onFinish}
                      layout="vertical"
                      className="space-y-4"
                    >
                      <Form.Item
                        name="formName"
                        label="Form Name"
                        rules={[
                          {
                            required: true,
                            message: "Please input the form name!",
                          },
                        ]}
                      >
                        <Input className="w-full" />
                      </Form.Item>

                      <div className="my-3 border-b border-gray-200">
                        <span className="text-lg font-semibold text-gray-700">
                          Form Fields
                        </span>
                      </div>

                      <Form.List name="fields">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map((field, index) => (
                              <div
                                key={field.key}
                                className="bg-white p-4 rounded-lg mb-4 shadow-sm border border-gray-200"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                      <Option value="other">Other</Option>
                                    </Select>
                                  </Form.Item>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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
                                </div>
                                <Button
                                  type="text"
                                  danger
                                  onClick={() => {
                                    remove(field.name);
                                    removeField(index);
                                  }}
                                  className="mt-2"
                                  icon={<MinusCircleOutlined />}
                                >
                                  Remove Field
                                </Button>
                              </div>
                            ))}
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => {
                                  add();
                                  addField();
                                }}
                                block
                                icon={<PlusOutlined />}
                                className="h-9 hover:border-blue-500 hover:text-blue-500"
                              >
                                Add Field
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<SaveOutlined />}
                          size="middle"
                          className="px-4 py-1"
                        >
                          {isEditing ? "Update Form" : "Create Form"}
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-1/2 h-full overflow-y-auto">
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  <div className="bg-gray-200 p-3 sticky z-10">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Form Preview
                    </h4>
                  </div>
                  <div className="p-4 overflow-y-auto max-h-[calc(80vh-200px)]">
                    {renderPreview()}
                  </div>
                </div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Spin>
      <ToastContainer position="top-right" autoClose={3000} />
    </Modal>
  );
};

export default TemplateForm;
