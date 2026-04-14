import { useEffect, useRef, useState } from "react";
import Filters from "./components/Filters";
import CreateTaskModal, { CreateTaskModalRef } from "./components/TaskModal";
import { useTask } from "@/hooks/data/use-task";
import TaskTable from "./components/TaskTable";
import { KanbanBoard } from "./components/KanbanBoard";
import { Task } from "@/types/task.type";
import { taskApi } from "@/api/task.api";
import { alert } from "@/provider/AlertService";
import { useAppSelector } from "@/store/hook";
import { Link, useSearchParams } from "react-router";
import { LayoutGrid, List } from "lucide-react";

const Tasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const modalRef = useRef<CreateTaskModalRef>(null);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  const team = useAppSelector((state) => state.selectedTeam.team);
  const userInfo = useAppSelector((state) => state.userInfo);

  const { data, query, total, setQuery, loading, fetchData, setLoading } =
    useTask({
      initQuery: {
        page: 1,
        limit: 10,
        teamId: team?.id,
        assigneeId: userInfo.isDevThisTeam ? userInfo.user?.id : undefined,
        qcId: userInfo.isQCThisTeam ? userInfo.user?.id : undefined,
      },
    });

  const handleChangeFilters = (newFilters: any) => {
    setQuery({ ...query, ...newFilters, page: 1, limit: 20 });
  };

  const handleEditTask = (task: Task) => {
    modalRef.current?.update(task);
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      setLoading(true);
      await taskApi.dlt(task.id.toString());
      fetchData();
      alert("Task deleted successfully!", "Deleted", "success");
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to delete task";
      console.error("Error deleting task:", error);
      alert(`Error: ${errorMsg}`, "Delete Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendToQC = async (task: Task) => {
    try {
      setLoading(true);
      await taskApi.sendToQC(task.id.toString());
      fetchData();
      alert("Task sent to QC for review!", "Sent to QC", "success");
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to send task to QC";
      console.error("Error sending to QC:", error);
      alert(`Error: ${errorMsg}`, "QC Submission Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQCReview = (task: Task) => {
    modalRef.current?.openQCReview(task);
  };

  const handleViewTask = (task: Task) => {
    modalRef.current?.view(task);
  };

  // Sync query.teamId with currently selected team
  useEffect(() => {
    if (team?.id) {
      setQuery((prev) => ({
        ...prev,
        teamId: team.id,
        page: 1,
      }));
    }
  }, [team?.id, setQuery]);

  useEffect(() => {
    fetchData();
  }, [query, team?.id]);

  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (taskId && team?.id && modalRef.current) {
      taskApi.getById(taskId).then((res) => {
        if (res?.metadata) {
          modalRef.current?.update(res.metadata);
          // Optional: clear the param after opening so it doesn't reopen if they close and navigate away
          searchParams.delete('taskId');
          setSearchParams(searchParams, { replace: true });
        }
      }).catch(console.error);
    }
  }, [searchParams, team?.id]);

  if (!team) {
    return (
      <div className="p-4 w-full h-full flex items-center justify-center">
        <p className="text-gray-500">
          You haven't selected a Workspace to view assigned tasks!!!.
        </p>
        <Link to="/team" className="text-blue-500 underline ml-2">
          Enter Workspace
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 w-full h-full bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Filters
          onAdd={() => modalRef.current?.open()}
          onChange={handleChangeFilters}
          fetch={fetchData}
        />

        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              viewMode === "table"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <List size={18} />
            <span className="text-sm font-medium">Table</span>
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              viewMode === "kanban"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <LayoutGrid size={18} />
            <span className="text-sm font-medium">Kanban</span>
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
        <TaskTable
          data={data}
          loading={loading}
          onUpdateTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onSendToQC={handleSendToQC}
          onQCReview={handleQCReview}
          onViewTask={handleViewTask}
          query={query}
          total={total}
          setQuery={setQuery}
        />
      ) : (
        <KanbanBoard
          tasks={data}
          loading={loading}
          onUpdateTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onSendToQC={handleSendToQC}
          onQCReview={handleQCReview}
          onRefresh={fetchData}
        />
      )}

      {/* modals */}
      <CreateTaskModal ref={modalRef} onSubmitOk={fetchData} />
    </div>
  );
};

export default Tasks;
