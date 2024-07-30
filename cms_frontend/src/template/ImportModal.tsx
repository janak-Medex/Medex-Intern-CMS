import React, { useState } from "react";
import { Modal, Input, Collapse, List, Button, Tooltip, Tag } from "antd";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import { BiChevronRight } from "react-icons/bi";
import { DownloadOutlined } from "@ant-design/icons";
import { TableData } from "./types";
import {
  FaCode,
  FaFile,
  FaImage,
  FaTable,
  FaVideo,
  FaWpforms,
} from "react-icons/fa";

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
  existingTemplateComponentNames: string[];
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
  existingTemplateComponentNames,
}) => {
  const [importedComponents, setImportedComponents] = useState<string[]>([]);

  const getComponentIcon = (componentName: string) => {
    if (componentName.includes("Video"))
      return <FaVideo className="text-red-500" />;
    if (componentName.includes("Image"))
      return <FaImage className="text-purple-500" />;
    if (componentName.includes("File"))
      return <FaFile className="text-blue-500" />;
    if (componentName.includes("Table"))
      return <FaTable className="text-green-500" />;
    if (componentName.includes("form"))
      return <FaWpforms className="text-yellow-500" />;
    return <FaCode className="text-orange-500" />;
  };

  const getComponentColor = (componentName: string) => {
    if (componentName.includes("Video")) return "red";
    if (componentName.includes("Image")) return "purple";
    if (componentName.includes("File")) return "blue";
    if (componentName.includes("Table")) return "green";
    if (componentName.includes("form")) return "yellow";
    return "orange";
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

  const generateUniqueName = (baseName: string) => {
    let newName = baseName;
    let counter = 1;
    while (
      existingTemplateComponentNames.includes(newName) ||
      importedComponents.includes(newName)
    ) {
      newName = `${baseName}_${counter}`;
      counter++;
    }
    return newName;
  };

  const handleImport = async (component: any) => {
    const uniqueName = generateUniqueName(component.component_name);
    const modifiedComponent = { ...component, component_name: uniqueName };
    await handleImportComponent(modifiedComponent);
    setImportedComponents([...importedComponents, uniqueName]);
  };

  return (
    <Modal
      title={null}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={1000}
      footer={null}
      closeIcon={
        <IoCloseOutline className="text-black text-3xl bg-white rounded-full border border-gray-300" />
      }
      className="rounded-2xl overflow-hidden shadow-2xl"
      bodyStyle={{ padding: 0 }}
    >
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">
            Import Existing Components
          </h2>
          <Input
            placeholder="Search components..."
            prefix={<IoSearchOutline className="text-gray-400" />}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 rounded-full border-none text-lg"
            size="large"
          />
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto p-8 custom-scrollbar bg-gray-50">
        <Collapse
          activeKey={activeTemplateKey}
          onChange={(key) => handleTemplateChange(key as string)}
          className="bg-white shadow-md rounded-xl"
          expandIcon={({ isActive }) => (
            <BiChevronRight
              className={`w-6 h-6 text-indigo-600 transition-transform duration-300 ${
                isActive ? "transform rotate-90" : ""
              }`}
            />
          )}
        >
          {filteredTableData.map((data, index) => (
            <Panel
              header={
                <div className="flex items-center justify-between py-4 px-3">
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-white">
                        {data.templateName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-indigo-700 text-2xl">
                        {data.templateName}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        Last updated: {formatDate(data.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Tag
                      color="indigo"
                      className="px-3 py-1 text-sm font-medium rounded-full"
                    >
                      {data.componentArray.length} components
                    </Tag>
                  </div>
                </div>
              }
              key={index.toString()}
              className="border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-300"
            >
              <List
                itemLayout="horizontal"
                dataSource={data.componentArray}
                renderItem={(component) => (
                  <List.Item
                    key={component.component_name}
                    className="py-5 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                  >
                    <div className="flex items-center justify-between w-full px-6">
                      <div className="flex items-center space-x-5">
                        <div
                          className={`text-3xl text-${getComponentColor(
                            component.component_name
                          )}-500`}
                        >
                          {getComponentIcon(component.component_name)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-lg">
                            {component.component_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Type:{" "}
                            {component.component_name
                              .split(/(?=[A-Z])/)
                              .join(" ")}
                          </div>
                        </div>
                      </div>
                      <Tooltip title="Import Component" key="import">
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={() => handleImport(component)}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-none shadow-md transition duration-300 text-sm px-6 py-2 rounded-full"
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
