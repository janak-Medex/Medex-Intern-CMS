import React, { useRef } from "react";
import { Form, Button, Input } from "antd";
import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import FormPreview from "./FormPreview";
import { FormType } from "./types";
import "./scrollbar.css";
import FieldComponent from "./FieldComponent";
import useFormBuilder from "./useFormBuilder";

const FormBuilder: React.FC<{
  templateName: string;
  initialForm: FormType | null;
  onFormSaved: () => void;
}> = ({ templateName, initialForm, onFormSaved }) => {
  const [form] = Form.useForm();
  const formBuilderRef = useRef<HTMLDivElement>(null);
  const formPreviewRef = useRef<HTMLDivElement>(null);

  const {
    fields,
    expandedFields,
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
  } = useFormBuilder(
    form,
    initialForm,
    templateName,
    onFormSaved,
    formBuilderRef
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
                <FieldComponent
                  key={index}
                  field={field}
                  index={index}
                  expandedFields={expandedFields}
                  handleFieldChange={handleFieldChange}
                  handleOptionAdd={handleOptionAdd}
                  handleOptionChange={handleOptionChange}
                  handleOptionRemove={handleOptionRemove}
                  handleNestedOptionAdd={handleNestedOptionAdd}
                  handleNestedOptionRemove={handleNestedOptionRemove}
                  handleNestedOptionChange={handleNestedOptionChange}
                  toggleFieldExpansion={toggleFieldExpansion}
                  removeField={removeField}
                  handleDragStart={handleDragStart}
                  handleDrop={handleDrop}
                />
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
