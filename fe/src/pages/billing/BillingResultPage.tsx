import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { billingApi } from "@/api/billing.api";
import { VNPAY_ERROR_MESSAGES } from "@/types/billing.type";
import type { Subscription } from "@/types/billing.type";

const BillingResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status"); // 'success' | 'failed'
  const orderCode = searchParams.get("orderCode") || "";
  const errorCode = searchParams.get("code") || "";

  const isSuccess = status === "success";

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [polling, setPolling] = useState(false);
  const [copied, setCopied] = useState(false);
  const pollCount = useRef(0);

  // Polling fallback — wait for IPN to activate subscription
  useEffect(() => {
    if (!isSuccess) return;

    setPolling(true);
    const interval = setInterval(async () => {
      pollCount.current++;
      try {
        const sub = await billingApi.getSubscription();
        if (sub && sub.status === "ACTIVE") {
          setSubscription(sub);
          setPolling(false);
          clearInterval(interval);
        }
      } catch {
        // ignore
      }
      if (pollCount.current >= 10) {
        setPolling(false);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isSuccess]);

  const handleCopyOrderCode = () => {
    navigator.clipboard.writeText(orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const errorMessage =
    VNPAY_ERROR_MESSAGES[errorCode] || "An unknown error occurred.";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Status Banner */}
          <div
            className={`px-8 py-10 text-center ${
              isSuccess
                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                : "bg-gradient-to-br from-red-500 to-rose-600"
            }`}
          >
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
              {isSuccess ? (
                <CheckCircle2 className="w-10 h-10 text-white" />
              ) : (
                <XCircle className="w-10 h-10 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {isSuccess ? "Payment Successful!" : "Payment Failed"}
            </h1>
            <p className="text-white/80 text-sm">
              {isSuccess
                ? "Your subscription has been activated."
                : errorMessage}
            </p>
          </div>

          {/* Details */}
          <div className="px-8 py-6 space-y-4">
            {/* Order Code */}
            {orderCode && (
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">
                    Order Code
                  </p>
                  <p className="text-sm font-mono font-semibold text-gray-900 mt-0.5">
                    {orderCode}
                  </p>
                </div>
                <button
                  onClick={handleCopyOrderCode}
                  className="p-2 rounded-lg hover:bg-gray-200 transition text-gray-400 hover:text-gray-700"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}

            {/* Success: Subscription Info */}
            {isSuccess && subscription && (
              <div className="bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-100">
                <p className="text-[11px] text-indigo-500 uppercase tracking-wide font-semibold">
                  Active Plan
                </p>
                <p className="text-lg font-bold text-indigo-700 mt-0.5">
                  {subscription.plan.displayName}
                </p>
                <p className="text-xs text-indigo-500 mt-1">
                  Expires:{" "}
                  {new Date(subscription.endDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}

            {/* Polling Indicator */}
            {isSuccess && polling && !subscription && (
              <div className="flex items-center gap-3 bg-yellow-50 rounded-xl px-4 py-3 border border-yellow-100">
                <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />
                <p className="text-sm text-yellow-700">
                  Confirming your subscription...
                </p>
              </div>
            )}

            {/* Failed: Error Code */}
            {!isSuccess && errorCode && (
              <div className="bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                <p className="text-[11px] text-red-500 uppercase tracking-wide font-semibold">
                  Error Code
                </p>
                <p className="text-sm font-mono text-red-700 mt-0.5">
                  VNPAY-{errorCode}
                </p>
                <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 space-y-3">
            <button
              onClick={() => navigate("/dashboard")}
              className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                isSuccess
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-200"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {isSuccess ? "Go to Dashboard" : "Back to Plans"}
              <ArrowRight className="w-4 h-4" />
            </button>
            {!isSuccess && (
              <button
                onClick={() => navigate("/plans")}
                className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Try Again
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Questions about your payment?{" "}
          <a href="mailto:support@taskee.vn" className="text-indigo-500 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};

export default BillingResultPage;
