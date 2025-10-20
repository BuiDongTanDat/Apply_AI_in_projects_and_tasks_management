import React from "react";

type Team = {
  id: number;
  name: string;
  description: string;
  date: string;
  members: { id: number; avatar: string }[];
  projects: number;
  private?: boolean;
};

const TeamsListView: React.FC<{ teams: Team[] }> = ({ teams }) => (
  <div className="bg-white rounded-lg shadow">
    <table className="w-full">
      <thead>
        <tr className="text-left text-xs text-gray-500 uppercase">
          <th className="px-3 py-2">Team</th>
          <th className="px-3 py-2">Description</th>
          <th className="px-3 py-2">Date</th>
          <th className="px-3 py-2">Members</th>
          <th className="px-3 py-2">Projects</th>
          <th className="px-3 py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((team) => (
          <tr key={team.id} className="border-t">
            <td className="px-3 py-2 font-semibold text-sm">{team.name}</td>
            <td className="px-3 py-2 text-xs text-gray-600">{team.description}</td>
            <td className="px-3 py-2 text-xs text-red-500">{team.date}</td>
            <td className="px-3 py-2">
              <div className="flex -space-x-2">
                {team.members.slice(0, 3).map((member) => (
                  <img
                    key={member.id}
                    src={member.avatar}
                    alt=""
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                  />
                ))}
                {team.members.length > 3 && (
                  <span className="ml-2 text-xs bg-red-100 text-red-600 rounded-full px-2 py-0.5 font-semibold">
                    +{team.members.length - 3}
                  </span>
                )}
              </div>
            </td>
            <td className="px-3 py-2 text-xs text-gray-500">{team.projects} projects</td>
            <td className="px-3 py-2">
              {team.private && (
                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold mr-1">Private</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TeamsListView;
