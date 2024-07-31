import React from "react";
import { Layout, Menu } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  SortAscendingOutlined,
  FormOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import LottieLogo from "./LottieLogo";

const { Sider } = Layout;
const { SubMenu } = Menu;

const colors = {
  primary: "#3D7BF4",
  secondary: "#2C5ED9",
  background: "#F0F4F8",
  text: "#2D3748",
  sidebarBg: "#FFFFFF",
  sidebarText: "#718096",
  sidebarHover: "#EBF4FF",
  sidebarActive: "#3D7BF4",
};

const StyledSider = styled(Sider)`
  background: ${colors.sidebarBg};
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
`;

const Logo = styled(motion.div)<{ collapsed: boolean }>`
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: ${colors.sidebarBg};
  border-bottom: 1px solid #e2e8f0;
`;

const StyledMenu = styled(Menu)`
  flex: 1;
  border-right: none;
  background: ${colors.sidebarBg};

  .ant-menu-item,
  .ant-menu-submenu-title {
    margin: 4px 8px;
    height: 44px;
    display: flex;
    align-items: center;
    color: ${colors.sidebarText};
    transition: all 0.3s ease;
    border-radius: 6px;

    .anticon {
      font-size: 18px;
    }

    &:hover {
      color: ${colors.primary};
      background-color: ${colors.sidebarHover};
    }
  }

  .ant-menu-item-selected {
    background-color: ${colors.sidebarActive};
    color: white;
    font-weight: 500;

    &:hover {
      color: white;
      background-color: ${colors.sidebarActive};
    }

    &::after {
      display: none;
    }
  }

  .ant-menu-submenu-title:hover {
    color: ${colors.primary};
  }

  .ant-menu-submenu-selected > .ant-menu-submenu-title {
    color: ${colors.primary};
  }
`;

const CollapseButton = styled.div`
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  color: ${colors.sidebarText};
  transition: all 0.3s ease;
  border-top: 1px solid #e2e8f0;

  &:hover {
    color: ${colors.primary};
    background-color: ${colors.sidebarHover};
  }
`;

type SortKey = "template name" | "updatedAt" | "is_active";

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  handleCreateTemplate: () => void;
  handleViewChange: (view: "grid" | "list") => void;
  requestSort: (key: SortKey) => void;
  handleFormSubmissionsClick: (type: "booking" | "generic") => void;
  setShowUserManagement: (show: boolean) => void;
  userRole: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onCollapse,
  handleCreateTemplate,
  handleViewChange,
  requestSort,
  handleFormSubmissionsClick,
  setShowUserManagement,
  userRole,
}) => {
  const toggleCollapsed = () => {
    onCollapse(!collapsed);
  };

  return (
    <StyledSider width={240} collapsible collapsed={collapsed} trigger={null}>
      <Logo collapsed={collapsed}>
        <AnimatePresence>
          {collapsed ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              style={{ width: 40, height: 40 }}
            >
              <img src="./logo.ico" />
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              style={{ width: 180, height: 40 }}
            >
              <LottieLogo />
            </motion.div>
          )}
        </AnimatePresence>
      </Logo>
      <StyledMenu theme="light" mode="inline" defaultSelectedKeys={["1"]}>
        <Menu.Item
          key="1"
          icon={<PlusOutlined />}
          onClick={handleCreateTemplate}
        >
          {!collapsed && "New Template"}
        </Menu.Item>
        <Menu.Item
          key="2"
          icon={<UnorderedListOutlined />}
          onClick={() => handleViewChange("list")}
        >
          {!collapsed && "List View"}
        </Menu.Item>
        <Menu.Item
          key="3"
          icon={<AppstoreOutlined />}
          onClick={() => handleViewChange("grid")}
        >
          {!collapsed && "Grid View"}
        </Menu.Item>
        <SubMenu
          key="4"
          icon={<SortAscendingOutlined />}
          title={!collapsed ? "Sort By" : ""}
        >
          <Menu.Item key="4-1" onClick={() => requestSort("template name")}>
            Name
          </Menu.Item>
          <Menu.Item key="4-2" onClick={() => requestSort("updatedAt")}>
            Last Edited
          </Menu.Item>
          <Menu.Item key="4-3" onClick={() => requestSort("is_active")}>
            Status
          </Menu.Item>
        </SubMenu>
        {userRole === "admin" && (
          <>
            <SubMenu
              key="5"
              icon={<FormOutlined />}
              title={!collapsed ? "Form Submissions" : ""}
            >
              <Menu.Item
                key="5-1"
                onClick={() => handleFormSubmissionsClick("booking")}
              >
                Booking Forms
              </Menu.Item>
              <Menu.Item
                key="5-2"
                onClick={() => handleFormSubmissionsClick("generic")}
              >
                Generic Forms
              </Menu.Item>
            </SubMenu>
            <Menu.Item
              key="6"
              icon={<UserAddOutlined />}
              onClick={() => setShowUserManagement(true)}
            >
              {!collapsed && "Create User"}
            </Menu.Item>
          </>
        )}
      </StyledMenu>
      <CollapseButton onClick={toggleCollapsed}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </CollapseButton>
    </StyledSider>
  );
};

export default Sidebar;
