import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Switch,
  Checkbox,
  Radio,
  DatePicker,
  Empty,
  Upload,
  Modal,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { FieldType, FormPreviewProps } from "./types";
import type { RcFile, UploadProps } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";

const { Option } = Select;
const { TextArea } = Input;

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const FormPreview: React.FC<FormPreviewProps> = ({ fields }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
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
      case "file":
        return (
          <>
            <Upload
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              multiple
            >
              {fileList.length >= 8 ? null : uploadButton}
            </Upload>
            <Modal
              open={previewOpen}
              title={previewTitle}
              footer={null}
              onCancel={handleCancel}
            >
              <img alt="example" style={{ width: "100%" }} src={previewImage} />
            </Modal>
          </>
        );
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
