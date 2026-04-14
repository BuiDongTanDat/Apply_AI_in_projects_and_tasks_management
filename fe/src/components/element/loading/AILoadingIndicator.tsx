import { Sparkles } from "lucide-react";

interface AILoadingIndicatorProps {
  message?: string;
}

export const AILoadingIndicator = ({
  message = "AI is processing...",
}: AILoadingIndicatorProps) => {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
      <div className="relative">
        <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
        <div className="absolute inset-0 animate-ping">
          <Sparkles className="w-5 h-5 text-purple-400 opacity-75" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-purple-900">{message}</span>
        <div className="flex gap-1">
          <span
            className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></span>
          <span
            className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></span>
          <span
            className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></span>
        </div>
      </div>
    </div>
  );
};
