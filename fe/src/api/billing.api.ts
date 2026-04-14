import axiosInstance from "./axiosInstance";
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  DashboardOverview,
  MonthlyRevenueReport,
  Order,
  PaginatedResult,
  PaymentHistory,
  Plan,
  RecentOrder,
  RefundRequest,
  Subscription,
  YearlyRevenueReport,
} from "@/types/billing.type";

/** GET /plan — all plans (no auth) */
const getPlans = async (): Promise<Plan[]> => {
  const res = await axiosInstance.get("/plan");
  return res.data?.metadata ?? res.data;
};

/** GET /plan/:id — single plan (no auth) */
const getPlan = async (id: number): Promise<Plan> => {
  const res = await axiosInstance.get(`/plan/${id}`);
  return res.data?.metadata ?? res.data;
};

/** GET /billing/subscription — current user subscription (userId from auth header) */
const getSubscription = async (): Promise<Subscription | null> => {
  const res = await axiosInstance.get("/billing/subscription");
  return res.data?.metadata ?? null;
};

/** POST /billing/create-payment — create order & get VNPAY URL */
const createPayment = async (
  data: CreatePaymentRequest,
): Promise<CreatePaymentResponse> => {
  const res = await axiosInstance.post("/billing/create-payment", data);
  return res.data?.metadata ?? res.data;
};

/** GET /billing/orders — current user order history (userId from auth header) */
const getOrders = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<Order>> => {
  const res = await axiosInstance.get("/billing/orders", { params });
  return res.data?.metadata ?? { data: [], total: 0 };
};

/** GET /billing/transaction-history — current user transaction history */
const getTransactionHistory = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<PaymentHistory>> => {
  const res = await axiosInstance.get("/billing/transaction-history", {
    params,
  });
  return res.data?.metadata ?? { data: [], total: 0 };
};

/** GET /billing/query-transaction/:orderCode — query VNPAY status */
const queryTransaction = async (
  orderCode: string,
): Promise<Record<string, any>> => {
  const res = await axiosInstance.get(
    `/billing/query-transaction/${orderCode}`,
  );
  return res.data?.metadata ?? res.data;
};

/** POST /billing/refund — request refund */
const refund = async (data: RefundRequest): Promise<Record<string, any>> => {
  const res = await axiosInstance.post("/billing/refund", data);
  return res.data?.metadata ?? res.data;
};

/** POST /plan — create new plan (admin) */
const createPlan = async (
  data: Omit<Plan, "id" | "createdAt" | "updatedAt">,
): Promise<Plan> => {
  const res = await axiosInstance.post("/plan", data);
  return res.data?.metadata ?? res.data;
};

/** PATCH /plan/:id — update plan (admin) */
const updatePlan = async (
  id: number,
  data: Partial<Omit<Plan, "id" | "createdAt" | "updatedAt">>,
): Promise<Plan> => {
  const res = await axiosInstance.patch(`/plan/${id}`, data);
  return res.data?.metadata ?? res.data;
};

/** GET /billing/admin/orders — all orders (admin) */
const getAdminOrders = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<Order>> => {
  const res = await axiosInstance.get("/billing/admin/orders", { params });
  return res.data?.metadata ?? { data: [], total: 0 };
};

/** GET /billing/admin/transaction-history — all transaction history (admin) */
const getAdminTransactionHistory = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<PaymentHistory>> => {
  const res = await axiosInstance.get("/billing/admin/transaction-history", {
    params,
  });
  return res.data?.metadata ?? { data: [], total: 0 };
};

/** GET /billing/admin/dashboard/overview — dashboard overview (admin) */
const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const res = await axiosInstance.get("/billing/admin/dashboard/overview");
  return res.data?.metadata ?? res.data;
};

/** GET /billing/admin/dashboard/revenue/:year — yearly revenue report (admin) */
const getYearlyRevenue = async (year: number): Promise<YearlyRevenueReport> => {
  const res = await axiosInstance.get(
    `/billing/admin/dashboard/revenue/${year}`,
  );
  return res.data?.metadata ?? res.data;
};

/** GET /billing/admin/dashboard/revenue/:year/:month — monthly revenue report (admin) */
const getMonthlyRevenue = async (
  year: number,
  month: number,
): Promise<MonthlyRevenueReport> => {
  const res = await axiosInstance.get(
    `/billing/admin/dashboard/revenue/${year}/${month}`,
  );
  return res.data?.metadata ?? res.data;
};

/** GET /billing/admin/dashboard/recent-orders — recent orders (admin) */
const getRecentOrders = async (limit?: number): Promise<RecentOrder[]> => {
  const res = await axiosInstance.get(
    "/billing/admin/dashboard/recent-orders",
    {
      params: limit ? { limit } : undefined,
    },
  );
  return res.data?.metadata ?? [];
};

export const billingApi = {
  getPlans,
  getPlan,
  getSubscription,
  createPayment,
  getOrders,
  getTransactionHistory,
  queryTransaction,
  refund,
  createPlan,
  updatePlan,
  getAdminOrders,
  getAdminTransactionHistory,
  getDashboardOverview,
  getYearlyRevenue,
  getMonthlyRevenue,
  getRecentOrders,
};
