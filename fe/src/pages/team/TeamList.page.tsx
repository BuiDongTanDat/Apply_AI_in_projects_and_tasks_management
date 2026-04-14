import { useState } from "react";
import { useNavigate } from "react-router";
import { useTeam } from "@/hooks/data/use-team";
import { useAppDispatch } from "@/store/hook";
import { setSelectedTeam } from "@/store/slices/selected-team";
import { teamHandler } from "./handler/team.handler";
import { Team } from "@/types/team.type";
import CreateTeamModal from "./components/Team.modal";
import { Button } from "@/components/element/button";
import { Users, Plus } from "lucide-react";

const TeamList = () => {
  const { teams, loadingTeam, fetchTeam } = useTeam();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  const handleSelectTeam = (team: Team) => {
    dispatch(setSelectedTeam(team));
    navigate(`/team/${team.id}`);
  };

  return (
    <div className="w-full px-4 sm:px-8 py-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Teams</h1>
          <p className="mt-1.5 text-sm text-gray-500 font-medium">
            Select a team to view its details and manage members.
          </p>
        </div>
          <Button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 h-9 px-4 text-sm font-medium bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg border-0 shadow-none transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Team
          </Button>
        </div>

      {/* ── Team Grid ── */}
      {loadingTeam ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-gray-100 border border-gray-200 animate-pulse" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 mt-4">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-5">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No teams found</h3>
          <p className="text-sm text-gray-500 mt-1 mb-6">You haven't joined or created any teams yet.</p>
          <Button
            onClick={() => setOpen(true)}
            className="h-9 px-5 text-sm font-medium bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg shadow-sm border-0 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create new team
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} onClick={() => handleSelectTeam(team)} />
          ))}
        </div>
      )}

      <CreateTeamModal
        open={open}
        onCancel={() => setOpen(false)}
        onSubmit={async (data) => {
          try {
            const newTeam = await teamHandler.createTeam(data);
            setOpen(false);
            dispatch(setSelectedTeam(newTeam));
            await fetchTeam();
            navigate(`/team/${newTeam.id}`);
          } catch (error) {
            console.error(error);
          }
        }}
      />
    </div>
  );
};

interface TeamCardProps {
  team: Team;
  onClick: () => void;
}

const TeamCard = ({ team, onClick }: TeamCardProps) => {
  const memberCount = team.members?.length ?? 0;

  return (
    <button
      onClick={onClick}
      className="group flex flex-col justify-between text-left w-full min-h-[140px] bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-[0_4px_20px_-4px_rgba(37,99,235,0.12)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
    >
      <div className="w-full">
        {/* Top row: avatar dot + name */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 shadow-sm"
              style={{ backgroundColor: team.color ?? "#2563eb" }}
            />
            <span className="text-base font-bold text-gray-900 truncate tracking-tight group-hover:text-blue-700 transition-colors">
              {team.name}
            </span>
          </div>
          <span
            className={`shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-md ${
              team.isActive
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-gray-100 text-gray-500 border border-gray-200"
            }`}
          >
            {team.isActive ? "Active" : "Archived"}
          </span>
        </div>

        {/* Description */}
        {team.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed pl-5">
            {team.description}
          </p>
        )}
      </div>

      {/* Bottom meta */}
      <div className="flex items-center justify-between pl-5 w-full pt-2">
        <div className="flex items-center gap-3.5 text-xs font-medium text-gray-400">
          <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 text-gray-500">
            <Users className="w-3.5 h-3.5" />
            {memberCount}
          </span>
          <span className="font-mono text-gray-400">#{team.key}</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
          <span className="text-gray-400 group-hover:text-blue-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-1 group-hover:translate-x-0 duration-300">
            →
          </span>
        </div>
      </div>
    </button>
  );
};

export default TeamList;
