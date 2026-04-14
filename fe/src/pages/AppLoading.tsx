import React, { useEffect, useState } from "react";
import { Loader2, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLoadingProps {
  variant?: "default" | "gradient" | "dots" | "pulse" | "wave";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  text?: string;
  className?: string;
}

const AppLoading: React.FC<AppLoadingProps> = ({
  variant = "default",
  size = "md",
  showText = true,
  text = "Loading application...",
  className,
}) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (variant === "gradient") {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900",
          className
        )}
      >
        <div className="text-center space-y-8">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="w-24 h-24 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin mx-auto"></div>
            {/* Inner pulsing circle */}
            <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse opacity-20"></div>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
          </div>

          {showText && (
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RISE
              </h2>
              <p className="text-gray-600 dark:text-gray-300 animate-pulse">
                {text}
                {dots}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center bg-white dark:bg-gray-900",
          className
        )}
      >
        <div className="text-center space-y-8">
          <div className="flex space-x-2 justify-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 bg-blue-500 rounded-full animate-bounce",
                  `animation-delay-${i * 100}`
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "1.4s",
                }}
              ></div>
            ))}
          </div>

          {showText && (
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                RISE
              </h2>
              <p
                className={cn(
                  "text-gray-600 dark:text-gray-300",
                  textSizeClasses[size]
                )}
              >
                {text}
                {dots}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900",
          className
        )}
      >
        <div className="text-center space-y-8">
          <div className="relative flex items-center justify-center">
            {/* Outer pulse rings */}
            <div className="absolute w-32 h-32 bg-blue-400 rounded-full animate-ping opacity-20"></div>
            <div className="absolute w-24 h-24 bg-blue-500 rounded-full animate-ping opacity-30 animation-delay-300"></div>
            <div className="absolute w-16 h-16 bg-blue-600 rounded-full animate-ping opacity-40 animation-delay-600"></div>

            {/* Center circle */}
            <div className="relative w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>

          {showText && (
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                RISE
              </h2>
              <p
                className={cn(
                  "text-gray-600 dark:text-gray-300",
                  textSizeClasses[size]
                )}
              >
                {text}
                {dots}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "wave") {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800",
          className
        )}
      >
        <div className="text-center space-y-8">
          <div className="flex items-end space-x-1 justify-center">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-2 bg-gradient-to-t from-blue-500 to-blue-400 rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.sin(i * 0.5) * 15}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "1s",
                }}
              ></div>
            ))}
          </div>

          {showText && (
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                RISE
              </h2>
              <p
                className={cn(
                  "text-gray-600 dark:text-gray-300",
                  textSizeClasses[size]
                )}
              >
                {text}
                {dots}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-white dark:bg-gray-900",
        className
      )}
    >
      <div className="text-center space-y-6">
        <div className="relative">
          <Loader2
            className={cn(
              "animate-spin text-blue-500 mx-auto",
              sizeClasses[size]
            )}
          />
          <div className="absolute inset-0 border-2 border-blue-200 dark:border-blue-800 rounded-full animate-ping opacity-30"></div>
        </div>

        {showText && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              RISE
            </h2>
            <p
              className={cn(
                "text-gray-600 dark:text-gray-300",
                textSizeClasses[size]
              )}
            >
              {text}
              {dots}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLoading;
