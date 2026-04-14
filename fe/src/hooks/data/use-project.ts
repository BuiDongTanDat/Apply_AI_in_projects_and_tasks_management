import { projectApi } from "@/api/project.api"
import { useState } from "react"
import { Project } from "@/types/project.type"



interface UseProjectProps {
    initQuery: any;
}

export const useProject = ({ initQuery }: UseProjectProps) => {
    const [data, setData] = useState<Project[]>([])
    const [total, setTotal] = useState(0)
    const [query, setQuery] = useState<any>(initQuery);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        let newData: Project[] = [];
        try {
            const { data } = await projectApi.findAll(query)
            setData(data.metadata)
            setTotal(data.total)
            newData = data.metadata
        } finally {
            setLoading(false);
        }
        return newData;
    }

    return { projects: data, totalProject: total, fetchProject: fetchData, loadingProject: loading, setQueryProject: setQuery, queryProject: query }
}