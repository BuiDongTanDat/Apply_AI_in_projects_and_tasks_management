import { useState } from "react";
import { ThumbsUp, ThumbsDown, Check, MessageSquare } from "lucide-react";
import { aiFeedbackApi } from "@/api/ai-feedback.api";
import { FeedbackValue } from "@/types/ai-feedback.type";
import { alert } from "@/provider/AlertService";

interface AiFeedbackButtonsProps {
  feedbackId: number | null;
  /** Called after feedback is successfully submitted */
  onDone?: () => void;
  /** Optional label shown before the buttons */
  label?: string;
}

type SubmitState = "idle" | "submitting" | "done";

/**
 * Reusable 👍 / 👎 explicit feedback widget.
 * Renders nothing when feedbackId is null.
 */
export const AiFeedbackButtons = ({
  feedbackId,
  onDone,
  label = "Was this helpful?",
}: AiFeedbackButtonsProps) => {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [chosenValue, setChosenValue] = useState<FeedbackValue | null>(null);

  if (!feedbackId) return null;

  if (submitState === "done") {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium animate-fadeIn">
        <Check className="w-3.5 h-3.5" />
        Thanks for your feedback!
      </div>
    );
  }

  const submit = async (value: FeedbackValue, commentText?: string) => {
    setSubmitState("submitting");
    try {
      await aiFeedbackApi.submitExplicit(feedbackId, {
        feedback: value,
        comment: commentText || undefined,
      });
      setSubmitState("done");
      setShowComment(false);
      onDone?.();
    } catch {
      setSubmitState("idle");
      alert("Failed to submit feedback", "Error", "error");
    }
  };

  const handleThumbsUp = () => {
    setChosenValue(FeedbackValue.Positive);
    submit(FeedbackValue.Positive);
  };

  const handleThumbsDown = () => {
    setChosenValue(FeedbackValue.Negative);
    setShowComment(true);
  };

  const handleCommentSubmit = () => {
    submit(FeedbackValue.Negative, comment);
  };

  const handleCommentSkip = () => {
    submit(FeedbackValue.Negative);
    setShowComment(false);
  };

  return (
    <div className="inline-flex flex-col gap-2">
      {/* Button row */}
      <div className="inline-flex items-center gap-2">
        {label && (
          <span className="text-xs text-gray-400 font-medium">{label}</span>
        )}
        <button
          type="button"
          disabled={submitState === "submitting"}
          onClick={handleThumbsUp}
          title="Helpful"
          className={`
            inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
            border transition-all duration-200 disabled:opacity-50
            ${
              chosenValue === FeedbackValue.Positive
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-white border-gray-200 text-gray-500 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
            }
          `}
        >
          <ThumbsUp className="w-3 h-3" />
          Good
        </button>

        <button
          type="button"
          disabled={submitState === "submitting"}
          onClick={handleThumbsDown}
          title="Not helpful"
          className={`
            inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
            border transition-all duration-200 disabled:opacity-50
            ${
              chosenValue === FeedbackValue.Negative
                ? "bg-red-50 border-red-300 text-red-700"
                : "bg-white border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
            }
          `}
        >
          <ThumbsDown className="w-3 h-3" />
          Could be better
        </button>
      </div>

      {/* Inline comment box after dislike */}
      {showComment && (
        <div className="flex flex-col gap-1.5 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MessageSquare className="w-3 h-3" />
            Tell us what was wrong (optional):
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="e.g. Story point was too high..."
            className="w-full resize-none rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700
                       placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-300"
          />
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleCommentSubmit}
              disabled={submitState === "submitting"}
              className="px-3 py-1 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {submitState === "submitting" ? "Sending..." : "Send"}
            </button>
            <button
              type="button"
              onClick={handleCommentSkip}
              disabled={submitState === "submitting"}
              className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
