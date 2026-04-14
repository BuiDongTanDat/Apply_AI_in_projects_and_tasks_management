import { BarChart3, CheckCircle2, FolderKanban, ListTodo } from "lucide-react";
import { Project } from "@/types/project.type";

interface ProjectReportsProps {
  projects: Project[];
}

export const ProjectReports = ({ projects }: ProjectReportsProps) => {
  // Calculate statistics
  const totalProjects = projects.length;

  // Count active projects (projects with tasks)
  const activeProjects = projects.filter(
    (project) => project.task && project.task.length > 0,
  ).length;

  // Count completed projects (projects where all tasks are done)
  const completedProjects = projects.filter((project) => {
    if (!project.task || project.task.length === 0) return false;
    return project.task.every((task) => task.status === "DONE");
  }).length;

  // Count total tasks across all projects
  const totalTasks = projects.reduce(
    (sum, project) => sum + (project.task?.length || 0),
    0,
  );

  const reports = [
    {
      title: "Total projects",
      value: totalProjects,
      icon: <FolderKanban size={20} />,
      description: "All time",
    },
    {
      title: "Active",
      value: activeProjects,
      icon: <BarChart3 size={20} />,
      description: "Projects with tasks",
    },
    {
      title: "Completed",
      value: completedProjects,
      icon: <CheckCircle2 size={20} />,
      description: "All tasks done",
    },
    {
      title: "Tasks",
      value: totalTasks,
      icon: <ListTodo size={20} />,
      description: "Total tasks",
    },
  ];

  return (
    <div className="reports-section">
      {reports.map((report, index) => (
        <div key={index} className="report-card">
          <div className="card-header">
            <div className="card-info">
              <div className="card-title">{report.title}</div>
              <div className="card-value">{report.value}</div>
            </div>
            <div className="icon-wrapper">{report.icon}</div>
          </div>
          <div className="card-footer">{report.description}</div>
        </div>
      ))}
    </div>
  );
};
