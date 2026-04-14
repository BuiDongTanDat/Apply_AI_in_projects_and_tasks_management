import { useEffect, useState } from "react";
import CreateTeamModal from "./components/Team.modal";
import { teamHandler } from "./handler/team.handler";
import { useAppDispatch } from "@/store/hook";
import TeamInfo from "./components/Team.info";
import { Team } from "@/types/team.type";
import { useParams, useNavigate, Link } from "react-router";
import { setSelectedTeam } from "@/store/slices/selected-team";
import { ArrowLeft } from "lucide-react";
import TeamPerformance from "./components/TeamPerformance";
import { Tabs } from "antd";

const TeamPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState<Team>();
  const [activeTab, setActiveTab] = useState<"info" | "performance">("info");

  useEffect(() => {
    if (!id) return;
    teamHandler.getOneTeam(Number(id)).then((data) => {
      setTeam(data);
      dispatch(setSelectedTeam(data));
    });
  }, [id]);

  const refetch = async () => {
    try {
      if (!team) return;
      const updated = await teamHandler.getOneTeam(team.id);
      setTeam(updated);
      dispatch(setSelectedTeam(updated));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async (payload: any) => {
    if (!team) return;
    try {
      const data = await teamHandler.addMemberToTeam(team.id, payload);
      if (data) {
        const updated = await teamHandler.getOneTeam(team.id);
        setTeam(updated);
        dispatch(setSelectedTeam(updated));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateDiscordId = async (discordServerId: string) => {
    if (!team) return;
    try {
      console.log("Update discord ID:", discordServerId);
      await refetch();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {/* Back navigation */}
      <div className="px-6 pt-6 pb-0 flex items-center gap-3">
        <Link
          to="/team"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>All Teams</span>
        </Link>
        {team && (
          <>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-800">{team.name}</span>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as "info" | "performance")}
          items={[
            { key: "info", label: "Info" },
            { key: "performance", label: "Performance" },
          ]}
        />
      </div>

      {team && (
        <>
          {activeTab === "info" ? (
            <TeamInfo
              team={team}
              onAdd={handleAdd}
              onRefetch={refetch}
              onUpdateDiscordId={handleUpdateDiscordId}
            />
          ) : (
            <TeamPerformance teamId={team.id} />
          )}
        </>
      )}
      <CreateTeamModal
        open={open}
        onCancel={() => setOpen(false)}
        onSubmit={async (data) => {
          try {
            const newTeam = await teamHandler.createTeam(data);
            setOpen(false);
            dispatch(setSelectedTeam(newTeam));
            navigate(`/team/${newTeam.id}`);
          } catch (error) {
            console.error(error);
          }
        }}
      />
    </div>
  );
};

export default TeamPage;
