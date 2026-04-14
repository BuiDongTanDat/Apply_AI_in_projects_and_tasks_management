import { taskApi } from "@/api/task.api";
import { useEffect, useState } from "react";
import { Task } from "@/types/task.type";
import { TaskQuery } from "@/pages/task/handler/query";

interface UseTaskProps {
  initQuery: TaskQuery;
}

export const useTask = ({ initQuery }: UseTaskProps) => {
  const [data, setData] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState<TaskQuery>(initQuery);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //     fetchData();
  // }, [query]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await taskApi.findAll(query);
      setData(data.metadata.tasks);
      setTotal(data.metadata.page.total);
    } finally {
      setLoading(false);
    }
  };

  return { data, total, query, setQuery, loading, fetchData, setLoading };
};
