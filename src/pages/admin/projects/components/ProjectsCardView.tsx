import { StickyNote } from "lucide-react";
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


const ProjectsCardView: React.FC<Props> = ({ projects, onProjectClick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-150 animate-fade-in">
    {projects.map((project) => (
      <div
        key={project.id}
        className="bg-white rounded-sm shadow hover:shadow-md p-3 flex flex-col gap-1 relative cursor-pointer  hover:scale-103 active:scale-95 transition-transform"
        onClick={() => onProjectClick?.(project.id)}
      >
        <div className="flex items-center justify-between">
          <div className="font-semibold text-base flex flex-col gap-0">
            <span>{project.name}</span>
            <span className="text-xs font-normal text-gray-600">/{project.workspaceName}</span>
          </div>

          {project.status === "Private" ? (
            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold">
              Private
            </span>
          ) : project.status === "Public" ? (
            <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-semibold">
              Public
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className=" text-xs text-gray-500 flex items-center gap-1">
            Last modified: &nbsp;
            {project.date}
          </span>
        </div>

        <div className="text-xs text-gray-600 line-clamp-3">{project.description}</div>
        
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
            <StickyNote className="w-4 h-4" />
            {project.issues} task
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default ProjectsCardView;
