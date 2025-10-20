import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockWorkspaces } from "@/db/workspaces.mock";
import { Share2, Plus } from "lucide-react";
import ProjectsCardView from "@/pages/admin/projects/components/ProjectsCardView";
import TeamsCardView from "@/pages/admin/teams/components/TeamsCardView";

const WorkspaceDetailPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const workspace = useMemo(
    () => mockWorkspaces.find((w) => w.id === workspaceId),
    [workspaceId]
  );

  const [activeTab, setActiveTab] = useState("Projects");
  const [search, setSearch] = useState("");
  const [shareCopied, setShareCopied] = useState(false);

  // Lọc project theo search
  const filteredProjects = useMemo(() => {
    if (!workspace?.projects) return [];
    const q = search.trim().toLowerCase();
    if (!q) return workspace.projects;
    return workspace.projects.filter(
      (p: any) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [search, workspace]);

  const handleShare = () => {
    navigator.clipboard.writeText(workspace?.invitationLink || window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-[56px] z-10 bg-white shadow px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {workspace?.imagePath && (
              <img
                src={workspace.imagePath}
                alt={workspace.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-xl font-bold">{workspace?.name}</h1>
              <div className="text-xs text-gray-400">
                Workspace ID: {workspace?.id}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="actionNormal" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              {shareCopied ? "Copied!" : "Share"}
            </Button>
            <Button variant="actionCreate">
              <Plus className="w-4 h-4 mr-2" /> New Project
            </Button>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-6 mt-4">
          {["Projects", "Members", "Overview"].map((tab) => (
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
      {/* Content */}
      <div className="flex-1 px-2 md:px-6 pt-4 overflow-y-auto">
        {/* Projects Tab */}
        {activeTab === "Projects" && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Input
                type="text"
                variant="search"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-border/60 bg-white dark:bg-gray-800/60 backdrop-blur w-64"
              />
              <Button variant="actionCreate" className="ml-auto">
                <Plus className="w-4 h-4 mr-2" /> Add Project
              </Button>
            </div>
            <ProjectsCardView projects={filteredProjects} />
          </div>
        )}
        {/* Members Tab */}
        {activeTab === "Members" && (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Teams container */}
            <div className="flex-1 bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Teams</div>
                <Button variant="actionCreate" size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Invite team
                </Button>
              </div>
              {/* Chuyển đổi dữ liệu team sang đúng format cho TeamsCardView */}
              <TeamsCardView
                teams={
                  (workspace?.teams || []).map((team: any) => ({
                    id: team.id,
                    name: team.name,
                    description: team.description,
                    date: team.createdAt
                      ? new Date(team.createdAt).toLocaleDateString()
                      : "",
                    members: (team.users || []).map((u: any) => ({
                      id: u.id,
                      avatar: u.avatarPath,
                    })),
                    projects: team.projects?.length || 0,
                    private: team.private,
                  }))
                }
                cardSize="sm"
              />
            </div>
            {/* Users container */}
            <div className="flex-1 bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Users</div>
                <Button variant="actionCreate" size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Invite user
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {workspace?.users && workspace.users.length > 0 ? (
                  workspace.users.map((user: any) => (
                    <div key={user.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100">
                      <img src={user.avatarPath} alt="" className="w-7 h-7 rounded-full" />
                      <span className="font-medium">{user.fullName}</span>
                      <span className="text-xs text-gray-400">{user.email}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm">No users added.</div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Overview Tab */}
        {activeTab === "Overview" && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="font-semibold mb-2">Description</div>
            <div className="text-gray-700 mb-4">{workspace?.description}</div>
            <div className="font-semibold mb-2">Invitation Link</div>
            <div className="text-blue-600 break-all">{workspace?.invitationLink}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceDetailPage;
