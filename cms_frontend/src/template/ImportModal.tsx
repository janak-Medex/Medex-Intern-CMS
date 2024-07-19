import React from "react";
import { Modal, Input, Collapse, List, Button, Tooltip } from "antd";
import { IoSearchOutline } from "react-icons/io5";
import { BiChevronRight } from "react-icons/bi";
import { DownloadOutlined } from "@ant-design/icons";
import { TableData } from "./types";
import { FaCode, FaFile, FaImage, FaTable, FaVideo } from "react-icons/fa";

const { Panel } = Collapse;

interface ImportModalProps {
  isModalOpen: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredTableData: TableData[];
  activeTemplateKey: string | string[];
  handleTemplateChange: (key: string | string[]) => void;
  handleImportComponent: (component: any) => Promise<void>;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isModalOpen,
  handleOk,
  handleCancel,
  setSearchTerm,
  filteredTableData,
  activeTemplateKey,
  handleTemplateChange,
  handleImportComponent,
}) => {
  const getComponentIcon = (componentName: string) => {
    const lowerName = componentName.toLowerCase();
    if (lowerName.includes("video"))
      return <FaVideo className="text-red-500" />;
    if (lowerName.includes("image"))
      return <FaImage className="text-purple-500" />;
    if (lowerName.includes("file")) return <FaFile className="text-blue-500" />;
    if (lowerName.includes("table"))
      return <FaTable className="text-green-500" />;
    return <FaCode className="text-orange-500" />;
  };

  function formatDate(updatedAt: any) {
    if (!updatedAt) return "N/A";

    const date = new Date(updatedAt);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <Modal
      title={null}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={900}
      footer={null}
      className="rounded-2xl overflow-hidden"
      bodyStyle={{ padding: 0 }}
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Import Existing Components
          </h2>
          <Input
            placeholder="Search components..."
            prefix={<IoSearchOutline className="text-gray-400" />}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-72 rounded-full border-none"
          />
        </div>
      </div>

      <div className="max-h-[65vh] overflow-y-auto p-6 custom-scrollbar">
        <Collapse
          activeKey={activeTemplateKey}
          onChange={(key) => handleTemplateChange(key as string)}
          className="bg-white shadow-sm rounded-xl"
          expandIcon={({ isActive }) => (
            <BiChevronRight
              className={`w-5 h-5 text-indigo-600 transition-transform duration-200 ${
                isActive ? "transform rotate-90" : ""
              }`}
            />
          )}
        >
          {filteredTableData.map((data, index) => (
            <Panel
              header={
                <div className="flex items-center justify-between py-3 px-2">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-2xl font-bold text-white">
                        {data.templateName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-indigo-700 text-xl">
                        {data.templateName}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        Last updated: {formatDate(data.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                      {data.componentArray.length} components
                    </span>
                  </div>
                </div>
              }
              key={index.toString()}
              className="border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
            >
              <List
                itemLayout="horizontal"
                dataSource={data.componentArray}
                renderItem={(component) => (
                  <List.Item
                    key={component.component_name}
                    className="py-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between w-full px-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl text-indigo-600">
                          {getComponentIcon(component.component_name)}
                        </div>
                        <div className="font-medium text-gray-800">
                          {component.component_name}
                        </div>
                      </div>
                      <Tooltip title="Import Component" key="import">
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={() => handleImportComponent(component)}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-none shadow-md transition duration-300 text-sm px-4 py-2 rounded-full"
                        >
                          Import
                        </Button>
                      </Tooltip>
                    </div>
                  </List.Item>
                )}
              />
            </Panel>
          ))}
        </Collapse>
      </div>
    </Modal>
  );
};

export default React.memo(ImportModal);
