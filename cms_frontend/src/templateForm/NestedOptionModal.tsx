import React, { useState } from "react";
import {
  Tree,
  Input,
  Button,
  Switch,
  Space,
  Card,
  Typography,
  Upload,
  Form,
  Modal,
  message,
  Tooltip,
  Drawer,
  TreeSelect,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
  SaveOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import { FaBox, FaFolder, FaFile } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { NestedOptionType } from "./types";
import NestedOptionPreview from "./NestedOptionPreview";

const { Title, Text } = Typography;
const { TreeNode } = Tree;
const StyledContainer = styled.div`
  display: flex;
  gap: 20px;
  padding: 10px;
  height: 500px;
  background-color: #fff;
  border-radius: 8px;
`;

const StyledSidebar = styled.div`
  width: 50%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledTreeContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #d9d9d9;
`;

const StyledTree = styled(Tree)`
  .ant-tree-treenode {
    width: 100%;
    padding: 8px 0;
  }

  .ant-tree-node-content-wrapper {
    width: 100%;
  }

  .ant-tree-switcher {
    background: #f0f2f5;
    border-radius: 4px;
  }
`;

const StyledCard = styled(Card)`
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  transition: all 0.3s;
`;

const StyledDivider = styled.div`
  width: 2px;
  background: linear-gradient(to bottom, #1890ff, #52c41a);
  margin: 0 20px;
`;

const StyledIconButton = styled(Button)`
  &:hover {
    transform: scale(1.1);
  }
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ScrollableContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #d9d9d9;
  height: 100%;
`;

interface NestedOptionModalProps {
  options: NestedOptionType[];
  fieldIndex: number;
  handleNestedOptionAdd: (fieldIndex: number, path: number[]) => void;
  handleNestedOptionRemove: (fieldIndex: number, path: number[]) => void;
  handleNestedOptionChange: (
    fieldIndex: number,
    path: number[],
    value: string
  ) => void;
  handleNestedOptionPackageToggle: (
    fieldIndex: number,
    path: number[],
    isPackage: boolean
  ) => void;
  handleNestedOptionKeyValuePairAdd: (
    fieldIndex: number,
    path: number[]
  ) => void;
  handleNestedOptionKeyValuePairChange: (
    fieldIndex: number,
    path: number[],
    pairIndex: number,
    key: "key" | "value",
    value: string | File | File[]
  ) => void;
  handleNestedOptionKeyValuePairRemove: (
    fieldIndex: number,
    path: number[],
    pairIndex: number
  ) => void;
}

const NestedOptionModal: React.FC<NestedOptionModalProps> = ({
  options,
  fieldIndex,
  handleNestedOptionAdd,
  handleNestedOptionRemove,
  handleNestedOptionChange,
  handleNestedOptionPackageToggle,
  handleNestedOptionKeyValuePairAdd,
  handleNestedOptionKeyValuePairChange,
  handleNestedOptionKeyValuePairRemove,
}) => {
  const [selectedPath, setSelectedPath] = useState<number[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [previewDrawerVisible, setPreviewDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [importForm] = Form.useForm();

  const handleImportOption = (values: { fromPath: string }) => {
    const fromPath = values.fromPath.split("-").map(Number);
    const importedItem = findItemByPath(options, fromPath);
    if (importedItem) {
      importNestedOption(importedItem, selectedPath);
      setImportModalVisible(false);
      importForm.resetFields();
      message.success("Option imported successfully");
    }
  };

  const importNestedOption = (item: NestedOptionType, path: number[]) => {
    handleNestedOptionAdd(fieldIndex, path);
    const newPath = [
      ...path,
      (findItemByPath(options, path)?.options?.length || 0) - 1,
    ];
    handleNestedOptionChange(fieldIndex, newPath, item.label);
    handleNestedOptionPackageToggle(fieldIndex, newPath, item.isPackage);

    // Import key-value pairs if any
    if (item.isPackage && item.keyValuePairs) {
      Object.entries(item.keyValuePairs).forEach(([key, value], index) => {
        handleNestedOptionKeyValuePairAdd(fieldIndex, newPath);
        handleNestedOptionKeyValuePairChange(
          fieldIndex,
          newPath,
          index,
          "key",
          key
        );
        handleNestedOptionKeyValuePairChange(
          fieldIndex,
          newPath,
          index,
          "value",
          value
        );
      });
    }

    // Recursively import nested options
    if (item.options) {
      item.options.forEach((nestedItem, index) => {
        const nestedNewPath = [...newPath, index];
        if (nestedItem.isPackage) {
          handleNestedOptionAdd(fieldIndex, nestedNewPath);
          handleNestedOptionChange(fieldIndex, nestedNewPath, nestedItem.label);
          handleNestedOptionPackageToggle(fieldIndex, nestedNewPath, true);

          if (nestedItem.keyValuePairs) {
            Object.entries(nestedItem.keyValuePairs).forEach(
              ([key, value], pairIndex) => {
                handleNestedOptionKeyValuePairAdd(fieldIndex, nestedNewPath);
                handleNestedOptionKeyValuePairChange(
                  fieldIndex,
                  nestedNewPath,
                  pairIndex,
                  "key",
                  key
                );
                handleNestedOptionKeyValuePairChange(
                  fieldIndex,
                  nestedNewPath,
                  pairIndex,
                  "value",
                  value
                );
              }
            );
          }
        } else {
          importNestedOption(nestedItem, nestedNewPath);
        }
      });
    }
  };

  const getColor = (level: number): string => {
    const colors = ["#1890ff", "#52c41a", "#722ed1", "#fa8c16", "#eb2f96"];
    return colors[level % colors.length];
  };

  const renderTreeNodes = (
    data: NestedOptionType[],
    parentPath: number[] = [],
    level: number = 0
  ) =>
    data.map((item, index) => {
      const currentPath = [...parentPath, index];
      const key = currentPath.join("-");
      const color = getColor(level);

      const icon = item.isPackage ? (
        <FaBox style={{ color }} />
      ) : item.options && item.options.length > 0 ? (
        <FaFolder style={{ color }} />
      ) : (
        <FaFile style={{ color }} />
      );

      return (
        <TreeNode
          key={key}
          title={
            <StyledCard
              hoverable
              size="small"
              style={{ borderLeft: `4px solid ${color}` }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Space align="center">
                  {icon}
                  <Text strong style={{ color }}>
                    {item.label}
                  </Text>
                  <Space size="small">
                    <Tooltip title="Edit">
                      <StyledIconButton
                        size="small"
                        type="text"
                        icon={<EditOutlined style={{ color }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPath(currentPath);
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Add child">
                      <StyledIconButton
                        size="small"
                        type="text"
                        icon={<PlusOutlined style={{ color }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPath(currentPath);
                          setAddModalVisible(true);
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Import">
                      <StyledIconButton
                        size="small"
                        type="text"
                        icon={<ImportOutlined style={{ color }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPath(currentPath);
                          setImportModalVisible(true);
                        }}
                      />
                    </Tooltip>
                    <Popconfirm
                      title="Are you sure you want to delete this option?"
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        handleNestedOptionRemove(fieldIndex, currentPath);
                      }}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Tooltip title="Remove">
                        <StyledIconButton
                          size="small"
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Tooltip>
                    </Popconfirm>
                  </Space>
                </Space>
              </motion.div>
            </StyledCard>
          }
          icon={null}
        >
          {item.options &&
            item.options.length > 0 &&
            renderTreeNodes(item.options, currentPath, level + 1)}
        </TreeNode>
      );
    });

  const handleAddOption = (values: any) => {
    const { label, isPackage } = values;
    handleNestedOptionAdd(fieldIndex, selectedPath);
    const newPath = [
      ...selectedPath,
      (findItemByPath(options, selectedPath)?.options?.length || 0) - 1,
    ];
    handleNestedOptionChange(fieldIndex, newPath, label);
    handleNestedOptionPackageToggle(fieldIndex, newPath, isPackage);
    setAddModalVisible(false);
    form.resetFields();
    message.success("Option added successfully");
  };

  const renderKeyValuePairs = (item: NestedOptionType, path: number[]) => (
    <Card title="Key-Value Pairs" size="small" className="mt-4">
      {Object.entries(item.keyValuePairs || {}).map(
        ([key, value], pairIndex) => (
          <Space key={pairIndex} className="mb-2">
            <Input
              value={key}
              onChange={(e) =>
                handleNestedOptionKeyValuePairChange(
                  fieldIndex,
                  path,
                  pairIndex,
                  "key",
                  e.target.value
                )
              }
              placeholder="Key"
              style={{ width: 150 }}
            />
            {["image", "video", "file"].includes(key.toLowerCase()) ? (
              <Upload
                beforeUpload={(file) => {
                  handleNestedOptionKeyValuePairChange(
                    fieldIndex,
                    path,
                    pairIndex,
                    "value",
                    file
                  );
                  return false;
                }}
                accept={getAcceptType(key)}
              >
                <Button icon={<UploadOutlined />}>
                  {value instanceof File ? value.name : "Upload"}
                </Button>
              </Upload>
            ) : (
              <Input
                value={value as string}
                onChange={(e) =>
                  handleNestedOptionKeyValuePairChange(
                    fieldIndex,
                    path,
                    pairIndex,
                    "value",
                    e.target.value
                  )
                }
                placeholder="Value"
                style={{ width: 150 }}
              />
            )}
            <StyledIconButton
              type="text"
              danger
              icon={<MinusCircleOutlined />}
              onClick={() =>
                handleNestedOptionKeyValuePairRemove(
                  fieldIndex,
                  path,
                  pairIndex
                )
              }
            />
          </Space>
        )
      )}
      <Button
        type="dashed"
        onClick={() => handleNestedOptionKeyValuePairAdd(fieldIndex, path)}
        icon={<PlusOutlined />}
        className="mt-2"
      >
        Add Key-Value Pair
      </Button>
    </Card>
  );

  const getAcceptType = (key: string): string => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("image")) return "image/*";
    if (lowerKey.includes("video")) return "video/*";
    return "*/*";
  };

  const findItemByPath = (
    data: NestedOptionType[],
    path: number[]
  ): NestedOptionType | null => {
    if (path.length === 0) return null;
    let current = data[path[0]];
    for (let i = 1; i < path.length; i++) {
      if (!current?.options) return null;
      current = current.options[path[i]];
    }
    return current;
  };

  const renderEditSection = () => {
    const item = findItemByPath(options, selectedPath);
    if (!item) return <Text>No item selected</Text>;

    return (
      <ScrollableContent className="custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Form layout="vertical">
            <Form.Item label="Option Label">
              <Input
                value={item.label}
                onChange={(e) =>
                  handleNestedOptionChange(
                    fieldIndex,
                    selectedPath,
                    e.target.value
                  )
                }
                placeholder="Option Label"
              />
            </Form.Item>
            <Form.Item label="Is Package">
              <Switch
                checked={item.isPackage}
                onChange={(checked) =>
                  handleNestedOptionPackageToggle(
                    fieldIndex,
                    selectedPath,
                    checked
                  )
                }
              />
            </Form.Item>
            {item.isPackage && renderKeyValuePairs(item, selectedPath)}
          </Form>
        </motion.div>
      </ScrollableContent>
    );
  };

  const renderTreeSelectOptions = (
    data: NestedOptionType[],
    parentPath: number[] = []
  ): any[] => {
    return data.map((item, index) => {
      const currentPath = [...parentPath, index];
      const value = currentPath.join("-");
      const title = (
        <Space>
          {item.isPackage ? <FaBox /> : <FaFolder />}
          {item.label}
        </Space>
      );

      if (item.options && item.options.length > 0) {
        return {
          title,
          value,
          children: renderTreeSelectOptions(item.options, currentPath),
        };
      }

      return { title, value };
    });
  };

  return (
    <StyledContainer>
      <StyledSidebar>
        <StyledHeader>
          <Space>
            <Button
              type="primary"
              onClick={() => {
                setSelectedPath([]);
                setAddModalVisible(true);
              }}
              icon={<PlusOutlined />}
            >
              Add Root Option
            </Button>
            <Button
              onClick={() => setPreviewDrawerVisible(true)}
              icon={<EyeOutlined />}
            >
              Show Preview
            </Button>
            <Button
              type="primary"
              // onClick={} // Implement save functionality
              icon={<SaveOutlined />}
            >
              Save Form
            </Button>
          </Space>
        </StyledHeader>
        <StyledTreeContainer className="custom-scrollbar">
          <StyledTree
            showLine
            switcherIcon={({ expanded }) =>
              expanded ? <CaretDownOutlined /> : <CaretRightOutlined />
            }
            onSelect={(selectedKeys) => {
              if (selectedKeys.length > 0) {
                setSelectedPath(
                  selectedKeys[0].toString().split("-").map(Number)
                );
              }
            }}
          >
            {renderTreeNodes(options)}
          </StyledTree>
        </StyledTreeContainer>
      </StyledSidebar>
      <StyledDivider />
      <StyledSidebar>
        <StyledHeader>
          <Title level={3}>Edit Option</Title>
        </StyledHeader>
        <AnimatePresence mode="wait">{renderEditSection()}</AnimatePresence>

        <Modal
          title="Add New Option"
          visible={addModalVisible}
          onCancel={() => setAddModalVisible(false)}
          footer={null}
        >
          <Form form={form} onFinish={handleAddOption} layout="vertical">
            <Form.Item name="label" label="Label" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="isPackage"
              label="Is Package"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Add
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Import Option"
          visible={importModalVisible}
          onCancel={() => setImportModalVisible(false)}
          footer={null}
        >
          <Form
            form={importForm}
            onFinish={handleImportOption}
            layout="vertical"
          >
            <Form.Item
              name="fromPath"
              label="Import From"
              rules={[{ required: true }]}
            >
              <TreeSelect
                style={{ width: "100%" }}
                dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                treeData={renderTreeSelectOptions(options)}
                placeholder="Select source option"
                treeDefaultExpandAll
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<ImportOutlined />}
              >
                Import
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Drawer
          title="Nested Option Preview"
          placement="right"
          onClose={() => setPreviewDrawerVisible(false)}
          visible={previewDrawerVisible}
          width={600}
        >
          <NestedOptionPreview options={options} />
        </Drawer>
      </StyledSidebar>
    </StyledContainer>
  );
};

export default NestedOptionModal;
