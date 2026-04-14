import { Modal, Spin } from "antd";
import { useEffect, useMemo, useState } from "react";
import type { AiReviewPerformanceMetadata } from "@/types/performance.type";
import { taskApi } from "@/api/task.api";
import { alert } from "@/provider/AlertService";

interface Props {
  open: boolean;
  onClose: () => void;
  teamId: number;
  userId: number | null;
  userName?: string;
  fromAt: number;
  toAt: number;
}

export default function PerformanceAiReviewModal({
  open,
  onClose,
  teamId,
  userId,
  userName,
  fromAt,
  toAt,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AiReviewPerformanceMetadata | null>(null);

  const title = useMemo(() => {
    const who = userName?.trim() ? userName.trim() : userId ? `User #${userId}` : "Member";
    return `AI review · ${who}`;
  }, [userId, userName]);

  useEffect(() => {
    if (!open) return;
    setData(null);
    if (!userId) return;

    setLoading(true);
    taskApi
      .aiReviewPerformance({ userId, teamId, fromAt, toAt })
      .then((res) => setData(res.metadata))
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "AI review failed";
        alert(msg, "Error", "error");
      })
      .finally(() => setLoading(false));
  }, [open, userId, teamId, fromAt, toAt]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={860}
      centered
      destroyOnHidden
      title={<span className="text-sm font-semibold text-gray-900">{title}</span>}
    >
      <Spin spinning={loading} tip="AI is reviewing...">
        {!userId ? (
          <div className="py-10 text-center text-sm text-gray-500">
            Please select a member to review.
          </div>
        ) : !data?.review ? (
          <div className="py-10 text-center text-sm text-gray-500">
            No review data.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Performance review
              </div>
              <div className="mt-2 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                {data.review.performance_review}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Improvement suggestions
              </div>
              <div className="mt-2 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                {data.review.improvement_suggestions}
              </div>
            </div>


          </div>
        )}
      </Spin>
    </Modal>
  );
}

