import React from "react";

// Sửa lại type cho phù hợp dữ liệu mới
type Workspace = {
  id: string | number;
  name: string;
  description: string;
  date?: string;
  members: { id: string; avatar: string }[];
  issues?: number;
  private?: boolean;
  projects?: any[];
};

interface Props {
  workspaces: Workspace[];
  onWorkspaceClick?: (ws: Workspace) => void;
}

const WorkspaceListView: React.FC<Props> = ({ workspaces, onWorkspaceClick }) => (
  <div className="bg-white rounded-lg shadow">
    <table className="w-full">
      <thead>
        <tr className="text-xs text-gray-500 uppercase text-center">
          <th className="px-3 py-2">Workspace</th>
          <th className="px-3 py-2 w-48">Description</th>
          <th className="px-3 py-2">Last updated</th>
          <th className="px-3 py-2">Members</th>
          <th className="px-3 py-2">Projects</th>
          <th className="px-3 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {workspaces.map((ws) => (
          <tr
            key={ws.id}
            className="border-t cursor-pointer hover:bg-gray-50 group"
            onClick={() => onWorkspaceClick?.(ws)}
          >
            <td className="px-3 py-2 font-semibold text-sm w-60 text-left">
              {ws.name}
            </td>
            <td className="px-3 py-2 text-xs text-gray-600 truncate w-120 max-w-xs text-left">{ws.description}</td>
            <td className="px-3 py-2 text-xs text-gray-500 text-center">{ws.date || "-"}</td>
            <td className="px-3 py-2 text-center">
              <div className="flex justify-center -space-x-2">
                
                {ws.members && ws.members.length > 3 && (
                  <span className="ml-2 text-xs bg-red-100 text-red-600 rounded-full px-2 py-0.5 font-semibold">
                    +{ws.members.length - 3}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">{ws.members?.length || 0} members</div>
            </td>
            <td className="px-3 py-2 text-xs text-gray-500 text-center">
              {ws.projects?.length || 0} projects
            </td>
            <td className="px-3 py-2 text-center">
              {ws.private && (
                <span className="w-20 inline-block text-center bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold">Private</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default WorkspaceListView;
