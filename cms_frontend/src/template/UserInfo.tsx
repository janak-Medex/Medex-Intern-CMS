import React, { useState, useEffect } from "react";
import {
  Menu,
  Dropdown,
  Avatar,
  Tooltip,
  Modal,
  Form,
  Input,
  message,
  Button,
} from "antd";
import {
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import Cookies from "js-cookie";
import { decodeToken } from "../utils/JwtUtils";
import { logout, updateOwnPassword } from "../api/auth.api";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";

interface UserInfoProps {
  user: {
    user_name: string;
    role: "admin" | "user";
  };
  onLogout: () => void;
}

interface UserData {
  user_name: string;
  role: "admin" | "user";
}

const StyledDropdown = styled(Dropdown)`
  .ant-dropdown-menu {
    background: linear-gradient(135deg, #f6f9fc 0%, #e9f1f7 100%);
    border-radius: 20px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07);
    overflow: hidden;
  }
`;

const UserAvatar = styled(Avatar)`
  background: linear-gradient(135deg, #6e8efb 0%, #a777e3 100%);
  border: 3px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }
`;

const UserInfo: React.FC<UserInfoProps> = ({ user, onLogout }) => {
  const [userInfo, setUserInfo] = useState<UserData | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] =
    useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      const decodedToken = decodeToken(token);
      if (decodedToken) {
        setUserInfo({
          user_name: decodedToken.user_name!,
          role: decodedToken.role!,
        });
      } else {
        handleLogout();
      }
    } else {
      handleLogout();
    }
  }, []);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Implement dark mode logic here
  };

  const toggleNotification = () => {
    setShowNotification(!showNotification);
  };

  const showChangePasswordModal = () => {
    setIsChangePasswordModalVisible(true);
  };

  const handleChangePasswordCancel = () => {
    setIsChangePasswordModalVisible(false);
    form.resetFields();
  };

  const handleChangePasswordSubmit = async (values: any) => {
    try {
      await updateOwnPassword(values.oldPassword, values.newPassword);
      message.success("Password updated successfully");
      setIsChangePasswordModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Failed to update password. Please try again.");
    }
  };

  if (!userInfo) {
    return null;
  }

  const userMenu = (
    <Menu className="p-4 w-80">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center mb-6 pt-6"
      >
        <UserAvatar size={120} icon={<FaUserCircle className="text-white" />} />
        <h3 className="text-3xl font-bold mt-4 text-gray-800">
          {userInfo.user_name}
        </h3>
        <p className="text-sm text-purple-600 font-medium">Welcome Back</p>
        <div className="flex mt-4 space-x-2">
          <Tooltip title="Notifications">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleNotification}
              className="p-2 bg-blue-100 rounded-full text-blue-500 hover:bg-blue-200 transition-colors duration-200"
            >
              <BellOutlined />
            </motion.button>
          </Tooltip>
          <Tooltip title="Help">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-green-100 rounded-full text-green-500 hover:bg-green-200 transition-colors duration-200"
            >
              <QuestionCircleOutlined />
            </motion.button>
          </Tooltip>
          <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className="p-2 bg-yellow-100 rounded-full text-yellow-500 hover:bg-yellow-200 transition-colors duration-200"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </motion.button>
          </Tooltip>
        </div>
      </motion.div>
      <Menu.Item
        key="1"
        className="hover:bg-indigo-50 rounded-lg transition-colors duration-200"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full text-left py-3 px-4 font-semibold text-gray-700 flex items-center"
        >
          <UserOutlined className="mr-3 text-indigo-500" />
          Role: {userInfo.role}
        </motion.button>
      </Menu.Item>
      {userInfo.role === "admin" && (
        <Menu.Item
          key="2"
          className="hover:bg-indigo-50 rounded-lg transition-colors duration-200"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full text-left py-3 px-4 font-semibold text-gray-700 flex items-center"
            onClick={showChangePasswordModal}
          >
            <LockOutlined className="mr-3 text-indigo-500" />
            Change Password
          </motion.button>
        </Menu.Item>
      )}
      <Menu.Item
        key="3"
        className="hover:bg-indigo-50 rounded-lg transition-colors duration-200"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full text-left py-3 px-4 font-semibold text-gray-700 flex items-center"
        >
          <SettingOutlined className="mr-3 text-indigo-500" />
          Settings
        </motion.button>
      </Menu.Item>
      <Menu.Divider className="my-3 border-indigo-100" />
      <Menu.Item
        key="4"
        className="hover:bg-red-50 rounded-lg transition-colors duration-200"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-full text-left py-3 px-4 font-semibold text-red-600 flex items-center"
        >
          <FaSignOutAlt className="mr-3" />
          Logout
        </motion.button>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="relative">
      <StyledDropdown
        overlay={userMenu}
        trigger={["click"]}
        placement="bottomRight"
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer flex items-center space-x-2 bg-white rounded-full py-1 px-4 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <UserAvatar
            size={24}
            icon={<FaUserCircle className="text-white" />}
          />
          <span className="text-xs font-medium text-gray-700">
            {user.user_name}{" "}
          </span>
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 20 20"
            animate={{ rotate: showNotification ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <path d="M0 7 L 20 7 L 10 16" fill="#6B7280" />
          </motion.svg>
        </motion.div>
      </StyledDropdown>
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4"
          >
            <h4 className="text-lg font-semibold mb-2">Notifications</h4>
            <p className="text-sm text-gray-600">
              You have no new notifications.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <Modal
        title="Change Password"
        visible={isChangePasswordModalVisible}
        onCancel={handleChangePasswordCancel}
        footer={null}
      >
        <Form
          form={form}
          name="changePassword"
          onFinish={handleChangePasswordSubmit}
          layout="vertical"
        >
          <Form.Item
            name="oldPassword"
            label="Old Password"
            rules={[
              {
                required: true,
                message: "Please input your old password!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              {
                required: true,
                message: "Please input your new password!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <div className="flex justify-end">
              <Button
                key="cancel"
                onClick={handleChangePasswordCancel}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button key="submit" type="primary" htmlType="submit">
                Change Password
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserInfo;
