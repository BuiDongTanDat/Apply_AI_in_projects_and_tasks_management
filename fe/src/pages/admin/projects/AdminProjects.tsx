import { useEffect, useRef, useState } from "react";
import { FolderOpen, Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { Pagination, Popconfirm, message } from "antd";
import { projectApi } from "@/api/project.api";
import { Project } from "@/types/project.type";
import "../AdminLayout.scss";

interface ProjectFormValues {
  name: string;
  description: string;
}

const defaultForm: ProjectFormValues = { name: "", description: "" };

const AdminProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  // query phải có đủ { page, limit } giống use-project.ts
  const [query, setQuery] = useState({ page: 1, limit: 10 });
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectFormValues>(defaultForm);
  const [saving, setSaving] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // projectApi.findAll(query) → trả về toàn bộ axios response
  // → response.data.metadata = Project[]
  // → response.data.total = number
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await projectApi.findAll(query);
      setProjects(response.data?.metadata || []);
      setTotal(response.data?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (showModal && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [showModal]);

  const openCreate = () => {
    setEditProject(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (project: Project) => {
    setEditProject(project);
    setForm({ name: project.name, description: project.description || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editProject) {
        await projectApi.update(editProject.id, form);
        message.success("Project updated successfully!");
      } else {
        await projectApi.create(form);
        message.success("Project created successfully!");
      }
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await projectApi.deleteProject(id);
      message.success("Project deleted!");
      fetchProjects();
    } catch (err) {
      message.error("Failed to delete project.");
      console.error(err);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Project Management</h1>
        <button className="admin-btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          Create project
        </button>
      </div>

      <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>
        Total: <strong>{total}</strong> projects
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-loading">Loading data...</div>
        ) : projects.length === 0 ? (
          <div className="admin-empty">
            <FolderOpen size={40} />
            <p>No projects found.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Project Name</th>
                <th>Description</th>
                <th>Team</th>
                <th>Tasks</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td style={{ color: "#9ca3af", fontSize: 13 }}>#{project.id}</td>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{project.name}</td>
                  <td style={{ color: "#6b7280", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {project.description || "—"}
                  </td>
                  <td>
                    {project.team ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {project.team.color && (
                          <span style={{
                            width: 10, height: 10, borderRadius: "50%",
                            background: project.team.color,
                            display: "inline-block",
                          }} />
                        )}
                        {project.team.name}
                      </span>
                    ) : "—"}
                  </td>
                  <td>{project.task?.length ?? "—"}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="admin-btn btn-ghost"
                        onClick={() => openEdit(project)}
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <Popconfirm
                        title="Delete this project?"
                        okText="Delete"
                        cancelText="Cancel"
                        onConfirm={() => handleDelete(project.id)}
                      >
                        <button className="admin-btn btn-danger" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </Popconfirm>
                    </div>
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
                setQuery({ page, limit: pageSize })
              }
              showSizeChanger={false}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="admin-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="admin-modal">
            <h2>{editProject ? "Edit Project" : "Create New Project"}</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  ref={firstInputRef}
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="admin-btn btn-ghost"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  <X size={15} /> Cancel
                </button>
                <button
                  className="admin-btn btn-primary"
                  onClick={handleSave}
                  disabled={saving || !form.name.trim()}
                >
                  <Check size={15} />
                  {saving ? "Saving..." : editProject ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjectsPage;
