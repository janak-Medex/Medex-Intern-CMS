// NestedOption.tsx

import React from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { NestedOptionType } from "./types";

interface NestedOptionProps {
  option: NestedOptionType;
  path: number[];
  onAdd: (path: number[]) => void;
}

const NestedOption: React.FC<NestedOptionProps> = ({ option, path, onAdd }) => {
  if (!option) {
    return null;
  }

  return (
    <div className="mb-3 ml-6">
      <div className="flex items-center space-x-2 p-2 rounded-lg bg-white shadow-sm">
        <span>{option.label}</span>
        {option.isPackage ? (
          <span className="text-blue-500">(Package)</span>
        ) : (
          <span className="text-green-500">(Option)</span>
        )}
      </div>
      {!option.isPackage && (
        <div className="mt-2 pl-4">
          {option.options?.map((subOption, index) => (
            <NestedOption
              key={index}
              option={subOption}
              path={[...path, index]}
              onAdd={onAdd}
            />
          ))}
          <Button
            type="dashed"
            onClick={() => onAdd(path)}
            className="w-full mt-2"
            icon={<PlusOutlined />}
          >
            Add Option
          </Button>
        </div>
      )}
    </div>
  );
};

export default NestedOption;
