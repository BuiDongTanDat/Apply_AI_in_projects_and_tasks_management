import React from "react";

type Workspace = {
  id: number;
  name: string;
  description: string;
  date: string;
  members: { id: number; avatar: string }[];
  issues: number;
  private?: boolean;
};

const WorkspaceListView: React.FC<{ workspaces: Workspace[] }> = ({ workspaces }) => (
  <div className="bg-white rounded-lg shadow">
    <table className="w-full">
      <thead>
        <tr className="text-left text-xs text-gray-500 uppercase">
          <th className="px-3 py-2">Workspace</th>
          <th className="px-3 py-2">Description</th>
          <th className="px-3 py-2">Date</th>
          <th className="px-3 py-2">Members</th>
          <th className="px-3 py-2">Issues</th>
          <th className="px-3 py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {workspaces.map((ws) => (
          <tr key={ws.id} className="border-t">
            <td className="px-3 py-2 font-semibold text-sm">{ws.name}</td>
            <td className="px-3 py-2 text-xs text-gray-600">{ws.description}</td>
            <td className="px-3 py-2 text-xs text-red-500">{ws.date}</td>
            <td className="px-3 py-2">
              <div className="flex -space-x-2">
                {ws.members.slice(0, 3).map((member) => (
                  <img
                    key={member.id}
                    src={member.avatar}
                    alt=""
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                  />
                ))}
                {ws.members.length > 3 && (
                  <span className="ml-2 text-xs bg-red-100 text-red-600 rounded-full px-2 py-0.5 font-semibold">
                    +{ws.members.length - 3}
                  </span>
                )}
              </div>
            </td>
            <td className="px-3 py-2 text-xs text-gray-500">{ws.issues} issues</td>
            <td className="px-3 py-2">
              {ws.private && (
                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold mr-1">Private</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default WorkspaceListView;
