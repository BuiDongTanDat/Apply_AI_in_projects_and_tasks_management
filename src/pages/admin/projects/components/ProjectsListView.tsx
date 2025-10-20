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
  workspaceName?: string; 
};

interface Props {
  projects: Project[];
  onProjectClick?: (projectId: number) => void;
}

const ProjectsListView: React.FC<Props> = ({ projects, onProjectClick }) => (
  <div className="bg-white rounded-lg shadow">
    <table className="w-full">
      <thead>
        <tr className=" text-xs text-gray-500 uppercase text-center">
          <th className="px-3 py-2">Project</th>
          <th className="px-3 py-2 w-48">Description</th>
          <th className="px-3 py-2">Last modified</th>
          <th className="px-3 py-2">Members</th>
          <th className="px-3 py-2">Tasks</th>
          <th className="px-3 py-2">Status</th>
          <th className="px-3 py-2 w-12"></th> {/* Action column */}
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <tr
            key={project.id}
            className="border-t cursor-pointer hover:bg-gray-50 group"
            onClick={() => onProjectClick?.(project.id)}
          >
            <td className="px-3 py-2 font-semibold text-sm w-60">
              {project.name}
              <br/>
              <span className = "text-xs font-normal text-gray-600">/{project.workspaceName}</span>
            </td>
            <td className="px-3 py-2 text-xs text-gray-600 truncate w-120 max-w-xs">{project.description}</td>
            <td className="px-3 py-2 text-xs text-gray-500 text-center">{project.date}</td>
            <td className="px-3 py-2 ">
              <div className="flex -space-x-2 ">
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
            <td className="px-3 py-2 text-xs text-gray-500 text-center">{project.issues} tasks</td>
            <td className="px-3 py-2 text-center">
              {project.status === "Private" && (
                <span className="w-20 inline-block text-center bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold">Private</span>
              )}
              {project.status === "Public" && (
                <span className=" inline-block w-20 text-center bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-semibold">Public</span>
              )}
              
            </td>
            <td className="px-3 py-2 w-12">
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-primary text-white px-2 py-1 rounded text-xs"
                onClick={e => { e.stopPropagation(); onProjectClick?.(project.id); }}
              >
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ProjectsListView;
