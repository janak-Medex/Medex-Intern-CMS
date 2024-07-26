import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Input,
  Button,
  Pagination,
  Table,
  Tag,
  Typography,
  Tooltip,
  Spin,
  List,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { getFormSubmissions, FormSubmission } from "../api/forSubmission.api";

const { Text, Title } = Typography;

interface FormSubmissionsModalProps {
  show: boolean;
  onClose: () => void;
  formType: "booking" | "generic" | null;
}

const FormSubmissionsModal: React.FC<FormSubmissionsModalProps> = ({
  show,
  onClose,
  formType,
}) => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedSubmission, setSelectedSubmission] =
    useState<FormSubmission | null>(null);

  useEffect(() => {
    if (show && formType) fetchSubmissions();
  }, [show, formType]);

  const fetchSubmissions = async (page = 1, pageSize = 10) => {
    if (!formType) return;
    setLoading(true);
    try {
      const response = await getFormSubmissions(formType, { page, pageSize });
      setSubmissions(response.submissions);
      setPagination({
        current: response.page,
        pageSize,
        total: response.total,
      });
    } catch (error) {
      console.error("Failed to fetch form submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) =>
      Object.values(submission).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [submissions, searchText]);

  const handleViewDetails = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
  };

  const handleCloseDetails = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedSubmission(null);
  };

  const columns = [
    {
      title: "Template Name",
      dataIndex: "template_name",
      key: "template_name",
      render: (text: string) => (
        <Text className="font-semibold text-indigo-600">{text}</Text>
      ),
    },
    {
      title: "Form Name",
      dataIndex: "form_name",
      key: "form_name",
      render: (text: string) => (
        <Tag color="cyan" icon={<FileTextOutlined />} className="px-2 py-1">
          {text}
        </Tag>
      ),
    },
    {
      title: "Submitted On",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          <div className="flex items-center">
            <CalendarOutlined className="mr-2 text-gray-400" />
            <Text>{new Date(date).toLocaleDateString()}</Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: FormSubmission) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <Modal
      visible={show}
      onCancel={onClose}
      width="90%"
      footer={null}
      title={
        <Title level={3} className="text-gray-800 mb-0">
          {formType === "booking" ? "Booking" : "Generic"} Form Submissions
        </Title>
      }
      className="rounded-lg overflow-hidden"
      maskClosable={false}
      centered
    >
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6 ">
          <Input
            placeholder="Search submissions..."
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-64 rounded-full border-2 border-indigo-200 focus:border-indigo-400 transition-all duration-300"
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchSubmissions()}
            className="bg-white text-indigo-600 border-indigo-400 hover:bg-indigo-50 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Refresh
          </Button>
        </div>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <Table
              dataSource={filteredSubmissions}
              columns={columns}
              rowKey="_id"
              loading={loading}
              pagination={false}
              className="w-full"
              rowClassName="hover:bg-gray-50 transition-colors duration-200"
            />
          </motion.div>
        </AnimatePresence>
        <div className="mt-6 flex justify-center">
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={(page, pageSize) => fetchSubmissions(page, pageSize)}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `Total ${total} submissions`}
            className="custom-pagination"
          />
        </div>
      </div>
      <Modal
        visible={!!selectedSubmission}
        onCancel={handleCloseDetails}
        footer={null}
        width="80%"
        className="top-10"
        title={
          <div className="flex justify-between items-center ">
            <Title level={4} className="mb-0">
              Submission Details - {selectedSubmission?.template_name}
            </Title>
            <Button
              icon={<CloseCircleOutlined />}
              onClick={handleCloseDetails}
              className="border-none text-gray-500 hover:text-red-500 transition-colors duration-300"
            />
          </div>
        }
        maskClosable={false}
        centered
      >
        {selectedSubmission ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-4 custom-scrollbar"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg shadow-inner">
                <Text strong className="text-lg block mb-2 text-indigo-700">
                  Form Name:
                </Text>
                <Text className="text-lg">{selectedSubmission.form_name}</Text>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg shadow-inner">
                <Text strong className="text-lg block mb-2 text-purple-700">
                  Submission Date:
                </Text>
                <Text className="text-lg">
                  {new Date(selectedSubmission.createdAt).toLocaleString()}
                </Text>
              </div>
            </div>
            <div>
              <Title level={5} className="mb-4">
                Fields:
              </Title>
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 2, xxl: 3 }}
                dataSource={selectedSubmission.fields}
                renderItem={(field, index) => (
                  <List.Item>
                    <motion.div
                      className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Text strong className="text-indigo-600 block mb-2">
                        {field.fieldName}:
                      </Text>
                      <Text>
                        {field.value !== undefined
                          ? String(field.value)
                          : "N/A"}
                      </Text>
                    </motion.div>
                  </List.Item>
                )}
              />
            </div>
          </motion.div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        )}
      </Modal>
    </Modal>
  );
};

export default FormSubmissionsModal;
