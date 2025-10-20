import React from "react";
import { Folder, Lock, Pencil } from "lucide-react";

type Team = {
    id: number;
    name: string;
    description: string;
    date: string;
    members: { id: number; avatar: string }[];
    projects: number;
    private?: boolean;
};

interface Props {
    teams: Team[];
    cardSize?: "sm" | "md";
}

const TeamsCardView: React.FC<Props> = ({ teams, cardSize = "md" }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in duration-150">
        {teams.map((team) => (
            <div
                key={team.id}
                className={`relative rounded-xl overflow-hidden shadow group cursor-pointer border border-gray-100 transition-transform duration-200 hover:scale-[1.02]`}
                style={cardSize === "sm" ? { height: 180 } : { height: 220 }}
            >
                {/* Ảnh nền */}
                <img
                    src="/images/team/team_card.png"
                    alt="Team"
                    className="absolute inset-0 w-full h-full object-cover"
                />

              

                {/* Nội dung nằm trên ảnh */}
                <div className="absolute inset-0 flex flex-col justify-between  p-4">
                    {/* Header */}
                    <div className="flex items-right justify-end">
                        {team.private && (
                            
                            <span className="flex gap-1 bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">
                              <Lock className="w-4 h-4 " />  Private
                            </span>
                        )}
                    </div>

                    {/* Footer */}
                    <div>
                        <div className="flex items-center gap-2 font-semibold text-lg">
                            {team.name}
                            <Pencil size={16} className=" cursor-pointer" />
                        </div>
                        <div
                            className={`text-sm mb-1 line-clamp-2${cardSize === "sm" ? "text-xs" : ""
                                }`}
                        >
                            {team.description}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            {/* Members */}
                            <div className="flex -space-x-2">
                                {team.members.slice(0, 3).map((member) => (
                                    <img
                                        key={member.id}
                                        src={member.avatar}
                                        alt=""
                                        className={`rounded-full border-2 border-white shadow ${cardSize === "sm" ? "w-6 h-6" : "w-7 h-7"
                                            }`}
                                    />
                                ))}
                                {team.members.length > 3 && (
                                    <span className="ml-2 text-xs  backdrop-blur-sm text-white rounded-full px-2 py-0.5 font-semibold flex items-center">
                                        +{team.members.length - 3}
                                    </span>
                                )}
                            </div>

                            {/* Projects count */}
                            <div className="flex items-center gap-1 text-xs text-white/90">
                                <Folder className="w-4 h-4" />
                                {team.projects} projects
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export default TeamsCardView;
