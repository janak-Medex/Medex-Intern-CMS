import React, { useState } from "react";
import { Input, Button, Tooltip } from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  FolderOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { NestedOption as NestedOptionType } from "./types";

interface NestedOptionProps {
  option: string | NestedOptionType;
  path: number[];
  onAdd: (path: number[]) => void;
  onRemove: (path: number[]) => void;
  onChange: (path: number[], value: string, isGroup: boolean) => void;
  depth?: number;
}

const NestedOption: React.FC<NestedOptionProps> = ({
  option,
  path,
  onAdd,
  onRemove,
  onChange,
  depth = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const handleToggle = () => setIsExpanded(!isExpanded);
  const isGroup = typeof option !== "string";

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
                    ${
                      isGroup
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50"
                        : "bg-white"
                    }
                    ${isHovered ? "shadow-md" : "shadow-sm"}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
      >
        {isGroup && (
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
        )}
        {!isGroup && (
          <FileOutlined style={{ fontSize: "1.2em", color: "#718096" }} />
        )}
        <Input
          value={isGroup ? option.label : option}
          onChange={(e) => onChange(path, e.target.value, isGroup)}
          placeholder={`${isGroup ? "Group" : "Option"} ${path.join(".")}`}
          className={`flex-grow ${
            isGroup ? "font-semibold text-indigo-700" : "text-gray-700"
          } 
                      border-none bg-transparent focus:ring-2 focus:ring-blue-300`}
        />
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
        {isGroup && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 pl-4 border-l-2 border-indigo-200"
          >
            {option.options.map((subOption, index) => (
              <NestedOption
                key={index}
                option={subOption}
                path={[...path, index]}
                onAdd={onAdd}
                onRemove={onRemove}
                onChange={onChange}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NestedOption;
