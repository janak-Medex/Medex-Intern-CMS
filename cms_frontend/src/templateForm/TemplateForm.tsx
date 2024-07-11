// TemplateForm.tsx
import React, { useState, useEffect } from "react";
import { Modal, Tabs, Spin, message, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import styled from "styled-components";
import FormsList from "./FormsList";
import FormBuilder from "./FormBuilder";
import { FormType } from "./types";
import { Component } from "../components/types";
import { fetchForms, deleteForm } from "../api/formComponent.api";

const { TabPane } = Tabs;
const StyledModal = styled(Modal)`
  .ant-modal-body {
    padding: 0;
    display: flex;
    flex-direction: column;
    height: 77vh;
  }

  .ant-tabs {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .ant-tabs-nav {
    margin: 0;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: white;
  }

  .ant-tabs-content-holder {
    flex: 1;
    overflow-y: auto;
  }

  .ant-tabs-content {
    height: 100%;
  }
`;

const StyledTabPane = styled(TabPane)`
  height: 100%;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

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
  initialFormData?: Component | null;
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
      fetchFormsList();
    }
  }, [visible, templateName]);

  const fetchFormsList = async () => {
    setLoading(true);
    try {
      const fetchedForms = await fetchForms(templateName);
      setForms(fetchedForms);
    } catch (error) {
      console.error("Error fetching forms:", error);
      message.error("Failed to fetch forms");
    } finally {
      setLoading(false);
    }
  };

  const handleFormCreated = () => {
    onFormCreated();
    fetchFormsList();
  };

  const handleDeleteForm = async (formName: string) => {
    setLoading(true);
    try {
      await deleteForm(templateName, formName);
      message.success("Form deleted successfully");
      fetchFormsList(); // Refresh the forms list
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
    <StyledModal
      visible={visible}
      onCancel={onClose}
      footer={null}
      width="90vw"
    >
      <Spin spinning={loading}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <StyledTabPane tab="Forms List" key="1">
            <FormsList
              forms={forms}
              onSelectForm={selectForm}
              onDeleteForm={handleDeleteForm}
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
          </StyledTabPane>
          <StyledTabPane tab={isEditing ? "Edit Form" : "Create Form"} key="2">
            <FormBuilder
              templateName={templateName}
              initialForm={selectedForm}
              onFormSaved={handleFormCreated}
            />
          </StyledTabPane>
        </Tabs>
      </Spin>
    </StyledModal>
  );
};

export default TemplateForm;
