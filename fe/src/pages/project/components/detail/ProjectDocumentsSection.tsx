import React, { useEffect, useState, useCallback } from "react";
import {
  Tabs,
  Table,
  Button,
  Modal,
  Upload,
  Popconfirm,
  Spin,
  Tag,
  Space,
  Typography,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
  InboxOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { Project } from "@/types/project.type";
import { documentApi } from "@/api/document.api";
import { Document, DocumentType } from "@/types/document.type";
import { alert } from "@/provider/AlertService";
import dayjs from "dayjs";

const { Text } = Typography;
const { Dragger } = Upload;

interface ProjectDocumentsSectionProps {
  project: Project;
}

const getFileIcon = (mimeType?: string) => {
  if (!mimeType) return <PaperClipOutlined style={{ color: "#8c8c8c", fontSize: 18 }} />;
  if (mimeType.includes("pdf")) return <FilePdfOutlined style={{ color: "#ff4d4f", fontSize: 18 }} />;
  if (mimeType.includes("word") || mimeType.includes("wordprocessingml"))
    return <FileWordOutlined style={{ color: "#1677ff", fontSize: 18 }} />;
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
    return <FileExcelOutlined style={{ color: "#52c41a", fontSize: 18 }} />;
  if (mimeType.startsWith("image/"))
    return <FileImageOutlined style={{ color: "#722ed1", fontSize: 18 }} />;
  return <PaperClipOutlined style={{ color: "#8c8c8c", fontSize: 18 }} />;
};

const formatSize = (bytes?: number) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

export const ProjectDocumentsSection: React.FC<ProjectDocumentsSectionProps> = ({ project }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await documentApi.getProjectDocuments(project.id);
      setDocuments(res.metadata || []);
    } catch (err) {
      console.error("Failed to load project documents:", err);
    } finally {
      setLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleOpenUploadModal = () => {
    setFileList([]);
    setUploadModalOpen(true);
  };

  const handleUploadOk = async () => {
    if (fileList.length === 0) {
      alert("Please select a file to upload.", "Warning", "warning");
      return;
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const uploadFile of fileList) {
      if (!uploadFile.originFileObj) continue;
      try {
        await documentApi.uploadDocument(uploadFile.originFileObj, {
          type: DocumentType.PROJECT,
          projectId: project.id,
        });
        successCount++;
      } catch (err) {
        console.error("Upload failed for:", uploadFile.name, err);
        failCount++;
      }
    }

    setUploading(false);
    setUploadModalOpen(false);
    setFileList([]);

    if (successCount > 0) {
      alert(
        `${successCount} file(s) uploaded successfully!${failCount > 0 ? ` ${failCount} failed.` : ""}`,
        "Success",
        "success"
      );
      fetchDocuments();
    } else {
      alert("Upload failed. Please try again.", "Error", "error");
    }
  };

  const handleDelete = async (docId: number) => {
    try {
      await documentApi.deleteDocument(docId);
      alert("Document deleted successfully!", "Success", "success");
      fetchDocuments();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const draggerProps: UploadProps = {
    multiple: true,
    beforeUpload: (file) => {
      // Prevent auto-upload; store files to upload manually on OK
      setFileList((prev) => [...prev, { ...file, originFileObj: file, uid: file.uid, name: file.name, status: "done" } as UploadFile]);
      return false;
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    },
    fileList,
  };

  const columns = [
    {
      title: "File",
      dataIndex: "name",
      key: "name",
      render: (_: any, doc: Document) => (
        <Space>
          {getFileIcon(doc.mimeType)}
          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-medium">
            {doc.name}
          </a>
        </Space>
      ),
    },
    {
      title: "Loại",
      dataIndex: "mimeType",
      key: "mimeType",
      width: 160,
      render: (mimeType?: string) => {
        if (!mimeType) return <Tag>Khác</Tag>;
        if (mimeType.includes("pdf")) return <Tag color="red">PDF</Tag>;
        if (mimeType.includes("word") || mimeType.includes("wordprocessingml"))
          return <Tag color="blue">Word</Tag>;
        if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
          return <Tag color="green">Excel</Tag>;
        if (mimeType.startsWith("image/")) return <Tag color="purple">Ảnh</Tag>;
        return <Tag>{mimeType.split("/")[1]?.toUpperCase() || "File"}</Tag>;
      },
    },
    {
      title: "Kích thước",
      dataIndex: "size",
      key: "size",
      width: 120,
      render: (size?: number) => <Text type="secondary">{formatSize(size)}</Text>,
    },
    {
      title: "Ngày tải lên",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (date: string) => (
        <Text type="secondary">{dayjs(date).format("DD/MM/YYYY HH:mm")}</Text>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 110,
      render: (_: any, doc: Document) => (
        <Space>
          <Button
            type="text"
            icon={<DownloadOutlined />}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Tải xuống"
          />
          <Popconfirm
            title="Xóa tài liệu này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(doc.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const documentsTab = (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenUploadModal}
        >
          Thêm tài liệu
        </Button>
      </div>
      <Spin spinning={loading}>
        <Table
          dataSource={documents}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          locale={{ emptyText: "Chưa có tài liệu nào." }}
        />
      </Spin>

      {/* Upload Modal */}
      <Modal
        title="Tải lên tài liệu"
        open={uploadModalOpen}
        onOk={handleUploadOk}
        onCancel={() => {
          setUploadModalOpen(false);
          setFileList([]);
        }}
        okText="Tải lên"
        cancelText="Hủy"
        confirmLoading={uploading}
        destroyOnHidden
      >
        <Dragger {...draggerProps} style={{ marginTop: 12 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Kéo thả hoặc nhấn để chọn file</p>
          <p className="ant-upload-hint">
            Hỗ trợ PDF, Word, Excel, ảnh và các loại file khác.
          </p>
        </Dragger>
      </Modal>
    </div>
  );

  const dailyReportTab = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
        color: "#8c8c8c",
      }}
    >
      Tính năng báo cáo hằng ngày đang được phát triển.
    </div>
  );

  const tabsItems = [
    {
      key: "daily-report",
      label: "Báo cáo hằng ngày",
      children: dailyReportTab,
    },
    {
      key: "documents",
      label: "Tài liệu",
      children: documentsTab,
    },
  ];

  return (
    <div className="detail-section project-documents-section">
      <Tabs items={tabsItems} defaultActiveKey="documents" />
    </div>
  );
};
