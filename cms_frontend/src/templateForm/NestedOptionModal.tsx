// NestedOption.tsx
import React from "react";
import { NestedOptionType } from "./types";
import {
  Collapse,
  Input,
  Button,
  Switch,
  Space,
  Card,
  Typography,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";

const { Panel } = Collapse;
const { Title } = Typography;

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
          style={{ width: "100%" }}
          title={
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
                style={{ width: 250 }}
              />
              <Tooltip title={item.isPackage ? "Package" : "Option"}>
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
              </Tooltip>
            </Space>
          }
          extra={
            <Space>
              <Tooltip title="Add Sub-option">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleNestedOptionAdd(fieldIndex, currentPath)}
                />
              </Tooltip>
              <Tooltip title="Remove Option">
                <Button
                  type="primary"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() =>
                    handleNestedOptionRemove(fieldIndex, currentPath)
                  }
                />
              </Tooltip>
            </Space>
          }
        >
          <Space direction="vertical" className="w-full" size="large">
            {item.isPackage && (
              <Card className="mt-2" style={{ background: "#f0f2f5" }}>
                <Title level={5}>Key-Value Pairs</Title>
                {item.keyValuePairs && item.keyValuePairs.length > 0 ? (
                  item.keyValuePairs.map((pair, pairIndex) => (
                    <Space key={pairIndex} className="mb-2">
                      <Input
                        value={pair.key}
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
                        style={{ width: 200 }}
                      />
                      <Input
                        value={pair.value}
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
                        style={{ width: 200 }}
                      />
                      <Tooltip title="Remove Key-Value Pair">
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
                      </Tooltip>
                    </Space>
                  ))
                ) : (
                  <Typography.Text type="secondary">
                    No key-value pairs added yet.
                  </Typography.Text>
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
              <Collapse
                className="mt-2"
                expandIcon={({ isActive }) => (
                  <DownOutlined rotate={isActive ? 180 : 0} />
                )}
              >
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
      style={{
        height: "calc(100vh - 200px)",
        overflowY: "auto",
        padding: "20px",
        width: "100%",
      }}
    >
      <Title level={3}>Nested Options</Title>
      {options.length === 0 ? (
        <Card>
          <Typography.Text type="secondary">
            No options added yet. Click "Add Root Option" to start.
          </Typography.Text>
        </Card>
      ) : (
        renderNestedOptions(options)
      )}
      <Button
        type="primary"
        onClick={() => handleNestedOptionAdd(fieldIndex, [])}
        icon={<PlusOutlined />}
        className="mt-4"
        size="large"
      >
        Add Root Option
      </Button>
    </div>
  );
};

export default NestedOption;
