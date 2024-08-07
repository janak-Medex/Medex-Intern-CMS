// NestedOption.tsx
import React from "react";

import { NestedOptionType } from "./types";
import NestedOptionModal from "./NestedOptionModal";

interface NestedOptionProps {
  options: NestedOptionType[];
  fieldIndex: number;
  handleNestedOptionAdd: (fieldIndex: number, path: number[]) => void;
  handleNestedOptionRemove: (fieldIndex: number, path: number[]) => void;
  handleNestedOptionChange: (
    fieldIndex: number,
    path: number[],
    value: string
  ) => void;
  handleNestedOptionPackageToggle: (
    fieldIndex: number,
    path: number[],
    isPackage: boolean
  ) => void;
  handleNestedOptionKeyValuePairAdd: (
    fieldIndex: number,
    path: number[]
  ) => void;
  handleNestedOptionKeyValuePairChange: (
    fieldIndex: number,
    path: number[],
    pairIndex: number,
    key: "key" | "value",
    value: string
  ) => void;
  handleNestedOptionKeyValuePairRemove: (
    fieldIndex: number,
    path: number[],
    pairIndex: number
  ) => void;
}

const NestedOption: React.FC<NestedOptionProps> = ({
  options,
  fieldIndex,
  handleNestedOptionAdd,
  handleNestedOptionRemove,
  handleNestedOptionChange,
  handleNestedOptionPackageToggle,
  handleNestedOptionKeyValuePairAdd,
  handleNestedOptionKeyValuePairChange,
  handleNestedOptionKeyValuePairRemove,
}) => {
  return (
    <div>
      <NestedOptionModal
        options={options}
        fieldIndex={fieldIndex}
        handleNestedOptionAdd={handleNestedOptionAdd}
        handleNestedOptionRemove={handleNestedOptionRemove}
        handleNestedOptionChange={handleNestedOptionChange}
        handleNestedOptionPackageToggle={handleNestedOptionPackageToggle}
        handleNestedOptionKeyValuePairAdd={handleNestedOptionKeyValuePairAdd}
        handleNestedOptionKeyValuePairChange={
          handleNestedOptionKeyValuePairChange
        }
        handleNestedOptionKeyValuePairRemove={
          handleNestedOptionKeyValuePairRemove
        }
      />
    </div>
  );
};

export default NestedOption;
