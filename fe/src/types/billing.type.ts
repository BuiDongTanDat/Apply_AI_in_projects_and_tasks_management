// ===================== ENUMS =====================

export type PlanName = "FREE" | "PRO" | "ENTERPRISE";
export type BillingCycle = "MONTHLY" | "YEARLY";
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";
export type PaymentAction = "CREATED" | "PAID" | "FAILED" | "REFUNDED";

// ===================== PLAN =====================

export interface PlanFeatures {
  aiAssistant: boolean;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  exportReports: boolean;
}

export interface Plan {
  id: number;
  name: PlanName;
  displayName: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxMembers: number;
  maxProjects: number;
  maxStorage: number; // MB
  features: PlanFeatures;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===================== SUBSCRIPTION =====================

export interface Subscription {
  id: number;
  userId: number;
  planId: number;
  plan: Plan;
  billingCycle: BillingCycle;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===================== ORDER =====================

export interface Order {
  id: number;
  orderCode: string;
  userId: number;
  planId: number;
  plan: Plan;
  amount: number;
  billingCycle: BillingCycle;
  status: OrderStatus;
  vnpTxnRef: string | null;
  vnpTransactionNo: string | null;
  vnpResponseCode: string | null;
  vnpPayDate: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ===================== PAYMENT HISTORY =====================

export interface PaymentHistory {
  id: number;
  orderId: number;
  userId: number;
  action: PaymentAction;
  ipAddress: string | null;
  rawData: Record<string, any> | null;
  createdAt: string;
  order: {
    orderCode: string;
    amount: number;
    billingCycle: BillingCycle;
    status: OrderStatus;
    plan: Pick<Plan, "id" | "name" | "displayName">;
  };
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

// ===================== PAGINATED =====================

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

// ===================== REQUESTS =====================

export interface CreatePaymentRequest {
  planId: number;
  billingCycle: BillingCycle;
}

export interface RefundRequest {
  orderCode: string;
  amount: number;
  reason: string;
}

// ===================== RESPONSES =====================

export interface CreatePaymentResponse {
  paymentUrl: string;
  orderCode: string;
  amount: number;
  planName: string;
  billingCycle: BillingCycle;
}

export type ApiResponse<T> = {
  message: string;
  code: number;
  metadata: T;
};

// ===================== DASHBOARD ANALYTICS =====================

export interface DashboardOverview {
  totalRevenue: number;
  totalOrders: number;
  totalPaidOrders: number;
  totalPendingOrders: number;
  totalFailedOrders: number;
  totalRefundedOrders: number;
  activeSubscriptions: number;
  subscriptionsByPlan: {
    planId: number;
    planName: string;
    count: number;
  }[];
}

export interface MonthlyRevenueData {
  month: number;
  revenue: number;
  orderCount: number;
  newSubscriptions: number;
}

export interface RevenueByPlan {
  planId: number;
  planName: string;
  revenue: number;
  orderCount: number;
}

export interface YearlyRevenueReport {
  year: number;
  monthlyData: MonthlyRevenueData[];
  revenueByPlan: RevenueByPlan[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalNewSubscriptions: number;
    averageMonthlyRevenue: number;
  };
}

export interface MonthlyRevenueReport {
  year: number;
  month: number;
  revenueByPlan: RevenueByPlan[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
  };
  recentOrders: RecentOrder[];
}

export interface RecentOrder {
  id: number;
  orderCode: string;
  amount: number;
  status: OrderStatus;
  billingCycle: BillingCycle;
  planName: string;
  userName: string;
  userEmail: string;
  paidAt: string | null;
  createdAt: string;
}

// ===================== VNPAY ERROR CODES =====================

export const VNPAY_ERROR_MESSAGES: Record<string, string> = {
  "00": "Transaction successful",
  "07": "Payment deducted (suspected fraud — under review)",
  "09": "Internet Banking not registered",
  "10": "Card/account verification failed 3+ times",
  "11": "Payment session expired",
  "12": "Card/account is locked",
  "24": "Transaction cancelled by user",
  "51": "Insufficient balance",
  "65": "Daily transaction limit exceeded",
  "75": "Payment bank is under maintenance",
  "79": "Incorrect payment password too many times",
  "99": "Unknown error",
};
