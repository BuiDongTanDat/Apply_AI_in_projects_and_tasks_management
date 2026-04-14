import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { adminRoutes } from "@/routes/adminRoutes";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { useTeam } from "@/hooks/data/use-team";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Team, TeamMemberRole } from "@/types/team.type";
import {
  setIsDevThisTeam,
  setIsLeadThisTeam,
  setIsQCThisTeam,
} from "@/store/slices/user-info";
import { setSelectedTeam } from "@/store/slices/selected-team";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActiveRoute = (path: string) => {
    if (path === "/team") {
      return (
        location.pathname === "/team" || location.pathname.startsWith("/team/")
      );
    }
    return location.pathname === path;
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-16" : "w-52"
      } bg-white border-r border-gray-200 shadow-sm transition-all duration-300 flex flex-col`}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Zap className="text-white w-4 h-4" />
            </div>
            <span className="text-base font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent tracking-tight">
              Taskee
            </span>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight size={16} className="text-gray-600" />
          ) : (
            <ChevronLeft size={16} className="text-gray-600" />
          )}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6">
        <div className={`${isCollapsed ? "text-center" : ""}`}>
          {!isCollapsed && (
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4 px-3">
              Menu
            </p>
          )}

          <ul className="space-y-1">
            {adminRoutes.map((route) => {
              if (route.hidden) return null;
              if (!route.path) return null;
              return (
                <li key={route.path}>
                  <Link
                    to={route.path}
                    className={`flex items-center px-3 py-2.5 rounded-xs text-sm font-medium transition-all duration-200 group
                        ${isCollapsed ? "justify-center" : ""}
                        ${
                          isActiveRoute(route.path)
                            ? " text-blue-700 shadow-sm border-l-4 border-blue-500"
                            : "text-gray-600  hover:text-gray-900"
                        }`}
                    title={isCollapsed ? route.name : undefined}
                  >
                    <div
                      className={` flex items-center w-full relative transition-colors duration-200
                       `}
                    >
                      <span className="text-md">{route.icon}</span>
                      {!isCollapsed && (
                        <span className="ml-3 capitalize text-[12px]">
                          {route.name}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-gray-100">
        {!isCollapsed ? (
          <div className="space-y-3">
            <SidebarFooter />
          </div>
        ) : (
          <div className="space-y-2"></div>
        )}
      </div>
    </aside>
  );
};

const SidebarFooter = () => {
  const selectedTeam = useAppSelector((state) => state.selectedTeam.team);
  const { teams, loadingTeam } = useTeam();

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state) => state.userInfo);

  const checkRoleInTeam = (team: Team) => {
    if (!userInfo.user) return;
    if (!team.members) return;
    const member = team.members.find((m) => m.userId === userInfo.user?.id);
    if (!member) return;
    dispatch(setIsLeadThisTeam(member.role === TeamMemberRole.LEAD));
    dispatch(setIsDevThisTeam(member.role === TeamMemberRole.MEMBER));
    dispatch(setIsQCThisTeam(member.role === TeamMemberRole.QC));
  };

  // Set default team on first load (with localStorage support)
  useEffect(() => {
    if (loadingTeam) return;
    if (!teams || teams.length === 0) return;

    const storedId = localStorage.getItem("selected_team_id");
    const storedTeam = storedId
      ? teams.find((t) => String(t.id) === storedId)
      : undefined;

    const initialTeam = storedTeam || teams[0];

    if (!selectedTeam || selectedTeam.id !== initialTeam.id) {
      dispatch(setSelectedTeam(initialTeam));
      checkRoleInTeam(initialTeam);
    }
  }, [teams, loadingTeam, selectedTeam]);

  const handleSelectTeam = (team: Team) => {
    dispatch(setSelectedTeam(team));
    checkRoleInTeam(team);
    localStorage.setItem("selected_team_id", String(team.id));

    // Navigate to the selected team's detail page so data reloads
    // If currently on a team detail page or team list, go to the new team detail
    if (location.pathname.startsWith("/team")) {
      navigate(`/team/${team.id}`);
    } else {
      // Force reload current page so all data hooks re-run with new teamId
      window.location.reload();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selectedTeam ? selectedTeam.name : "Select Team"}
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      {teams && teams.length > 0 && (
        <DropdownMenuContent className="w-[180px]">
          {teams.map((team) => (
            <DropdownMenuItem
              key={team.id}
              className="w-full cursor-pointer"
              onClick={() => handleSelectTeam(team)}
            >
              {team.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default Sidebar;
