import React from "react";
import { Form, Input, Select, Switch, Checkbox, Radio, Empty } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { FieldType } from "./types";

const { Option } = Select;

interface FormPreviewProps {
  fields: FieldType[];
}

const StyledFormItem = styled(Form.Item)`
  margin-bottom: 16px;
  .ant-form-item-label {
    font-weight: 600;
  }
`;

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
        return <Input type="date" className="w-full" />;
      default:
        return <Input placeholder={field.placeholder} className="w-full" />;
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg shadow-inner p-4">
      <AnimatePresence>
        {fields.map((field, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <StyledFormItem
              label={<span className="font-semibold">{field.fieldName}</span>}
              required={field.required}
              className="mb-6"
            >
              {renderField(field)}
            </StyledFormItem>
          </motion.div>
        ))}
      </AnimatePresence>
      {fields.length === 0 && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No fields added yet. Start building your form!"
        />
      )}
    </div>
  );
};

export default FormPreview;
