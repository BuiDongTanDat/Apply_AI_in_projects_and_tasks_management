import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router";
import { Modal, Spin } from "antd";
import { ArrowLeft, FileText, Sparkles, RefreshCw } from "lucide-react";
import { projectApi } from "@/api/project.api";
import { Project } from "@/types/project.type";
import { GeneralInfoSection } from "./components/detail/GeneralInfoSection";
import { GanttChartSection } from "./components/detail/GanttChartSection";
import { ProgressDashboardSection } from "./components/detail/ProgressDashboardSection";
import { ProjectDocumentsSection } from "./components/detail/ProjectDocumentsSection";
import { GenerateGanttModal } from "./components/detail/GenerateGanttModal";
import "./style/projectDetail.scss";
import { Button } from "@/components/element/button";

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await projectApi.getOne(Number(id));
      setProject(data.metadata ?? data);
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (loading) {
    return (
      <div className="project-detail-page loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail-page">
        <div className="not-found">Project not found</div>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      {/* Back navigation */}
      <div className="back-nav">
        <Link to="/project" className="back-link">
          <ArrowLeft className="w-4 h-4" />
          <span>All Projects</span>
        </Link>
        <span className="separator">/</span>
        <span className="current-name">{project.name}</span>
      </div>

      {/* Section 1: General Info */}
      <GeneralInfoSection project={project} />

      {/* Section 2: Gantt Chart */}
      <GanttChartSection
        schedules={project.schedules || []}
        projectId={project.id}
        fetch={fetchProject}
      />

      {/* Section 3: Progress Dashboard */}
      <ProgressDashboardSection progress={project.progress} />

      {/* Section 4: Daily Report & Documents Tabs */}
      <ProjectDocumentsSection project={project} />

      {/* Section 5: Use Case Specification */}
      <div className="detail-section use-case-section">
        <div className="section-header">
          <h2>Project Specification</h2>
          {!project.useCaseUrl && (
            <Button
              className="generate-btn"
              onClick={() => setGenerateModalOpen(true)}
            >
              Generate AI Plan
            </Button>
          )}
        </div>

        <div className="section-content">
          {project.useCaseUrl ? (
            <div className="use-case-exists">
              <div className="file-card" onClick={() => setPreviewOpen(true)}>
                <FileText size={40} className="file-icon" />
                <div className="file-info">
                  <span className="file-name">Project Specification</span>
                  <span className="file-hint">Click to preview</span>
                </div>
              </div>

              <Modal
                title="Project Specification"
                open={previewOpen}
                onCancel={() => setPreviewOpen(false)}
                footer={null}
                width={900}
                styles={{ body: { height: "70vh", padding: 0 } }}
              >
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(project.useCaseUrl)}&embedded=true`}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="Use Case Preview"
                />
              </Modal>
            </div>
          ) : (
            <div className="use-case-empty">
              <div className="use-case-empty__icon"></div>
              <p className="use-case-empty__text">
                No specification uploaded yet.
              </p>
              <p className="use-case-empty__hint">
                Upload a document and click <strong>Generate AI Plan</strong> to
                automatically create your project schedule and tasks.
              </p>
              <Button
                className="generate-btn generate-btn--large"
                onClick={() => setGenerateModalOpen(true)}
              >
                Generate AI Plan
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Generate Gantt Modal */}
      <GenerateGanttModal
        open={generateModalOpen}
        projectId={project.id}
        onClose={() => setGenerateModalOpen(false)}
        onComplete={() => {
          setGenerateModalOpen(false);
          fetchProject();
        }}
      />
    </div>
  );
};
