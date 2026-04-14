import { useEffect, useState } from "react";
import { Pagination } from "antd";
import { Receipt, RefreshCw } from "lucide-react";
import { billingApi } from "@/api/billing.api";
import type { PaymentHistory, PaymentAction } from "@/types/billing.type";
import { Query } from "@/api/axiosInstance";
import "../AdminLayout.scss";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n,
  );

const ACTION_TABS: { label: string; value: PaymentAction | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Created", value: "CREATED" },
  { label: "Paid", value: "PAID" },
  { label: "Failed", value: "FAILED" },
  { label: "Refunded", value: "REFUNDED" },
];

const ACTION_COLORS: Record<string, string> = {
  CREATED: "badge-user",
  PAID: "badge-admin",
  FAILED: "badge-user",
  REFUNDED: "badge-user",
};

const AdminTransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState<PaymentHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<PaymentAction | "ALL">(
    "ALL",
  );
  const [query, setQuery] = useState<Query>({ page: 1, limit: 20 });
  const [searchInput, setSearchInput] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const result = await billingApi.getAdminTransactionHistory({
        page: query.page,
        limit: query.limit,
      });
      setTransactions(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      console.error(err);
      setTransactions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesAction = actionFilter === "ALL" || tx.action === actionFilter;
    const matchesSearch =
      !searchInput ||
      tx.order.orderCode.toLowerCase().includes(searchInput.toLowerCase()) ||
      String(tx.userId).includes(searchInput) ||
      tx.user?.email?.toLowerCase().includes(searchInput.toLowerCase()) ||
      tx.user?.name?.toLowerCase().includes(searchInput.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div>
      <div className="admin-page-header">
        <h1>Transaction History</h1>
        <span style={{ color: "#6b7280", fontSize: 14 }}>
          Total: <strong>{total}</strong> transactions
        </span>
      </div>

      {/* Search bar */}
      <div
        className="admin-card"
        style={{ padding: "16px 20px", marginBottom: 20 }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="Search by order code, user ID, email or name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              flex: 1,
              maxWidth: 400,
              padding: "9px 14px",
              border: "2px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={fetchTransactions}
            className="admin-btn btn-primary"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Action Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {ACTION_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActionFilter(tab.value)}
            className="admin-btn"
            style={{
              background: actionFilter === tab.value ? "#111827" : "#f3f4f6",
              color: actionFilter === tab.value ? "#fff" : "#374151",
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
          <div className="admin-loading">Loading transactions...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="admin-empty">
            <Receipt size={40} />
            <p>No transactions found.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Order Code</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Cycle</th>
                <th>Action</th>
                <th>Order Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ color: "#6b7280", fontSize: 13 }}>
                    {new Date(tx.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    {tx.user ? (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {tx.user.name}
                        </div>
                        <div style={{ color: "#9ca3af", fontSize: 12 }}>
                          {tx.user.email}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "#9ca3af", fontSize: 13 }}>
                        #{tx.userId}
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        color: "#374151",
                      }}
                    >
                      {tx.order.orderCode}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {tx.order.plan.displayName}
                  </td>
                  <td>{formatVND(tx.order.amount)}</td>
                  <td>
                    <span
                      className="admin-badge badge-user"
                      style={{ fontSize: 11 }}
                    >
                      {tx.order.billingCycle}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${ACTION_COLORS[tx.action] || "badge-user"}`}
                    >
                      {tx.action}
                    </span>
                  </td>
                  <td>
                    <span
                      className="admin-badge badge-user"
                      style={{ fontSize: 11 }}
                    >
                      {tx.order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {filteredTransactions.length > 0 && (
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

export default AdminTransactionHistoryPage;
