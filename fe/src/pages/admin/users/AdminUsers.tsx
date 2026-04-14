import { useEffect, useState } from "react";
import { Pagination } from "antd";
import { Users, Search } from "lucide-react";
import { userApi } from "@/api/user.api";
import { Query } from "@/api/axiosInstance";
import { User } from "@/types/user.type";
import "../AdminLayout.scss";

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<Query>({ page: 1, limit: 10 });
  const [searchInput, setSearchInput] = useState("");

  // userApi.getAll(query) → response.data?.metadata → { users: User[], total: number }
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const metadata = await userApi.getAll(query);
      setUsers(metadata?.users || []);
      setTotal(metadata?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery((prev) => ({ ...prev, page: 1, search: searchInput || undefined }));
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>User Management</h1>
        <span style={{ color: "#6b7280", fontSize: 14 }}>
          Total: <strong>{total}</strong> users
        </span>
      </div>

      {/* Search bar */}
      <div className="admin-card" style={{ padding: "16px 20px", marginBottom: 20 }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              flex: 1,
              padding: "9px 14px",
              border: "2px solid #e5e7eb",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
            }}
          />
          <button type="submit" className="admin-btn btn-primary">
            <Search size={16} />
            Search
          </button>
        </form>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-loading">Loading data...</div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            <Users size={40} />
            <p>No users found.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Position</th>
                <th>YoE</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ color: "#9ca3af", fontSize: 13 }}>#{user.id}</td>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{user.name || "—"}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`admin-badge ${user.role === "ADMIN" ? "badge-admin" : "badge-user"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.position || "—"}</td>
                  <td>{user.yearOfExperience ?? "—"}</td>
                  <td style={{ color: "#6b7280", fontSize: 13 }}>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {total > query.limit && (
          <div style={{ padding: "16px 20px", display: "flex", justifyContent: "flex-end" }}>
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

export default AdminUsersPage;
