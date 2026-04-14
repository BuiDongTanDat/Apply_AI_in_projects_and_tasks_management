import { useMemo, useRef, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Plus, Search, Trash2, ChevronUp, ChevronDown, Users } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import { MdLink, MdLinkOff, MdEdit, MdRocketLaunch, MdLightbulbOutline, MdCheckCircle } from "react-icons/md";

import { Input } from "@/components/ui/input";

import { Team, TeamMemberRole, TeamMemberRoleLabels } from "@/types/team.type";
import { AddMemberModal } from "./AddMember.modal";
import { UpdateDiscordIdModal } from "./UpdateDiscordId";
import { Button } from "@/components/element/button";
import TableDropdown, { ItemList } from "@/components/element/dropdown/TableDropdown";
import { teamHandler } from "../handler/team.handler";
import { alert } from "@/provider/AlertService";
import { useAppSelector } from "@/store/hook";
import UserInfo from "@/components/element/user/UserInfo";
import { User } from "@/types/user.type";

type MemberData = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: TeamMemberRole;
};

interface TeamInfoProps {
  team: Team;
  onAdd: (id: number) => void;
  onRefetch: () => void;
  onUpdateDiscordId?: (discordServerId: string) => void;
}

// Subtle role pills — matches the Notion/Linear style from reference
const rolePill: Record<TeamMemberRole, string> = {
  [TeamMemberRole.OWNER]: "bg-purple-50 text-purple-600",
  [TeamMemberRole.ADMIN]:  "bg-red-50 text-red-500",
  [TeamMemberRole.LEAD]:   "bg-blue-50 text-blue-600",
  [TeamMemberRole.MEMBER]: "bg-green-50 text-green-600",
  [TeamMemberRole.QC]:     "bg-amber-50 text-amber-600",
  [TeamMemberRole.VIEWER]: "bg-gray-100 text-gray-500",
};

const TeamInfo = ({ team, onAdd, onRefetch, onUpdateDiscordId }: TeamInfoProps) => {
  const addMemberModalRef = useRef<AddMemberModal>(null);
  const updateDiscordIdModalRef = useRef<UpdateDiscordIdModal>(null);
  const userInfo = useAppSelector((state) => state.userInfo);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const onActionOk = (msg: string) => {
    alert("success", msg);
    onRefetch();
  };

  const data = useMemo<MemberData[]>(() => {
    return (team.members || []).map((m) => ({
      id: m.user.id,
      name: m.user.name || "Unknown",
      email: m.user.email,
      avatar: m.user.avatar,
      role: m.role,
    }) as MemberData);
  }, [team.members]);

  const handleLinkDiscord = () => {
    const link =
      import.meta.env.VITE_DISCORD_LINK +
      "&guild_id=" + team.discordServerId +
      "&disable_guild_select=true&permissions=8&scope=bot%20applications.commands";
    window.open(link, "_blank");
  };

  const getDropdownItems = (member: MemberData): ItemList[] => [
    {
      label: "Remove member",
      icon: <Trash2 className="w-3.5 h-3.5 text-red-400" />,
      action: () =>
        teamHandler.removeMemberFromTeam(team.id, member.id, () =>
          onActionOk("Member removed."),
        ),
    },
  ];

  const columns: ColumnDef<MemberData>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        const sorted = column.getIsSorted();
        return (
          <button
            className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-600 transition-colors"
            onClick={() => column.toggleSorting(sorted === "asc")}
          >
            Member
            {sorted === "asc" ? (
              <ChevronUp className="w-3 h-3" />
            ) : sorted === "desc" ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <span className="w-3 h-3" />
            )}
          </button>
        );
      },
      cell: ({ row }) => (
        <UserInfo user={row.original as unknown as User} />
      ),
    },
    {
      accessorKey: "email",
      header: () => (
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</span>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-gray-400 font-mono">{row.getValue("email")}</span>
      ),
    },
    {
      accessorKey: "role",
      header: () => (
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Role</span>
      ),
      cell: ({ row }) => {
        const role = row.getValue("role") as TeamMemberRole;
        const label = TeamMemberRoleLabels[role]?.label ?? role;
        return (
          <span
            className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${rolePill[role]}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <TableDropdown
            items={getDropdownItems(row.original)}
            trigger={
              <div className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer text-gray-300 hover:text-gray-500">
                ···
              </div>
            }
          />
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── Team Identity Block ── */}
        <div className="bg-white border border-[#e8edf2] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* Left */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: team.color ?? "#2563eb" }}
                />
                <h2 className="text-lg font-semibold text-gray-900">{team.name}</h2>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    team.isActive
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {team.isActive ? "Active" : "Archived"}
                </span>
              </div>

              {team.description && (
                <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
                  {team.description}
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Users className="w-3.5 h-3.5" />
                  {data.length} {data.length === 1 ? "member" : "members"}
                </span>
                <span className="text-gray-200">·</span>
                <span className="text-xs font-mono text-gray-300">#{team.key}</span>
              </div>
            </div>

            {/* Right: Add member button */}
            {team.leadId === userInfo.user?.id && (
              <Button
                onClick={() => addMemberModalRef.current?.handleAdd()}
                className="shrink-0 flex items-center gap-1.5 h-9 px-4 text-sm font-medium bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg border-0 shadow-none transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </Button>
            )}
          </div>

          {/* Discord row */}
          <div className="mt-5 pt-5 border-t border-[#f1f5f9]">
            {team.discordServerId ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FaDiscord className="text-[#5865f2] text-lg shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Discord Server</p>
                    <p className="text-xs text-gray-400 font-mono">{team.discordServerId}</p>
                  </div>
                  {team.isDiscordServerLinked ? (
                    <span className="text-[11px] font-medium bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <MdCheckCircle className="text-xs" /> Linked
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium bg-amber-50 text-amber-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <MdLinkOff className="text-xs" /> Not linked
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => updateDiscordIdModalRef.current?.open(team.discordServerId)}
                    variant="outline"
                    rounded
                  >
                    <MdEdit /> Edit ID
                  </Button>
                  {!team.isDiscordServerLinked && (
                    <button
                      onClick={handleLinkDiscord}
                      className="text-xs font-semibold text-[#5865f2] hover:text-white hover:bg-[#5865f2] flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#5865f2]/30 hover:border-[#5865f2] transition-all"
                    >
                      <MdRocketLaunch /> Add Bot
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <FaDiscord className="text-gray-300 text-lg shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Connect Discord</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <MdLightbulbOutline className="text-amber-400" />
                    Find server ID in Discord Settings → Widget
                  </p>
                </div>
                <button
                  onClick={() => updateDiscordIdModalRef.current?.open()}
                  className="text-xs font-semibold text-[#5865f2] hover:text-white hover:bg-[#5865f2] flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#5865f2]/30 hover:border-[#5865f2] transition-all whitespace-nowrap"
                >
                  <MdLink /> Setup Discord
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Members Table ── */}
        <div className="bg-white border border-[#e8edf2] rounded-xl overflow-hidden">
          {/* Table toolbar */}
          <div className="px-6 py-4 border-b border-[#f1f5f9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Members</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {data.length} {data.length === 1 ? "person" : "people"} in this team
              </p>
            </div>
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-300" />
              <Input
                placeholder="Search members..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
                className="pl-8 h-8 text-sm bg-[#f8fafc] border-[#e8edf2] rounded-lg focus:bg-white text-gray-700 placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-[#f1f5f9]">
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-2.5 text-left font-medium bg-[#fafafa]"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors ${
                        idx % 2 === 0 ? "" : "bg-[#fdfeff]"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center text-gray-300 gap-2">
                        <Users className="w-7 h-7" />
                        <span className="text-sm font-medium">No members yet</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {table.getPageCount() > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-[#f1f5f9]">
              <span className="text-xs text-gray-400">
                Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 disabled:opacity-30 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 disabled:opacity-30 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddMemberModal
        ref={addMemberModalRef}
        onClose={() => {}}
        onSubmitOk={onAdd}
      />
      <UpdateDiscordIdModal
        ref={updateDiscordIdModalRef}
        onClose={() => {}}
        onSubmitOk={(discordServerId) => onUpdateDiscordId?.(discordServerId)}
        teamId={team.id}
      />
    </div>
  );
};

export default TeamInfo;
