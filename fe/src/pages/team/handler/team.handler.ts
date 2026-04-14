import { teamApi } from "@/api/team.api"
import { CreateTeamDto } from "./team.dto"

const createTeam = async (data: CreateTeamDto) => {
    console.log("Creating team with data:", data)
    const response = await teamApi.create(data)
    return response.metadata.team
}

const getOneTeam = async (teamId: number) => {
    const team = await teamApi.getOne(teamId)
    return team.metadata.team
}

const addMemberToTeam = async (teamId: number, data: any) => {
    await teamApi.addMember(teamId, data)
    return true
}

const removeMemberFromTeam = async (teamId: number, memberId: number, cb: () => void) => {
    try {
        await teamApi.removeMember(teamId, memberId)
        cb()
        return true
    } catch (error) {
        console.error("Error removing member from team:", error)
    }
}

export const teamHandler = {
    createTeam,
    getOneTeam,
    addMemberToTeam,
    removeMemberFromTeam
}