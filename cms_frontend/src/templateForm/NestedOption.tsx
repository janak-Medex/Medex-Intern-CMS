import React, { useState } from "react";
import { Button, Modal } from "antd";
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
    value: string | File | File[]
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
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      <Button onClick={showModal}>Manage Nested Options</Button>
      <Modal
        title="Manage Nested Options"
        visible={isModalVisible}
        onCancel={handleModalClose}
        width={1200}
        footer={null}
      >
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
      </Modal>
    </div>
  );
};

export default NestedOption;
