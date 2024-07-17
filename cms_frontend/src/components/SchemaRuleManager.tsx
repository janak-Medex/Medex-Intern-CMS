import React, { useState, useEffect } from "react";
import { Modal, Input, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { FaTrash, FaEdit } from "react-icons/fa";
import {
  getSchemaRules,
  addSchemaRule,
  updateSchemaRule,
  deleteSchemaRule,
} from "../api/component.api";
import { SchemaRule } from "./types";

const SchemaRuleManager: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState<boolean>(false);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [schemaRulesData, setSchemaRulesData] = useState<SchemaRule[]>([]);
  const [filteredSchemaRules, setFilteredSchemaRules] = useState<SchemaRule[]>(
    []
  );
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<SchemaRule | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    if (Array.isArray(schemaRulesData)) {
      const filtered = schemaRulesData.filter((rule: SchemaRule) =>
        rule.fieldName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSchemaRules(filtered);
      setCurrentPage(1);
    }
  }, [schemaRulesData, searchTerm]);

  const totalPages = Math.ceil(filteredSchemaRules.length / itemsPerPage);
  const currentData = filteredSchemaRules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleInsertRule = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFieldName("");
    setFieldType("");
    setIsRequired(false);
    setEditMode(false);
    setEditingRule(null);
    setIsModalOpen(false);
  };

  const handleAddSchemaRule = async () => {
    if (!fieldName.trim() || !fieldType) {
      message.error("Field Name and Field Type are required");
      return;
    }

    const fieldNameExists = schemaRulesData.some(
      (rule) =>
        rule.fieldName.toLowerCase() === fieldName.toLowerCase() &&
        (!editMode || rule._id !== editingRule?._id)
    );

    if (fieldNameExists) {
      message.error(
        "A field with this name already exists. Please choose a different name."
      );
      return;
    }

    const newRule = {
      fieldName,
      type: fieldType,
      required: isRequired,
    };

    try {
      if (editMode && editingRule) {
        await updateSchemaRule(editingRule._id, newRule);
        message.success("Schema rule updated successfully!");
      } else {
        await addSchemaRule(newRule);
        message.success("New schema rule added successfully!");
      }

      handleCloseModal();
      viewAllSchema();
    } catch (error) {
      console.error("Error processing schema rule:", error);
      message.error("An error occurred while processing the schema rule.");
    }
  };

  const viewAllSchema = async () => {
    setIsSchemaModalOpen(true);
    try {
      const response = await getSchemaRules();
      if (response && response.success && Array.isArray(response.data)) {
        setSchemaRulesData(response.data);
        setFilteredSchemaRules(response.data);
        message.success("Schema Rules fetched successfully!");
      } else {
        throw new Error("Invalid data structure received from API");
      }
    } catch (error) {
      console.error("Error fetching schemas:", error);
      message.error("Failed to fetch schema rules");
      setSchemaRulesData([]);
      setFilteredSchemaRules([]);
    }
  };

  const handleCloseSchemaModal = () => {
    setIsSchemaModalOpen(false);
  };

  const onSchemaRuleDelete = async (id: string) => {
    try {
      await deleteSchemaRule(id);
      message.success("Schema Rule deleted successfully!");
      viewAllSchema();
    } catch (error) {
      console.error("Error deleting schema rule:", error);
      message.error("Failed to delete schema rule.");
    }
  };

  const handleEditSchemaRule = (rule: SchemaRule) => {
    setEditMode(true);
    setEditingRule({ ...rule, originalFieldName: rule.fieldName });
    setFieldName(rule.fieldName);
    setFieldType(rule.type);
    setIsRequired(rule.required);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex gap-4 justify-center mb-8">
        <button
          type="button"
          onClick={handleInsertRule}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors duration-300"
        >
          Add New Schema Rule
        </button>
        <button
          type="button"
          className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none transition-colors duration-300"
          onClick={viewAllSchema}
        >
          View all Schema
        </button>
      </div>

      {/* Add/Edit Schema Rule Modal */}
      <Modal
        title={editMode ? "Edit Schema Rule" : "Add New Schema Rule"}
        open={isModalOpen}
        onOk={handleAddSchemaRule}
        onCancel={handleCloseModal}
        centered
      >
        <form className="space-y-4">
          <div>
            <label
              htmlFor="fieldName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Field Name
            </label>
            <input
              type="text"
              id="fieldName"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="fieldType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Field Type
            </label>
            <select
              id="fieldType"
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{editMode ? fieldType : "Select a type"}</option>
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="object">Object</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRequired"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isRequired"
              className="ml-2 block text-sm text-gray-900"
            >
              Required
            </label>
          </div>
        </form>
      </Modal>

      {/* View All Schema Rules Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <span>View all Schema Rules</span>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search..."
              style={{ width: 170, marginLeft: "auto", marginRight: "30px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        }
        open={isSchemaModalOpen}
        onCancel={handleCloseSchemaModal}
        width={700}
        centered
        footer={null}
      >
        <div>
          {filteredSchemaRules.length > 0 ? (
            <>
              <table className="w-full mb-4 border-collapse table-fixed">
                <thead className="cursor-pointer">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left w-3/4">
                      FieldName
                    </th>
                    <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left w-1/2">
                      Type
                    </th>
                    <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left w-1/2">
                      Required
                    </th>
                    <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left w-1/2">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((data: SchemaRule) => (
                    <tr key={data._id}>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className="flex justify-between">
                          <span className="mr-12">{data.fieldName}</span>
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {data.type}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {String(data.required)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className="flex gap-6">
                          <button onClick={() => onSchemaRuleDelete(data._id)}>
                            <FaTrash className="text-red-600" />
                          </button>
                          <button
                            className="focus:outline-none"
                            onClick={() => handleEditSchemaRule(data)}
                          >
                            <FaEdit className="text-gray-600" size={20} />
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 mx-1 border border-gray-300 bg-gray-100 rounded"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 mx-1 border border-gray-300 bg-gray-100 rounded"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <p>No matching rules found</p>
          )}
        </div>
      </Modal>
    </>
  );
};

export default SchemaRuleManager;
