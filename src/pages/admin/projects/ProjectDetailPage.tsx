import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Filter, Plus, List, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockProjects } from "@/db/projects.mock";

const boardColumns = [
  { id: "tasks", name: "Tasks" },
  { id: "inprogress", name: "In Progress" },
  { id: "review", name: "In review" },
  { id: "done", name: "Done" },
];

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useMemo(
    () => mockProjects.find((p) => p.id === Number(projectId)),
    [projectId]
  );

  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [activeTab, setActiveTab] = useState("Tasks");
  const [search, setSearch] = useState("");

  // Lọc tasks theo search
  const filteredTasks = useMemo(() => {
    if (!project?.tasks) return [];
    const q = search.trim().toLowerCase();
    if (!q) return project.tasks;
    return project.tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.labels.some((l: string) => l.toLowerCase().includes(q))
    );
  }, [search, project]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header + Breadcrumb */}
      <div className="sticky top-[56px] z-10 bg-white shadow px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{project?.name}</h1>
            <div className="text-xs text-gray-400">
              {project?.workspaceName}/{project?.name}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={view === "kanban" ? "actionCreate" : "actionNormal"} size="icon" onClick={() => setView("kanban")}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant={view === "list" ? "actionCreate" : "actionNormal"} size="icon" onClick={() => setView("list")}>
              <List className="w-4 h-4" />
            </Button>
            <Button variant="actionNormal" className="flex items-center gap-1">
              <Filter className="w-4 h-4" /> Filter
            </Button>
            <Button variant="actionUpdate">
              <Plus className="w-4 h-4 mr-2" /> New Task
            </Button>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-6 mt-4">
          {["Discussion", "Tasks", "Timelines", "Files", "Overview"].map((tab) => (
            <Button
              key={tab}
              variant="tab"
              className={
                activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 border-b-2 border-transparent"
              }
              style={{ minWidth: 100 }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>
      {/* Board + Content */}
      <div className="flex-1 px-2 md:px-6 pt-4 overflow-y-auto">
        {/* Breadcrumb cuối sidebar: workspace/project */}
        {/* ...sidebar code sẽ render <div className="text-xs text-gray-400 px-4 py-2">{workspaceName}/{projectName}</div> ở cuối sidebar... */}

        {/* Search + Board view */}
        <div className="flex items-center gap-2 mb-4">
          <Input
            type="text"
            variant="search"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-border/60 bg-white dark:bg-gray-800/60 backdrop-blur w-64"
          />
        </div>
        {activeTab === "Tasks" && view === "kanban" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {boardColumns.map((col) => (
              <div key={col.id} className="bg-white rounded-xl shadow p-3 flex flex-col min-h-[320px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-semibold text-base">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {filteredTasks.filter((t) => t.column === col.id).length}
                    </span>
                    {col.name}
                  </div>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-col gap-3">
                  {filteredTasks
                    .filter((t) => t.column === col.id)
                    .map((task) => (
                      <div key={task.id} className="bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100">
                        <div className="flex gap-2 mb-1">
                          {task.labels.map((label: string) => (
                            <span key={label} className="bg-gray-200 text-xs text-gray-700 px-2 py-0.5 rounded mr-1">{label}</span>
                          ))}
                        </div>
                        <div className="font-medium text-sm mb-1">{task.title}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <span className="material-icons text-base">comment</span>
                          {task.comments}
                          <span className="material-icons text-base ml-2">attach_file</span>
                          {task.attachments}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">Assigned to</span>
                          <div className="flex -space-x-2">
                            {task.assigned.map((m: any) => (
                              <img
                                key={m.id}
                                src={m.avatar}
                                alt=""
                                className="w-6 h-6 rounded-full border-2 border-white shadow"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  <Button variant="ghost" className="w-full mt-2 border-dashed border border-gray-200 text-gray-400">
                    + New task
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "Tasks" && view === "list" && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-gray-400 text-sm">List view is under construction...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
