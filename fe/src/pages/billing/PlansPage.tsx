import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle,
  X as XIcon,
  Zap,
  ArrowLeft,
  Loader2,
  Crown,
  Shield,
  Clock,
  Receipt,
} from "lucide-react";
import { billingApi } from "@/api/billing.api";
import type {
  Plan,
  BillingCycle,
  Subscription,
  PaymentHistory,
} from "@/types/billing.type";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n,
  );

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const FEATURE_LABELS: Record<string, string> = {
  aiAssistant: "AI Assistant",
  advancedAnalytics: "Advanced Analytics",
  prioritySupport: "Priority Support",
  customBranding: "Custom Branding",
  apiAccess: "API Access",
  exportReports: "Export Reports",
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  FREE: <Zap className="w-6 h-6" />,
  PRO: <Crown className="w-6 h-6" />,
  ENTERPRISE: <Shield className="w-6 h-6" />,
};

const ACTION_COLORS: Record<string, string> = {
  CREATED: "bg-gray-100 text-gray-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-yellow-100 text-yellow-700",
};

type PlansTab = "plans" | "history";

const PlansPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");
  const [upgrading, setUpgrading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<PlansTab>("plans");

  // User subscription state
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);

  // Transaction history state
  const [transactions, setTransactions] = useState<PaymentHistory[]>([]);
  const [txTotal, setTxTotal] = useState(0);
  const [txPage, setTxPage] = useState(1);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    billingApi
      .getPlans()
      .then((p) => {
        const active = p.filter((plan) => plan.isActive);
        if (active.length > 0) setPlans(active);
      })
      .catch(() => {});

    // Fetch current subscription
    billingApi
      .getSubscription()
      .then(setSubscription)
      .catch(() => {})
      .finally(() => setSubLoading(false));
  }, []);

  // Fetch transaction history when tab is active or page changes
  useEffect(() => {
    if (activeTab !== "history") return;
    setTxLoading(true);
    billingApi
      .getTransactionHistory({ page: txPage, limit: 10 })
      .then((res) => {
        setTransactions(res.data || []);
        setTxTotal(res.total || 0);
      })
      .catch(() => {
        setTransactions([]);
        setTxTotal(0);
      })
      .finally(() => setTxLoading(false));
  }, [activeTab, txPage]);

  const handleUpgrade = async (plan: Plan) => {
    if (plan.name === "FREE") {
      navigate("/dashboard");
      return;
    }

    // Already on this plan and active
    if (
      subscription &&
      subscription.planId === plan.id &&
      subscription.status === "ACTIVE"
    ) {
      return;
    }

    setUpgrading(plan.id);
    try {
      const res = await billingApi.createPayment({
        planId: plan.id,
        billingCycle,
      });
      // Redirect to VNPAY gateway
      window.location.href = res.paymentUrl;
    } catch (error) {
      console.error("Payment creation failed:", error);
      setUpgrading(null);
    }
  };

  const getButtonLabel = (plan: Plan) => {
    if (plan.name === "FREE") {
      // If user has no subscription or expired, FREE is current
      if (!subscription || subscription.status !== "ACTIVE")
        return "Current Plan";
      return "Downgrade";
    }
    if (
      subscription &&
      subscription.planId === plan.id &&
      subscription.status === "ACTIVE"
    ) {
      return "Current Plan";
    }
    return "Upgrade Now";
  };

  const isCurrentPlan = (plan: Plan) => {
    if (plan.name === "FREE") {
      return !subscription || subscription.status !== "ACTIVE";
    }
    return (
      subscription?.planId === plan.id && subscription?.status === "ACTIVE"
    );
  };

  const getPrice = (plan: Plan) =>
    billingCycle === "MONTHLY" ? plan.monthlyPrice : plan.yearlyPrice;

  const getMonthlyEquivalent = (plan: Plan) =>
    billingCycle === "YEARLY"
      ? Math.round(plan.yearlyPrice / 12)
      : plan.monthlyPrice;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2 text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Plans & Billing</h1>
          <p className="text-gray-500 mt-1">
            Manage your subscription and view transaction history.
          </p>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 border-b border-gray-200 -mb-6">
            <button
              onClick={() => setActiveTab("plans")}
              className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
                activeTab === "plans"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Plans
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px flex items-center gap-2 ${
                activeTab === "history"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Receipt className="w-4 h-4" />
              Transaction History
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Current Subscription Banner */}
        {!subLoading && (
          <div className="mb-8">
            {subscription && subscription.status === "ACTIVE" ? (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    {PLAN_ICONS[subscription.plan.name] || (
                      <Crown className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-indigo-600 font-semibold">
                      Current Plan
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {subscription.plan.displayName}
                      <span className="ml-2 text-xs font-medium text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full">
                        {subscription.billingCycle}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">
                      Expires
                    </p>
                    <p className="font-semibold text-gray-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(subscription.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">
                      Auto-Renew
                    </p>
                    <p className="font-semibold text-gray-700">
                      {subscription.autoRenew ? "On" : "Off"}
                    </p>
                  </div>
                </div>
              </div>
            ) : subscription && subscription.status === "EXPIRED" ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <p className="text-yellow-800 font-semibold">
                  Your <strong>{subscription.plan.displayName}</strong> plan
                  expired on {formatDate(subscription.endDate)}. Please renew to
                  continue using premium features.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <p className="text-gray-600">
                  You're currently on the <strong>Free</strong> plan. Upgrade to
                  unlock more features.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===== PLANS TAB ===== */}
        {activeTab === "plans" && (
          <>
            {/* Billing Cycle Toggle */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex items-center bg-white rounded-full p-1 border border-gray-200 shadow-sm">
                <button
                  onClick={() => setBillingCycle("MONTHLY")}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    billingCycle === "MONTHLY"
                      ? "bg-gray-900 text-white shadow"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("YEARLY")}
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                    billingCycle === "YEARLY"
                      ? "bg-gray-900 text-white shadow"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Yearly
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500 text-white font-bold">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>

            {/* Plan Cards */}
            <div className="grid md:grid-cols-3 gap-8 items-start">
              {plans.map((plan) => {
                const isPro = plan.name === "PRO";
                const isFree = plan.name === "FREE";
                const price = getPrice(plan);
                const monthlyEq = getMonthlyEquivalent(plan);
                const current = isCurrentPlan(plan);

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl p-8 transition-all duration-300 ${
                      current
                        ? "bg-white border-2 border-green-400 shadow-lg shadow-green-50"
                        : isPro
                          ? "bg-white border-2 border-indigo-500 shadow-xl shadow-indigo-100 scale-[1.02]"
                          : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg"
                    }`}
                  >
                    {current && (
                      <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-green-500 text-white text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Active
                      </div>
                    )}
                    {isPro && !current && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs font-bold">
                        Most Popular
                      </div>
                    )}

                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                        isPro
                          ? "bg-indigo-100 text-indigo-600"
                          : isFree
                            ? "bg-gray-100 text-gray-600"
                            : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {PLAN_ICONS[plan.name]}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {plan.displayName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      {plan.description}
                    </p>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">
                        {isFree ? "Free" : formatVND(monthlyEq)}
                      </span>
                      {!isFree && (
                        <span className="text-gray-400 ml-1">/ month</span>
                      )}
                      {billingCycle === "YEARLY" && !isFree && (
                        <p className="text-xs text-green-600 mt-1">
                          Billed {formatVND(price)} / year
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={upgrading === plan.id || isCurrentPlan(plan)}
                      className={`w-full py-3 rounded-xl font-semibold transition-all mb-8 flex items-center justify-center gap-2 ${
                        isCurrentPlan(plan)
                          ? "bg-gray-100 text-gray-500 cursor-default"
                          : isPro
                            ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:shadow-lg hover:shadow-indigo-200"
                            : isFree
                              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              : "bg-gray-900 text-white hover:bg-gray-800"
                      } disabled:opacity-50`}
                    >
                      {upgrading === plan.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        getButtonLabel(plan)
                      )}
                    </button>

                    {/* Limits */}
                    <div className="space-y-2 mb-6 pb-6 border-b border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Members</span>
                        <span className="font-medium text-gray-900">
                          {plan.maxMembers >= 999
                            ? "Unlimited"
                            : `Up to ${plan.maxMembers}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Projects</span>
                        <span className="font-medium text-gray-900">
                          {plan.maxProjects >= 999
                            ? "Unlimited"
                            : `Up to ${plan.maxProjects}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Storage</span>
                        <span className="font-medium text-gray-900">
                          {plan.maxStorage >= 50000
                            ? `${plan.maxStorage / 1000} GB`
                            : plan.maxStorage >= 1000
                              ? `${plan.maxStorage / 1000} GB`
                              : `${plan.maxStorage} MB`}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3">
                      {Object.entries(plan.features).map(([key, enabled]) => (
                        <li
                          key={key}
                          className={`flex items-center gap-2 text-sm ${
                            enabled ? "text-gray-700" : "text-gray-400"
                          }`}
                        >
                          {enabled ? (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <XIcon className="w-4 h-4 flex-shrink-0" />
                          )}
                          {FEATURE_LABELS[key] || key}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===== TRANSACTION HISTORY TAB ===== */}
        {activeTab === "history" && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {txLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No transactions yet.</p>
                <p className="text-xs mt-1">
                  Your payment history will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Date
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Order
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Plan
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Amount
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Cycle
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-3.5 text-gray-600">
                            {new Date(tx.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="font-mono text-xs text-gray-500">
                              {tx.order.orderCode}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-medium text-gray-900">
                            {tx.order.plan.displayName}
                          </td>
                          <td className="px-6 py-3.5 text-gray-700">
                            {formatVND(tx.order.amount)}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {tx.order.billingCycle}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ACTION_COLORS[tx.action] || "bg-gray-100 text-gray-700"}`}
                            >
                              {tx.action}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {txTotal > 10 && (
                  <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Showing {(txPage - 1) * 10 + 1}–
                      {Math.min(txPage * 10, txTotal)} of {txTotal}
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={txPage <= 1}
                        onClick={() => setTxPage((p) => p - 1)}
                        className="px-3 py-1 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        Previous
                      </button>
                      <button
                        disabled={txPage * 10 >= txTotal}
                        onClick={() => setTxPage((p) => p + 1)}
                        className="px-3 py-1 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlansPage;
