import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Popconfirm,
  Card,
  Typography,
  Space,
  Tooltip,
  Avatar,
  Layout,
  Tag,
  Select,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../api/auth.api";
import styled from "styled-components";
import { ColumnGroupType, ColumnType } from "antd/es/table";

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

interface User {
  _id: string;
  user_name: string;
  role: string;
  is_active: boolean;
  password?: string;
}

interface UserManagementProps {
  onClose: () => void;
}

const StyledCard = styled(Card)`
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const StyledTable = styled(Table<User>)`
  .ant-table-thead > tr > th {
    background-color: #f0f2f5;
    font-weight: 600;
  }
  .ant-table-tbody > tr:hover > td {
    background-color: #e6f7ff;
  }
  .ant-table-body {
    max-height: 400px;
    overflow-y: auto;
  }
`;

const StyledButton = styled(Button)`
  transition: all 0.3s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 12px;
  }
  .ant-modal-body {
    max-height: 70vh;
    overflow-y: auto;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const UserManagement: React.FC<UserManagementProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers.filter((user: User) => user.role !== "admin"));
    } catch (error) {
      message.error("Failed to fetch users. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter((user) =>
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (user) => user.is_active === (statusFilter === "active")
      );
    }

    setFilteredUsers(filtered);
  };

  const showModal = (mode: "create" | "edit", user?: User) => {
    setModalMode(mode);
    setSelectedUser(user || null);
    setIsModalVisible(true);
    form.resetFields();
    if (user && mode === "edit") {
      form.setFieldsValue({
        ...user,
        password: "",
      });
    } else if (mode === "create") {
      form.setFieldsValue({
        is_active: true,
      });
    }
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        if (modalMode === "create") {
          await createUser({
            user_name: values.user_name,
            password: values.password,
            is_active: values.is_active,
          });
          message.success("User created successfully");
        } else if (modalMode === "edit" && selectedUser) {
          const updatedData: Partial<User> = {
            is_active: values.is_active,
            user_name: values.user_name,
          };
          if (values.password) {
            updatedData.password = values.password;
          }
          await updateUser(selectedUser._id, updatedData);
          message.success("User updated successfully");
        }
        setIsModalVisible(false);
        fetchUsers();
      } catch (error) {
        message.error(`Failed to ${modalMode} user. Please try again.`);
      }
    });
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      message.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      message.error("Failed to delete user. Please try again.");
    }
  };

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    try {
      await updateUser(userId, { is_active: newStatus });
      message.success("User status updated successfully");
      fetchUsers();
    } catch (error) {
      message.error("Failed to update user status. Please try again.");
    }
  };

  const columns: (ColumnType<User> | ColumnGroupType<User>)[] = [
    {
      title: "Username",
      dataIndex: "user_name",
      key: "user_name",
      render: (text: string) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Typography.Text strong>{text}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: User) => (
        <Space>
          <Tooltip title="Edit User">
            <StyledButton
              icon={<EditOutlined />}
              onClick={() => showModal("edit", record)}
              type="primary"
              ghost
            />
          </Tooltip>
          <Tooltip title="Toggle Status">
            <Switch
              checked={record.is_active}
              onChange={(checked) => handleStatusChange(record._id, checked)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete User">
              <StyledButton icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: "24px" }}>
        <StyledCard>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Space
              align="center"
              style={{ width: "100%", justifyContent: "space-between" }}
            >
              <Title level={2}>User Management</Title>
              <Space>
                <StyledButton
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showModal("create")}
                >
                  Create New User
                </StyledButton>
                <StyledButton icon={<CloseCircleOutlined />} onClick={onClose}>
                  Close
                </StyledButton>
              </Space>
            </Space>

            <SearchContainer>
              <Input
                placeholder="Search users"
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 200 }}
              />
              <Select
                defaultValue="all"
                style={{ width: 120 }}
                onChange={(value: "all" | "active" | "inactive") =>
                  setStatusFilter(value)
                }
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </SearchContainer>

            <StyledTable
              columns={columns}
              dataSource={filteredUsers}
              rowKey="_id"
              loading={isLoading}
              pagination={{ pageSize: 10 }}
              style={{ width: "100%" }}
            />
            <StyledModal
              title={modalMode === "create" ? "Create New User" : "Edit User"}
              visible={isModalVisible}
              onOk={handleOk}
              onCancel={() => setIsModalVisible(false)}
              width={800}
            >
              <Form form={form} layout="vertical">
                <Form.Item
                  name="user_name"
                  label="Username"
                  rules={[
                    { required: true, message: "Please input the username!" },
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Username" />
                </Form.Item>
                <Form.Item
                  name="password"
                  label={
                    modalMode === "create"
                      ? "Password"
                      : "New Password (optional)"
                  }
                  rules={[
                    {
                      required: modalMode === "create",
                      message: "Please input the password!",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                  />
                </Form.Item>
                <Form.Item
                  name="is_active"
                  valuePropName="checked"
                  label="User Status"
                >
                  <Switch />
                </Form.Item>
              </Form>
            </StyledModal>
          </Space>
        </StyledCard>
      </Content>
    </Layout>
  );
};

export default UserManagement;
