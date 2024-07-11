import React from "react";
import {
  Form,
  Input,
  Select,
  Switch,
  Checkbox,
  Radio,
  DatePicker,
  Empty,
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { FieldType, FormPreviewProps } from "./types";

const { Option } = Select;
const { TextArea } = Input;

const FormPreview: React.FC<FormPreviewProps> = ({ fields }) => {
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
            {field.options?.map((option, index) => (
              <Option key={index} value={option}>
                {option}
              </Option>
            ))}
          </Select>
        );
      case "checkbox":
        return (
          <Checkbox.Group className="w-full">
            {field.options?.map((option, index) => (
              <Checkbox key={index} value={option} className="mb-2 block">
                {option}
              </Checkbox>
            ))}
          </Checkbox.Group>
        );
      case "radio":
        return (
          <Radio.Group className="w-full">
            {field.options?.map((option, index) => (
              <Radio key={index} value={option} className="mb-2 block">
                {option}
              </Radio>
            ))}
          </Radio.Group>
        );
      case "switch":
        return <Switch />;
      case "date":
        return <DatePicker className="w-full" />;
      case "textarea":
        return <TextArea placeholder={field.placeholder} className="w-full" />;
      default:
        return <Input placeholder={field.placeholder} className="w-full" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-gray-50 p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Form Preview</h2>
      <AnimatePresence>
        {fields.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {fields.map((field, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="mb-8 bg-white p-6 rounded-lg shadow-sm"
              >
                <Form.Item
                  label={
                    <span className="text-lg font-medium text-gray-700">
                      {field.fieldName}
                    </span>
                  }
                  required={field.required}
                  className="mb-2"
                >
                  <div className="mt-2">{renderField(field)}</div>
                  {field.description && (
                    <p className="mt-2 text-sm text-gray-500">
                      {field.description}
                    </p>
                  )}
                </Form.Item>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-gray-500">
                No fields added yet. Start building your form!
              </span>
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormPreview;
