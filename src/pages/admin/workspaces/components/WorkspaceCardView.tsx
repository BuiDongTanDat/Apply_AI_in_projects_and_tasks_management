import React from "react";
import { Pencil } from "lucide-react";

type Workspace = {
  id: number;
  name: string;
  description: string;
  date: string;
  members: { id: number; avatar: string }[];
  issues: number;
  private?: boolean;
};

interface Props {
  workspaces: Workspace[];
  cardSize?: "sm" | "md";
}

const WorkspaceCardView: React.FC<Props> = ({ workspaces, cardSize = "md" }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-150 animate-fade-in">
    {workspaces.map((ws) => (
      <div
        key={ws.id}
        className={`bg-white rounded-xl shadow ${cardSize === "sm" ? "p-3" : "p-5"} flex flex-col gap-3 relative border border-gray-100`}
        style={cardSize === "sm" ? { minHeight: 180, fontSize: "0.95rem" } : {}}
      >
        <div className="flex items-center justify-between mb-1">
          <div className={`font-bold ${cardSize === "sm" ? "text-base" : "text-lg"} flex items-center gap-2`}>
            {ws.name}
            <Pencil size={16} className="text-gray-400 cursor-pointer" />
          </div>
          {ws.private && (
            <span className="bg-red-100 text-red-600 px-3 py-0.5 rounded text-xs font-semibold">
              Private
            </span>
          )}
        </div>
        <hr className="border-gray-300 mb-2" />
        <div className={`text-sm text-gray-700 mb-2 ${cardSize === "sm" ? "line-clamp-2" : ""}`}>{ws.description}</div>
        <div className="flex items-center gap-2 text-xs text-red-500 font-semibold mb-2">
          <span className="material-icons text-base">hourglass_empty</span>
          {ws.date}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex -space-x-2">
            {ws.members.slice(0, 3).map((member) => (
              <img
                key={member.id}
                src={member.avatar}
                alt=""
                className={`rounded-full border-2 border-white shadow ${cardSize === "sm" ? "w-7 h-7" : "w-8 h-8"}`}
              />
            ))}
            {ws.members.length > 3 && (
              <span className="ml-2 text-xs bg-red-100 text-red-600 rounded-full px-2 py-0.5 font-semibold flex items-center">
                +{ws.members.length - 3}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span className="material-icons text-base">folder_open</span>
            {ws.issues} issues
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default WorkspaceCardView;
