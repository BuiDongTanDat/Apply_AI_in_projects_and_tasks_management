import { useEffect, useState } from "react";
import { Pagination } from "antd";
import { Receipt, Search, RefreshCw } from "lucide-react";
import { billingApi } from "@/api/billing.api";
import type { Order, OrderStatus } from "@/types/billing.type";
import { Query } from "@/api/axiosInstance";
import "../AdminLayout.scss";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n,
  );

const STATUS_TABS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Failed", value: "FAILED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Refunded", value: "REFUNDED" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "badge-user",
  PAID: "badge-admin",
  FAILED: "badge-user",
  CANCELLED: "badge-user",
  REFUNDED: "badge-user",
};

const AdminBillingPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [query, setQuery] = useState<Query>({ page: 1, limit: 20 });
  const [searchInput, setSearchInput] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await billingApi.getAdminOrders({
        page: query.page,
        limit: query.limit,
      });
      setOrders(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      console.error(err);
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side filter by order code
  };

  const handleQueryTransaction = async (orderCode: string) => {
    try {
      const result = await billingApi.queryTransaction(orderCode);
      window.alert(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchesSearch =
      !searchInput ||
      o.orderCode.toLowerCase().includes(searchInput.toLowerCase()) ||
      String(o.userId).includes(searchInput);
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="admin-page-header">
        <h1>Billing & Orders</h1>
        <span style={{ color: "#6b7280", fontSize: 14 }}>
          Total: <strong>{total}</strong> orders
        </span>
      </div>

      {/* Search bar */}
      <div
        className="admin-card"
        style={{ padding: "16px 20px", marginBottom: 20 }}
      >
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="Search by order code or user ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              flex: 1,
              maxWidth: 350,
              padding: "9px 14px",
              border: "2px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={fetchOrders}
            className="admin-btn btn-primary"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </form>
      </div>

      {/* Status Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className="admin-btn"
            style={{
              background: statusFilter === tab.value ? "#111827" : "#f3f4f6",
              color: statusFilter === tab.value ? "#fff" : "#374151",
              border: "none",
              padding: "6px 16px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-loading">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-empty">
            <Receipt size={40} />
            <p>No orders found.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Code</th>
                <th>User ID</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Cycle</th>
                <th>Status</th>
                <th>Paid At</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        color: "#374151",
                      }}
                    >
                      {order.orderCode}
                    </span>
                  </td>
                  <td style={{ color: "#9ca3af", fontSize: 13 }}>
                    #{order.userId}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {order.plan?.displayName || `Plan #${order.planId}`}
                  </td>
                  <td>{formatVND(order.amount)}</td>
                  <td>
                    <span
                      className="admin-badge badge-user"
                      style={{ fontSize: 11 }}
                    >
                      {order.billingCycle}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${STATUS_COLORS[order.status] || "badge-user"}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: "#6b7280", fontSize: 13 }}>
                    {order.paidAt
                      ? new Date(order.paidAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td style={{ color: "#6b7280", fontSize: 13 }}>
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    {order.status === "PENDING" && (
                      <button
                        onClick={() => handleQueryTransaction(order.orderCode)}
                        className="admin-btn"
                        style={{
                          padding: "4px 10px",
                          fontSize: 11,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          background: "#f3f4f6",
                          border: "1px solid #e5e7eb",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                        title="Query VNPAY transaction status"
                      >
                        <RefreshCw size={12} />
                        Query
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {filteredOrders.length > 0 && (
          <div
            style={{
              padding: "16px 20px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Pagination
              current={query.page}
              pageSize={query.limit}
              total={total}
              onChange={(page, pageSize) =>
                setQuery((prev) => ({ ...prev, page, limit: pageSize }))
              }
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBillingPage;
