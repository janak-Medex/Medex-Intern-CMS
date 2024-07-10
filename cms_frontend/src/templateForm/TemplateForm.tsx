import React, { useState, useEffect } from "react";
import { Modal, Tabs, Spin, message, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import styled from "styled-components";
import axiosInstance from "../http/axiosInstance";
import FormsList from "./FormsList";
import FormBuilder from "./FormBuilder";
import { FormType } from "./types";
import { Component } from "../components/types";

const { TabPane } = Tabs;

const StyledButton = styled(Button)`
  transition: all 0.3s;
  &:hover {
    transform: scale(1.05);
  }
`;

interface TemplateFormProps {
  templateName: string;
  visible: boolean;
  onClose: () => void;
  onFormCreated: () => void;
  onFormDeleted: () => void;
  initialFormData?: Component;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  templateName,
  visible,
  onClose,
  onFormCreated,
  onFormDeleted,
}) => {
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
      message.error("Failed to fetch forms");
    } finally {
      setLoading(false);
    }
  };

  const handleFormCreated = () => {
    onFormCreated();
    fetchForms();
  };

  const deleteForm = async (formName: string) => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/form/${templateName}/${formName}`);
      message.success("Form deleted successfully");
      fetchForms(); // Refresh the forms list
      onFormDeleted(); // Notify parent component
    } catch (error) {
      console.error("Error deleting form:", error);
      message.error("Failed to delete form");
    } finally {
      setLoading(false);
    }
  };

  const selectForm = (formToEdit: FormType) => {
    setSelectedForm(formToEdit);
    setIsEditing(true);
    setActiveTab("2");
  };

  const resetForm = () => {
    setSelectedForm(null);
    setIsEditing(false);
    setActiveTab("1");
  };

  return (
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
            <FormsList
              forms={forms}
              onSelectForm={selectForm}
              onDeleteForm={deleteForm}
              templateName={templateName}
            />
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
            <FormBuilder
              templateName={templateName}
              initialForm={selectedForm}
              onFormSaved={handleFormCreated}
            />
          </TabPane>
        </Tabs>
      </Spin>
    </Modal>
  );
};

export default TemplateForm;
