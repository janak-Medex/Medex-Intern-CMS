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
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
`;

const TableContainer = styled.div`
  max-height: calc(100vh - 300px);
  overflow-y: auto;
`;

const CenteredTable = styled(Table)`
  .ant-table-thead > tr > th {
    text-align: center;
    background-color: #f0f2f5;
    color: #1890ff;
    font-weight: 600;
  }

  .ant-table-tbody > tr > td {
    text-align: center;
  }

  .ant-table-tbody > tr:hover > td {
    background-color: #e6f7ff;
  }
`;

const StyledButton = styled(Button)`
  transition: all 0.3s;
  border-radius: 6px;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 16px;
    overflow: hidden;
  }

  .ant-modal-header {
    background-color: #f0f2f5;
    border-bottom: none;
    padding: 16px 24px;
  }

  .ant-modal-body {
    padding: 24px;
  }

  .ant-modal-footer {
    border-top: none;
    padding: 16px 24px;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background-color: #f0f2f5;
  padding: 16px;
  border-radius: 8px;
`;

const StyledInput = styled(Input)`
  border-radius: 6px;
  &:hover,
  &:focus {
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
`;

const StyledTag = styled(Tag)`
  border-radius: 12px;
  padding: 4px 8px;
  font-weight: 600;
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

  const columns = [
    {
      title: "Username",
      dataIndex: "user_name",
      key: "user_name",
      render: (text: string) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: "#1890ff" }}
          />
          <Typography.Text strong>{text}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean) => (
        <StyledTag color={isActive ? "success" : "error"}>
          {isActive ? "Active" : "Inactive"}
        </StyledTag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: User) => (
        <Space size="middle">
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
              <Title level={2} style={{ margin: 0 }}>
                User Management
              </Title>
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
              <StyledInput
                placeholder="Search users"
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 250 }}
              />
              <Select
                defaultValue="all"
                onChange={(value: "all" | "active" | "inactive") =>
                  setStatusFilter(value)
                }
                style={{ width: 140 }}
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </SearchContainer>

            <TableContainer className="custom-scrollbar">
              <CenteredTable
                columns={columns}
                dataSource={filteredUsers}
                rowKey="_id"
                loading={isLoading}
                pagination={{ pageSize: 10, position: ["bottomCenter"] }}
                style={{ width: "100%" }}
              />
            </TableContainer>

            <StyledModal
              title={modalMode === "create" ? "Create New User" : "Edit User"}
              visible={isModalVisible}
              onOk={handleOk}
              onCancel={() => setIsModalVisible(false)}
              width={600}
              centered
            >
              <Form form={form} layout="vertical">
                <Form.Item
                  name="user_name"
                  label="Username"
                  rules={[
                    { required: true, message: "Please input the username!" },
                  ]}
                >
                  <StyledInput
                    prefix={<UserOutlined />}
                    placeholder="Username"
                  />
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
