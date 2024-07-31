import React, { useState } from "react";
import { Input, Button, Tooltip, Switch, Space } from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  FolderOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

interface KeyValuePair {
  key: string;
  value: string | File;
}

interface NestedOptionType {
  label: string;
  isPackage: boolean;
  options?: (string | NestedOptionType)[];
  keyValuePairs?: KeyValuePair[];
}

interface NestedOptionProps {
  option: NestedOptionType;
  path: number[];
  onAdd: (path: number[]) => void;
  onRemove: (path: number[]) => void;
  onChange: (path: number[], value: string) => void;
  onPackageToggle: (path: number[], isPackage: boolean) => void;
  onKeyValuePairAdd: (path: number[]) => void;
  onKeyValuePairChange: (
    path: number[],
    index: number,
    key: "key" | "value",
    value: string
  ) => void;
  onKeyValuePairRemove: (path: number[], index: number) => void;
  depth?: number;
}

const NestedOption: React.FC<NestedOptionProps> = ({
  option,
  path,
  onAdd,
  onRemove,
  onChange,
  onPackageToggle,
  onKeyValuePairAdd,
  onKeyValuePairChange,
  onKeyValuePairRemove,
  depth = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const handleToggle = () => setIsExpanded(!isExpanded);

  const iconVariants = {
    expanded: { rotate: 90 },
    collapsed: { rotate: 0 },
  };

  return (
    <motion.div
      className={`mb-3 ${depth > 0 ? "ml-6" : ""}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 ease-in-out
                    bg-gradient-to-r from-blue-50 to-indigo-50
                    ${isHovered ? "shadow-md" : "shadow-sm"}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
      >
        <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
          <motion.div
            variants={iconVariants}
            animate={isExpanded ? "expanded" : "collapsed"}
            onClick={handleToggle}
            className="cursor-pointer text-blue-500 hover:text-blue-700"
          >
            <FolderOutlined style={{ fontSize: "1.2em" }} />
          </motion.div>
        </Tooltip>
        <Input
          value={option.label}
          onChange={(e) => onChange(path, e.target.value)}
          placeholder={`Group ${path.join(".")}`}
          className="flex-grow font-semibold text-indigo-700 border-none bg-transparent focus:ring-2 focus:ring-blue-300"
        />
        <Space>
          <Switch
            checked={option.isPackage}
            onChange={(checked) => onPackageToggle(path, checked)}
            checkedChildren="Package"
            unCheckedChildren="Option"
          />
        </Space>
        <Tooltip title="Add">
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => onAdd(path)}
            className="text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full"
          />
        </Tooltip>
        <Tooltip title="Remove">
          <Button
            type="text"
            size="small"
            danger
            icon={<MinusCircleOutlined />}
            onClick={() => onRemove(path)}
            className="hover:bg-red-100 rounded-full"
          />
        </Tooltip>
      </motion.div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 pl-4 border-l-2 border-indigo-200"
          >
            {option.isPackage ? (
              <div className="mb-2">
                {option.keyValuePairs?.map((pair, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      value={pair.key}
                      onChange={(e) =>
                        onKeyValuePairChange(path, index, "key", e.target.value)
                      }
                      placeholder="Key"
                      className="flex-1"
                    />
                    <Input
                      value={pair.value as string}
                      onChange={(e) =>
                        onKeyValuePairChange(
                          path,
                          index,
                          "value",
                          e.target.value
                        )
                      }
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => onKeyValuePairRemove(path, index)}
                    />
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={() => onKeyValuePairAdd(path)}
                  className="w-full mt-2"
                  icon={<PlusOutlined />}
                >
                  Add Key-Value Pair
                </Button>
              </div>
            ) : (
              <>
                {option.options?.map((subOption, index) =>
                  typeof subOption === "string" ? (
                    <div
                      key={index}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <FileOutlined
                        style={{ fontSize: "1.2em", color: "#718096" }}
                      />
                      <Input
                        value={subOption}
                        onChange={(e) =>
                          onChange([...path, index], e.target.value)
                        }
                        placeholder={`Option ${[...path, index].join(".")}`}
                        className="flex-grow text-gray-700 border-none bg-transparent focus:ring-2 focus:ring-blue-300"
                      />
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => onRemove([...path, index])}
                        className="hover:bg-red-100 rounded-full"
                      />
                    </div>
                  ) : (
                    <NestedOption
                      key={index}
                      option={subOption}
                      path={[...path, index]}
                      onAdd={onAdd}
                      onRemove={onRemove}
                      onChange={onChange}
                      onPackageToggle={onPackageToggle}
                      onKeyValuePairAdd={onKeyValuePairAdd}
                      onKeyValuePairChange={onKeyValuePairChange}
                      onKeyValuePairRemove={onKeyValuePairRemove}
                      depth={depth + 1}
                    />
                  )
                )}
                <Button
                  type="dashed"
                  onClick={() => onAdd(path)}
                  className="w-full mt-2"
                  icon={<PlusOutlined />}
                >
                  Add Option
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NestedOption;
