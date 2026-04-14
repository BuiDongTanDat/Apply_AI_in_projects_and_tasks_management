import { teamApi } from "@/api/team.api"
import { useEffect, useState } from "react"
import { Team } from "@/types/team.type"

export const useTeam = () => {
    const [data, setData] = useState<Team[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true);
        try {
            const { metadata } = await teamApi.findAll()
            setData(metadata.teams)
            setTotal(metadata.total)
        } finally {
            setLoading(false);
        }
    }

    return { teams: data, totalTeam: total, fetchTeam: fetchData, loadingTeam: loading }
}