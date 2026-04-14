import { useEffect, useRef, useState } from "react";
import { UsersRound, Plus, X, Check } from "lucide-react";
import { Pagination } from "antd";
import { teamApi } from "@/api/team.api";
import { Team } from "@/types/team.type";
import "../AdminLayout.scss";

interface TeamFormValues {
  name: string;
  key: string;
  description: string;
}

const defaultForm: TeamFormValues = { name: "", key: "", description: "" };

const AdminTeamsPage = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({ page: 1, limit: 10 });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TeamFormValues>(defaultForm);
  const [saving, setSaving] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // teamApi.findAllWithQuery(query) → response.data → { metadata: { teams: Team[], total } }
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await teamApi.findAllWithQuery(query);
      const metadata = res?.metadata;
      setTeams(metadata?.teams || []);
      setTotal(metadata?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (showModal && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [showModal]);

  const openCreate = () => {
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.key.length < 2) return;
    setSaving(true);
    try {
      await teamApi.create({ name: form.name, key: form.key, description: form.description });
      setShowModal(false);
      fetchTeams();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Team Management</h1>
        <button className="admin-btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          Create Team
        </button>
      </div>

      <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>
        Total: <strong>{total}</strong> teams
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-loading">Loading data...</div>
        ) : teams.length === 0 ? (
          <div className="admin-empty">
            <UsersRound size={40} />
            <p>No teams found.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Key</th>
                <th>Team Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Members</th>
                <th>Lead</th>
                <th>Projects</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td style={{ color: "#9ca3af", fontSize: 13 }}>#{team.id}</td>
                  <td>
                    <span style={{
                      fontFamily: "monospace",
                      background: "#f3f4f6",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 12,
                    }}>
                      {team.key}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: "#111827" }}>
                    {team.color && (
                      <span style={{
                        display: "inline-block",
                        width: 10, height: 10,
                        borderRadius: "50%",
                        background: team.color,
                        marginRight: 8,
                      }} />
                    )}
                    {team.name}
                  </td>
                  <td style={{ color: "#6b7280", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {team.description || "—"}
                  </td>
                  <td>
                    <span className={`admin-badge ${team.isActive !== false ? "badge-active" : "badge-inactive"}`}>
                      {team.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{team.members?.length ?? "—"}</td>
                  <td>{team.lead?.name || team.lead?.email || "—"}</td>
                  <td>{team.projects?.length ?? "—"}</td>
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
              onChange={(page, pageSize) => setQuery({ page, limit: pageSize })}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>

      {/* Modal tạo team mới */}
      {showModal && (
        <div
          className="admin-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="admin-modal">
            <h2>Create New Team</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  ref={firstInputRef}
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter team name"
                />
              </div>
              <div className="form-group">
                <label>Key * (2–50 characters)</label>
                <input
                  type="text"
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                  placeholder="e.g. DEV, SALES"
                  maxLength={50}
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter team description"
                />
              </div>
              <div className="modal-footer">
                <button className="admin-btn btn-ghost" onClick={() => setShowModal(false)} disabled={saving}>
                  <X size={15} /> Cancel
                </button>
                <button
                  className="admin-btn btn-primary"
                  onClick={handleSave}
                  disabled={saving || !form.name.trim() || form.key.length < 2}
                >
                  <Check size={15} />
                  {saving ? "Saving..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeamsPage;
