import React, { useState, useEffect, useRef } from "react";
import {
  Avatar,
  Input,
  Button,
  Upload,
  List,
  Typography,
  Space,
  App,
  Image,
  Empty,
  Spin,
} from "antd";
import {
  Paperclip,
  Send,
  ImageIcon,
  FileText,
  Download,
  X,
  Clock,
} from "lucide-react";
import dayjs from "dayjs";
import { useAppSelector } from "@/store/hook";
import { taskApi } from "@/api/task.api";
import { TaskComment } from "@/types/task-comment.type";
import type { UploadFile } from "antd/es/upload/interface";

const { TextArea } = Input;
const { Text } = Typography;

interface TaskCommentSectionProps {
  taskId: number;
}

export const TaskCommentSection: React.FC<TaskCommentSectionProps> = ({
  taskId,
}) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { user } = useAppSelector((state) => state.userInfo);
  const { message } = App.useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await taskApi.getTaskComments(taskId);
      setComments(res.metadata || []);
    } catch (error: any) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  useEffect(() => {
    // Scroll to bottom when new comments are added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSubmit = async () => {
    if (!content.trim() && fileList.length === 0) return;
    if (!user) {
      message.error("You must be logged in to comment");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    if (content.trim()) formData.append("content", content.trim());
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("attachment", fileList[0].originFileObj);
    }

    try {
      await taskApi.createTaskComment(taskId, formData, user.id);
      setContent("");
      setFileList([]);
      await fetchComments();
      message.success("Comment added successfully");
    } catch (error: any) {
      message.error(error.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const renderAttachment = (comment: TaskComment) => {
    const doc = comment.document;
    if (!doc) return null;

    const isImage = doc.mimeType?.startsWith("image/");

    return (
      <div className="mt-2 rounded-lg border border-gray-100 bg-white p-2 max-w-sm">
        {isImage ? (
          <Image
            src={doc.url}
            alt={doc.name}
            className="rounded-md object-cover"
            style={{ maxWidth: 300 }}
            fallback="https://placehold.co/300x200?text=Image+not+found"
          />
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-50 text-blue-500">
              <FileText size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-xs font-medium text-gray-700">
                {doc.name}
              </div>
              <div className="text-[10px] text-gray-400">
                {(doc.size ? doc.size / 1024 : 0).toFixed(1)} KB
              </div>
            </div>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-500"
            >
              <Download size={16} />
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          Comments
          <span className="bg-white px-2 py-0.5 rounded-full border border-gray-200 text-[10px] text-gray-500">
            {comments.length}
          </span>
        </h3>
      </div>

      {/* Comment List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 min-h-[300px] max-h-[500px]"
      >
        {loading && comments.length === 0 ? (
          <div className="flex h-full items-center justify-center py-10">
            <Spin tip="Loading comments..." />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10">
            <Empty description="No comments yet. Start the conversation!" />
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <Avatar
                src={comment.author?.avatar}
                className="flex-shrink-0 border border-gray-200"
              >
                {comment.author?.name?.charAt(0)}
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 leading-none">
                      {comment.author?.name}
                    </span>
                    {comment.author?.position && (
                      <span className="text-[10px] text-gray-400 leading-none bg-gray-100 px-1.5 py-0.5 rounded">
                        {comment.author.position}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 leading-none">
                    <Clock size={10} />
                    {dayjs(comment.createdAt).format("MMM D, HH:mm")}
                  </span>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </div>
                {renderAttachment(comment)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="relative rounded-xl border border-gray-200 bg-gray-50 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
          <TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            autoSize={{ minRows: 2, maxRows: 6 }}
            className="!border-none !bg-transparent !shadow-none !px-4 !pt-3 !pb-10 text-sm"
            onPressEnter={(e) => {
              if (e.shiftKey) return;
              e.preventDefault();
              handleSubmit();
            }}
          />
          
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList.slice(-1))}
              beforeUpload={() => false}
              showUploadList={false}
            >
              <Button
                type="text"
                size="small"
                icon={<Paperclip size={16} className="text-gray-400" />}
                className="hover:bg-white hover:text-blue-500 transition-colors"
                title="Attach a file"
              />
            </Upload>
            {fileList.length > 0 && (
              <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-lg border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-1">
                <div className="flex items-center gap-1.5 max-w-[150px]">
                  {fileList[0].type?.startsWith("image/") ? (
                    <ImageIcon size={12} className="text-blue-500" />
                  ) : (
                    <FileText size={12} className="text-blue-500" />
                  )}
                  <span className="text-[10px] font-medium text-gray-600 truncate">
                    {fileList[0].name}
                  </span>
                </div>
                <button
                  onClick={() => setFileList([])}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          <div className="absolute bottom-2 right-2">
            <Button
              type="primary"
              shape="circle"
              icon={<Send size={16} />}
              onClick={handleSubmit}
              loading={submitting}
              disabled={!content.trim() && fileList.length === 0}
              className="bg-blue-600 shadow-md shadow-blue-100 hover:scale-105 transition-transform"
            />
          </div>
        </div>
        <div className="mt-2 text-[10px] text-gray-400 text-center">
          Press <kbd className="px-1 py-0.5 rounded border border-gray-200 bg-gray-50">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded border border-gray-200 bg-gray-50">Shift + Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
};
