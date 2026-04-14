import { LabelProps } from "./base.type.js";
import { User } from "./user.type.js";

// shared/types/team.interface.ts
export interface TeamSettings {
  defaultProjectTemplate?: string; // "SOFTWARE", "BUSINESS", ...
  workingDays?: number[]; // 1-7
  timezone?: string;
  notificationChannel?: string; // Slack/Webhook/Email, etc.
}

export interface Team {
  id: number;
  key: string;
  name: string;
  description?: string;
  color?: string;
  avatarUrl?: string;
  leadId?: number;
  isActive?: boolean;
  settings?: TeamSettings;
  discordServerId?: string;
  isDiscordServerLinked?: boolean;

  // Quan hệ (chỉ nên expose ở mức tối giản)
  lead?: User;
  members?: TeamMember[];

  projects?: {
    id: number;
    name: string;
    key: string;
  }[];

  // Từ AppBaseEntity
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: number;
  userId?: number;
  user: User;
  teamId?: number;
  team: Team;
  role: TeamMemberRole;
}

export enum TeamMemberRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  LEAD = "LEAD",
  MEMBER = "MEMBER",
  QC = "QC",
  VIEWER = "VIEWER",
}

export const TeamMemberRoleLabels: Record<TeamMemberRole, LabelProps> = {
  [TeamMemberRole.OWNER]: {
    label: "Owner",
    color: "text-white",
    bgColor: "#8B5CF6", // bg-purple-500
  },
  [TeamMemberRole.ADMIN]: {
    label: "Admin",
    color: "text-white",
    bgColor: "#DC2626", // bg-red-600
  },
  [TeamMemberRole.LEAD]: {
    label: "Lead",
    color: "text-white",
    bgColor: "#2563EB", // bg-blue-600
  },
  [TeamMemberRole.MEMBER]: {
    label: "Member",
    color: "text-white",
    bgColor: "#22C55E", // bg-green-600
  },
  [TeamMemberRole.QC]: {
    label: "Quality Checker",
    color: "text-white",
    bgColor: "#CA8A04", // bg-yellow-600
  },
  [TeamMemberRole.VIEWER]: {
    label: "Viewer",
    color: "text-white",
    bgColor: "#6B7280", // bg-gray-600
  },
};
