import React, { useState } from "react";
import Modal from "../utils/Modal";

// Define the SchemaRule interface here
export interface SchemaRule {
  fieldName: string;
  type: string;
  required: boolean;
}

interface SchemaRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRule: (newRule: SchemaRule) => void;
}

const SchemaRuleModal: React.FC<SchemaRuleModalProps> = ({
  isOpen,
  onClose,
  onAddRule,
}) => {
  const [newRule, setNewRule] = useState<SchemaRule>({
    fieldName: "",
    type: "string",
    required: false,
  });

  const handleAddRule = () => {
    onAddRule(newRule);
    setNewRule({ fieldName: "", type: "string", required: false });
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Insert New Schema Rule</h2>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            placeholder="Enter Field Name"
            value={newRule.fieldName}
            onChange={(e) =>
              setNewRule({ ...newRule, fieldName: e.target.value })
            }
          />
          <div className="flex space-x-4">
            <div className="flex flex-col w-1/2">
              <label className="text-gray-700">Type</label>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                value={newRule.type}
                onChange={(e) =>
                  setNewRule({ ...newRule, type: e.target.value })
                }
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                {/* Add more types as needed */}
              </select>
            </div>
            <div className="flex flex-col w-1/2">
              <label className="text-gray-700">Required</label>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                value={newRule.required.toString()}
                onChange={(e) =>
                  setNewRule({
                    ...newRule,
                    required: e.target.value === "true",
                  })
                }
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          </div>
        </div>
        <button
          className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none mt-4"
          onClick={handleAddRule}
        >
          Add Rule
        </button>
      </div>
    </Modal>
  );
};

export default SchemaRuleModal;
