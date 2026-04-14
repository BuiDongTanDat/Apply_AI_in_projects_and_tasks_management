import React, { useEffect, useState, useCallback } from "react";
import {
  Tabs,
  Upload,
  Button,
  List,
  Popconfirm,
  Spin,
  Space,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  InboxOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { documentApi } from "@/api/document.api";
import { Document, DocumentType } from "@/types/document.type";
import { alert } from "@/provider/AlertService";
import dayjs from "dayjs";
import { TaskCommentSection } from "./TaskCommentSection";

const { Text } = Typography;
const { Dragger } = Upload;

interface TaskDocumentsSectionProps {
  taskId?: number;        // undefined = task not yet created
  projectId?: number;
}

const getFileIcon = (mimeType?: string) => {
  if (!mimeType) return <PaperClipOutlined style={{ color: "#8c8c8c", fontSize: 16 }} />;
  if (mimeType.includes("pdf")) return <FilePdfOutlined style={{ color: "#ff4d4f", fontSize: 16 }} />;
  if (mimeType.includes("word") || mimeType.includes("wordprocessingml"))
    return <FileWordOutlined style={{ color: "#1677ff", fontSize: 16 }} />;
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
    return <FileExcelOutlined style={{ color: "#52c41a", fontSize: 16 }} />;
  if (mimeType.startsWith("image/"))
    return <FileImageOutlined style={{ color: "#722ed1", fontSize: 16 }} />;
  return <PaperClipOutlined style={{ color: "#8c8c8c", fontSize: 16 }} />;
};

const formatSize = (bytes?: number) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const DocPanel: React.FC<{
  taskId?: number;
  projectId?: number;
  docType: DocumentType;
}> = ({ taskId, projectId, docType }) => {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchDocs = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const res = await documentApi.getTaskDocuments(taskId, docType);
      setDocs(res.metadata || []);
    } catch (err) {
      console.error("Failed to load task documents:", err);
    } finally {
      setLoading(false);
    }
  }, [taskId, docType]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleUpload = async (file: File): Promise<boolean> => {
    if (!taskId || !projectId) {
      alert("Vui lòng lưu task trước khi tải tài liệu lên.", "Cảnh báo", "warning");
      return false;
    }
    setUploading(true);
    try {
      await documentApi.uploadDocument(file, {
        type: docType,
        projectId,
        taskId,
      });
      alert("Tải tài liệu thành công!", "Thành công", "success");
      fetchDocs();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload thất bại";
      alert(`Lỗi: ${msg}`, "Lỗi", "error");
    } finally {
      setUploading(false);
    }
    return false; // prevent antd default upload
  };

  const handleDelete = async (docId: number) => {
    try {
      await documentApi.deleteDocument(docId);
      alert("Đã xóa tài liệu!", "Thành công", "success");
      fetchDocs();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (!taskId || !projectId) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "#bbb",
          padding: "32px 0",
          fontSize: 13,
        }}
      >
        Lưu task để có thể tải tài liệu lên.
      </div>
    );
  }

  return (
    <Spin spinning={loading || uploading}>
      <Dragger
        multiple={false}
        showUploadList={false}
        beforeUpload={handleUpload}
        disabled={uploading}
        style={{ marginBottom: 16 }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text" style={{ fontSize: 13 }}>
          {uploading ? "Đang tải lên..." : "Kéo thả hoặc nhấn để chọn file"}
        </p>
        <p className="ant-upload-hint" style={{ fontSize: 12 }}>
          Hỗ trợ PDF, Word, Excel, ảnh và các loại file khác.
        </p>
      </Dragger>

      <List
        dataSource={docs}
        locale={{ emptyText: "Chưa có tài liệu nào." }}
        renderItem={(doc) => (
          <List.Item
            actions={[
              <Button
                key="download"
                type="text"
                icon={<DownloadOutlined />}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                title="Tải xuống"
              />,
              <Popconfirm
                key="delete"
                title="Xóa tài liệu này?"
                description="Hành động này không thể hoàn tác."
                onConfirm={() => handleDelete(doc.id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="text" danger icon={<DeleteOutlined />} title="Xóa" />
              </Popconfirm>,
            ]}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #f0f0f0",
              marginBottom: 8,
            }}
          >
            <List.Item.Meta
              avatar={getFileIcon(doc.mimeType)}
              title={
                <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13 }}>
                  {doc.name}
                </a>
              }
              description={
                <Space size={8}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {formatSize(doc.size)}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {dayjs(doc.createdAt).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Spin>
  );
};

export const TaskDocumentsSection: React.FC<TaskDocumentsSectionProps> = ({
  taskId,
  projectId,
}) => {
  const tabsItems = [
    {
      key: "task-description",
      label: "Description documents",
      children: (
        <DocPanel
          taskId={taskId}
          projectId={projectId}
          docType={DocumentType.TASK_DESCRIPTION}
        />
      ),
    },
    {
      key: "task-result",
      label: "Result documents",
      children: (
        <DocPanel
          taskId={taskId}
          projectId={projectId}
          docType={DocumentType.TASK_RESULT}
        />
      ),
    },
    {
      key: "comment",
      label: "Comments",
      children: (
          <div>
            {taskId && <TaskCommentSection taskId={taskId} />}
          </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 mt-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-0">
        Tài liệu & Thảo luận
      </h4>
      <Tabs items={tabsItems} size="small" />
    </div>
  );
};
