// NestedOptionModal.tsx

import React from "react";
import { Collapse, Input, Button, Switch, Space, Card } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { NestedOptionType } from "./types";

const { Panel } = Collapse;

interface NestedOptionModalProps {
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

const NestedOptionModal: React.FC<NestedOptionModalProps> = ({
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
  const renderNestedOptions = (
    data: NestedOptionType[],
    parentPath: number[] = []
  ) => {
    return data.map((item, index) => {
      const currentPath = [...parentPath, index];
      const key = currentPath.join("-");

      return (
        <Card
          key={key}
          className="mb-4"
          extra={
            <Space>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => handleNestedOptionAdd(fieldIndex, currentPath)}
              />
              <Button
                type="text"
                danger
                icon={<MinusCircleOutlined />}
                onClick={() =>
                  handleNestedOptionRemove(fieldIndex, currentPath)
                }
              />
            </Space>
          }
        >
          <Space direction="vertical" className="w-full">
            <Space>
              <Input
                value={item.label}
                onChange={(e) =>
                  handleNestedOptionChange(
                    fieldIndex,
                    currentPath,
                    e.target.value
                  )
                }
                placeholder={`Option ${currentPath.join(".")}`}
                style={{ width: 200 }}
              />
              <Switch
                checked={item.isPackage}
                onChange={(checked) =>
                  handleNestedOptionPackageToggle(
                    fieldIndex,
                    currentPath,
                    checked
                  )
                }
                checkedChildren="Package"
                unCheckedChildren="Option"
              />
            </Space>

            {item.isPackage && (
              <Card className="mt-2">
                <h4>Key-Value Pairs</h4>
                {Object.entries(item.keyValuePairs || {}).map(
                  ([key, value], pairIndex) => (
                    <Space key={pairIndex} className="mb-2">
                      <Input
                        value={key}
                        onChange={(e) =>
                          handleNestedOptionKeyValuePairChange(
                            fieldIndex,
                            currentPath,
                            pairIndex,
                            "key",
                            e.target.value
                          )
                        }
                        placeholder="Key"
                        style={{ width: 150 }}
                      />
                      <Input
                        value={value as string}
                        onChange={(e) =>
                          handleNestedOptionKeyValuePairChange(
                            fieldIndex,
                            currentPath,
                            pairIndex,
                            "value",
                            e.target.value
                          )
                        }
                        placeholder="Value"
                        style={{ width: 150 }}
                      />
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() =>
                          handleNestedOptionKeyValuePairRemove(
                            fieldIndex,
                            currentPath,
                            pairIndex
                          )
                        }
                      />
                    </Space>
                  )
                )}
                <Button
                  type="dashed"
                  onClick={() =>
                    handleNestedOptionKeyValuePairAdd(fieldIndex, currentPath)
                  }
                  icon={<PlusOutlined />}
                  className="mt-2"
                >
                  Add Key-Value Pair
                </Button>
              </Card>
            )}

            {item.options && item.options.length > 0 && (
              <Collapse className="mt-2">
                <Panel header="Sub-options" key="1">
                  {renderNestedOptions(item.options, currentPath)}
                </Panel>
              </Collapse>
            )}
          </Space>
        </Card>
      );
    });
  };

  return (
    <div
      className="nested-option-modal"
      style={{ height: 500, overflowY: "auto", padding: "20px", width: "100%" }}
    >
      {renderNestedOptions(options)}
      <Button
        type="dashed"
        onClick={() => handleNestedOptionAdd(fieldIndex, [])}
        icon={<PlusOutlined />}
        className="mt-4"
      >
        Add Root Option
      </Button>
    </div>
  );
};

export default NestedOptionModal;
