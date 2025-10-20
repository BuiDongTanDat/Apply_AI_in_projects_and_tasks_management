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

const ProjectsCardView: React.FC<Props> = ({ projects, onProjectClick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-150 animate-fade-in ">
    {projects.map((project) => (
      <div
        key={project.id}
        className="bg-white rounded-lg shadow p-3 flex flex-col gap-1 relative cursor-pointer"
        onClick={() => onProjectClick?.(project.id)}
      >
        <div className="flex items-center justify-between">
          <div className="font-semibold text-base flex items-center gap-1">
            {project.name}
            <span className="material-icons text-base text-gray-400 cursor-pointer">edit</span>
          </div>
          {project.private && (
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold">Private</span>
          )}
          {project.status === "Offtrack" && (
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold">Offtrack</span>
          )}
        </div>
        <div className="text-xs text-gray-600 line-clamp-3">{project.description}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
            <span className="material-icons text-base">schedule</span>
            {project.date}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
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
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span className="material-icons text-base">bug_report</span>
            {project.issues} issues
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default ProjectsCardView;
