import React, { useState } from "react";
import {
  Card,
  Tooltip,
  Popconfirm,
  Empty,
  Avatar,
  Typography,
  Tag,
  Drawer,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  CopyOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { FormType } from "./types";
import FormPreview from "./FormPreview";

const StyledCard = styled(Card)`
  transition: all 0.3s;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

interface FormsListProps {
  forms: FormType[];
  onSelectForm: (form: FormType) => void;
  onDeleteForm: (formName: string) => void;
  templateName: string;
}

const FormsList: React.FC<FormsListProps> = ({
  forms,
  onSelectForm,
  onDeleteForm,
}) => {
  const [previewForm, setPreviewForm] = useState<FormType | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  return (
    <>
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
                    <EditOutlined
                      key="edit"
                      onClick={() => onSelectForm(item)}
                    />
                  </Tooltip>,
                  <Tooltip title="Preview">
                    <EyeOutlined
                      key="preview"
                      onClick={() => {
                        setPreviewForm(item);
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
                        onSelectForm(newForm);
                      }}
                    />
                  </Tooltip>,
                  <Popconfirm
                    title="Delete this form?"
                    onConfirm={() => onDeleteForm(item.name)}
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
                      <Tag
                        key={index}
                        color="blue"
                        className="text-xs mr-1 mb-1"
                      >
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

      <Drawer
        title="Form Preview"
        placement="right"
        onClose={() => setPreviewVisible(false)}
        visible={previewVisible}
        width="50%"
      >
        {previewForm && <FormPreview fields={previewForm.fields} />}
      </Drawer>
    </>
  );
};

export default FormsList;
