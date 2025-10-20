import React from "react";
import { Users, FolderOpen, Clock } from "lucide-react";

// Sửa lại type cho phù hợp dữ liệu mới
type Workspace = {
  id: string | number;
  name: string;
  description: string;
  date?: string;
  members: { id: string; avatar: string }[];
  issues?: number;
  private?: boolean;
  imagePath?: string;
  projects?: any[];
};

interface Props {
  workspaces: Workspace[];
  cardSize?: "sm" | "md";
  onWorkspaceClick?: (ws: Workspace) => void;
}

const WorkspaceCardView: React.FC<Props> = ({ workspaces, cardSize = "md", onWorkspaceClick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-150 animate-fade-in">
    {workspaces.map((ws) => {
      const bgImage = ws.imagePath ? ws.imagePath : "/images/items/temp_workspace.png";
      return (
        <div
          key={ws.id}
          className={`relative rounded-sm overflow-hidden shadow  cursor-pointer group
            transition-transform hover:shadow-md hover:scale-103 active:scale-95`}
          style={{ minHeight: cardSize === "sm" ? 150 : 220 }}
          onClick={() => onWorkspaceClick?.(ws)}
        >
          {/* Background image with overlay */}
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-300 ease-in-out group-hover:scale-110"
              style={{
                backgroundImage: `url('${bgImage}')`,
                filter: "blur(0px) brightness(0.65)",
              }}
            />
            <div className="absolute inset-0 bg-black/30 z-10" />
          </div>
          {/* Content */}
          <div className="relative z-20 flex flex-col h-full justify-between p-5">
            <div>
              <div className="font-bold text-lg text-white mb-1 flex items-center gap-2">
                {ws.name}
                {ws.private && (
                  <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold ml-2">
                    Private
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-100 mb-2 line-clamp-2">{ws.description}</div>
            </div>
            <div className="flex items-center justify-end mt-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-gray-100">
                  <Users size={16} className="inline" />
                  {ws.members?.length || 0} members
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-100">
                  <FolderOpen size={16} className="inline" />
                  {ws.projects?.length || 0} projects
                </span>
              </div>
              {ws.date && (
                <span className="flex items-center gap-1 text-xs text-gray-200">
                  <Clock size={14} className="inline" />
                  {ws.date}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

export default WorkspaceCardView;
