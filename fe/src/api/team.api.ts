import { CreateTeamDto } from "@/pages/team/handler/team.dto";
import axiosInstance from "./axiosInstance";

const create = async (data: CreateTeamDto) => {
  const response = await axiosInstance.post("/team", data);
  return response.data;
};

const getOne = async (teamId: number) => {
  const response = await axiosInstance.get(`/team/${teamId}`);
  return response.data;
};

const addMember = async (teamId: number, data: any) => {
  const response = await axiosInstance.patch(`/team/${teamId}/member`, data);
  return response.data;
};

const removeMember = async (teamId: number, memberId: number) => {
  const response = await axiosInstance.patch(`/team/${teamId}/member/remove`, {
    userId: memberId,
  });
  return response.data;
};

const findAll = async () => {
  const response = await axiosInstance.get("/team");
  return response.data;
};

const findAllWithQuery = async (query: { page: number; limit: number;[key: string]: any }) => {
  const response = await axiosInstance.get("/team/all", { params: query });
  return response.data;
};

const updateDiscordId = async (teamId: number, discordServerId: string) => {
  const response = await axiosInstance.patch(`/team/${teamId}/discord-id`, {
    discordServerId,
  });
  return response.data;
};

export const teamApi = {
  create,
  getOne,
  addMember,
  removeMember,
  findAll,
  findAllWithQuery,
  updateDiscordId,
};
