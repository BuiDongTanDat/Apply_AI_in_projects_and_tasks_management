import { Query } from "@/api/axiosInstance";
import { userApi } from "@/api/user.api"
import { useEffect, useState } from "react"
import { User } from "@/types/user.type"



interface UseUserProps {
    initQuery: Query;
}

export const useUser = ({ initQuery }: UseUserProps) => {
    const [data, setData] = useState<User[]>([])
    const [total, setTotal] = useState(0)
    const [query, setQuery] = useState<Query>(initQuery);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [query]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await userApi.getAll(query)

            console.log("Fetched users:", data);
            setData(data.users)
            setTotal(data.total)
        } finally {
            setLoading(false);
        }
    }



    return { data, setData, total, setTotal, query, setQuery, loading, fetchData }
}