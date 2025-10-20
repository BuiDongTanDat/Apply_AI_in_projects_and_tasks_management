import React from "react";

type Project = {
  id: number;
  name: string;
  description: string;
  date: string;
  members: { id: number; avatar: string }[];
  issues: number;
  status?: string;
  private?: boolean;
};

interface Props {
  projects: Project[];
  onProjectClick?: (projectId: number) => void;
}

const ProjectsListView: React.FC<Props> = ({ projects, onProjectClick }) => (
  <div className="bg-white rounded-lg shadow">
    <table className="w-full">
      <thead>
        <tr className="text-left text-xs text-gray-500 uppercase">
          <th className="px-3 py-2">Project</th>
          <th className="px-3 py-2">Description</th>
          <th className="px-3 py-2">Date</th>
          <th className="px-3 py-2">Members</th>
          <th className="px-3 py-2">Issues</th>
          <th className="px-3 py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <tr
            key={project.id}
            className="border-t cursor-pointer hover:bg-gray-50"
            onClick={() => onProjectClick?.(project.id)}
          >
            <td className="px-3 py-2 font-semibold text-sm">{project.name}</td>
            <td className="px-3 py-2 text-xs text-gray-600">{project.description}</td>
            <td className="px-3 py-2 text-xs text-red-500">{project.date}</td>
            <td className="px-3 py-2">
              <div className="flex -space-x-2">
                {project.members.slice(0, 3).map((member) => (
                  <img
                    key={member.id}
                    src={member.avatar}
                    alt=""
                    className="w-6 h-6 rounded-full border-2 border-white shadow"
                  />
                ))}
                {project.members.length > 3 && (
                  <span className="ml-2 text-xs bg-gray-200 rounded-full px-2 py-0.5 text-gray-700">
                    +{project.members.length - 3}
                  </span>
                )}
              </div>
            </td>
            <td className="px-3 py-2 text-xs text-gray-500">{project.issues} issues</td>
            <td className="px-3 py-2">
              {project.private && (
                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold mr-1">Private</span>
              )}
              {project.status === "Offtrack" && (
                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold">Offtrack</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ProjectsListView;
