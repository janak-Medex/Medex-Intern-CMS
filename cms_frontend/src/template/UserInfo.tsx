// UserInfo.tsx
import React, { useState, useEffect } from "react";
import { Menu, Dropdown, Avatar } from "antd";
import { LogoutOutlined, DownOutlined, UserOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import { decodeToken } from "../utils/JwtUtils";
import { logout } from "../api/auth.api";

interface UserInfoProps {
  onLogout: () => void;
}

interface UserData {
  user_name: string;
  role: "admin" | "user";
}

const UserInfo: React.FC<UserInfoProps> = ({ onLogout }) => {
  const [userInfo, setUserInfo] = useState<UserData | null>(null);

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

  if (!userInfo) {
    return null;
  }

  const userMenu = (
    <Menu className="bg-gradient-to-br from-white to-blue-50 shadow-xl rounded-xl p-6 w-72">
      <div className="flex flex-col items-center mb-6 pt-4">
        <Avatar
          src={""}
          size={80}
          icon={<UserOutlined className="text-blue-500" />}
          className="border-4 border-blue-200 shadow-md bg-gray-100"
        />
        <h3 className="text-2xl font-bold mt-3 text-gray-800">
          {userInfo.user_name}
        </h3>
        <p className="text-sm text-blue-500 font-medium">Welcome Back</p>
      </div>
      <Menu.Item
        key="1"
        className="hover:bg-blue-100 rounded-lg transition-colors duration-200"
      >
        <button className="w-full text-left py-3 px-4 font-semibold text-gray-700 flex items-center">
          <UserOutlined className="mr-3 text-blue-500" />
          Role: {userInfo.role}
        </button>
      </Menu.Item>
      <Menu.Divider className="my-3 border-blue-100" />
      <Menu.Item
        key="2"
        className="hover:bg-red-100 rounded-lg transition-colors duration-200"
      >
        <button
          onClick={handleLogout}
          className="w-full text-left py-3 px-4 font-semibold text-red-600 flex items-center"
        >
          <LogoutOutlined className="mr-3" />
          Logout
        </button>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={userMenu} trigger={["click"]} placement="bottomRight">
      <div className="cursor-pointer flex items-center space-x-2 bg-gray-100 rounded-full py-1 px-3 hover:bg-gray-200 transition-colors duration-300">
        <Avatar
          src="https://example.com/default-avatar.png"
          size={32}
          className="border-4 border-blue-200 shadow-md bg-gray-100"
          icon={<UserOutlined className="text-blue-500" />}
        />
        <span className="text-sm font-medium text-gray-700">
          {userInfo.user_name}
        </span>
        <DownOutlined style={{ fontSize: "12px" }} />
      </div>
    </Dropdown>
  );
};

export default UserInfo;
