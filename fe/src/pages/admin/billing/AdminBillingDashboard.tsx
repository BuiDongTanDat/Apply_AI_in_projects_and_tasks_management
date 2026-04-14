import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  CheckCircle,
  Users,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { billingApi } from "@/api/billing.api";
import type {
  DashboardOverview,
  YearlyRevenueReport,
  RecentOrder,
} from "@/types/billing.type";
import "../AdminLayout.scss";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n,
  );

const formatCompact = (n: number) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
};

const MONTH_NAMES = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
];

const PIE_COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#10b981"];

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PAID: { bg: "#d1fae5", color: "#065f46" },
  PENDING: { bg: "#fef3c7", color: "#92400e" },
  FAILED: { bg: "#fee2e2", color: "#991b1b" },
  REFUNDED: { bg: "#e5e7eb", color: "#374151" },
  CANCELLED: { bg: "#f3f4f6", color: "#6b7280" },
};

const AdminBillingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [yearlyReport, setYearlyReport] = useState<YearlyRevenueReport | null>(
    null,
  );
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ov, yr, ro] = await Promise.all([
        billingApi.getDashboardOverview(),
        billingApi.getYearlyRevenue(selectedYear),
        billingApi.getRecentOrders(10),
      ]);
      setOverview(ov);
      setYearlyReport(yr);
      setRecentOrders(ro);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const monthlyChartData =
    yearlyReport?.monthlyData.map((d) => ({
      name: MONTH_NAMES[d.month - 1],
      revenue: d.revenue,
      orders: d.orderCount,
    })) ?? [];

  const planPieData =
    overview?.subscriptionsByPlan.map((p) => ({
      name: p.planName,
      value: p.count,
    })) ?? [];

  const revenuePieData =
    yearlyReport?.revenueByPlan.map((p) => ({
      name: p.planName,
      value: p.revenue,
    })) ?? [];

  if (loading) {
    return (
      <div style={{ padding: 32 }}>
        <div className="admin-page-header">
          <h1>Revenue Dashboard</h1>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: 60,
            color: "#6b7280",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Revenue Dashboard</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Calendar size={18} color="#6b7280" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "2px solid #e5e7eb",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon={<DollarSign size={22} />}
          label="Tổng doanh thu"
          value={formatVND(overview?.totalRevenue ?? 0)}
          color="#10b981"
        />
        <StatCard
          icon={<ShoppingCart size={22} />}
          label="Tổng đơn hàng"
          value={String(overview?.totalOrders ?? 0)}
          color="#3b82f6"
        />
        <StatCard
          icon={<CheckCircle size={22} />}
          label="Đơn thành công"
          value={String(overview?.totalPaidOrders ?? 0)}
          color="#8b5cf6"
        />
        <StatCard
          icon={<Users size={22} />}
          label="Active Subscriptions"
          value={String(overview?.activeSubscriptions ?? 0)}
          color="#f59e0b"
        />
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Monthly Revenue Bar Chart */}
        <div className="admin-card" style={{ padding: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <TrendingUp size={18} color="#6b7280" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
              Doanh thu theo tháng ({selectedYear})
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyChartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => formatVND(value)}
                labelFormatter={(label) => `Tháng ${label}`}
              />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subscriptions by Plan Pie Chart */}
        <div className="admin-card" style={{ padding: 20 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Subscriptions theo Plan
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={planPieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {planPieData.map((_, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary + Revenue by Plan Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Yearly Summary */}
        <div className="admin-card" style={{ padding: 20 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Tổng kết năm {selectedYear}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SummaryRow
              label="Tổng doanh thu"
              value={formatVND(yearlyReport?.summary.totalRevenue ?? 0)}
            />
            <SummaryRow
              label="Tổng đơn hàng"
              value={String(yearlyReport?.summary.totalOrders ?? 0)}
            />
            <SummaryRow
              label="Subscriptions mới"
              value={String(yearlyReport?.summary.totalNewSubscriptions ?? 0)}
            />
            <SummaryRow
              label="Doanh thu TB/tháng"
              value={formatVND(
                yearlyReport?.summary.averageMonthlyRevenue ?? 0,
              )}
            />
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="admin-card" style={{ padding: 20 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            Doanh thu theo Plan
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={revenuePieData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="value"
                label={({ name }) => name}
              >
                {revenuePieData.map((_, i) => (
                  <Cell
                    key={`rev-${i}`}
                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatVND(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="admin-card">
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            Đơn hàng gần đây
          </h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order Code</th>
              <th>User</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", color: "#9ca3af" }}
                >
                  No recent orders
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => {
                const statusStyle =
                  STATUS_STYLES[order.status] ?? STATUS_STYLES.PENDING;
                return (
                  <tr key={order.id}>
                    <td style={{ fontFamily: "monospace", fontSize: 13 }}>
                      {order.orderCode}
                    </td>
                    <td>
                      <div>{order.userName}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>
                        {order.userEmail}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          background: "#ede9fe",
                          color: "#5b21b6",
                          padding: "3px 10px",
                          borderRadius: 99,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {order.planName}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {formatVND(order.amount)}
                    </td>
                    <td>
                      <span
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          padding: "3px 10px",
                          borderRadius: 99,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: "#6b7280" }}>
                      {order.paidAt
                        ? new Date(order.paidAt).toLocaleDateString("vi-VN")
                        : new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) => (
  <div
    className="admin-card"
    style={{
      padding: 20,
      display: "flex",
      alignItems: "center",
      gap: 16,
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: `${color}15`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#1f2937" }}>
        {value}
      </div>
    </div>
  </div>
);

// Summary Row Component
const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
      borderBottom: "1px solid #f3f4f6",
    }}
  >
    <span style={{ color: "#6b7280", fontSize: 14 }}>{label}</span>
    <span style={{ fontWeight: 600, fontSize: 15, color: "#1f2937" }}>
      {value}
    </span>
  </div>
);

export default AdminBillingDashboard;
