import { Task, TaskStatus } from "@/types/task.type";
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { DeadlineCalculator, TaskStatusRender } from "./Status";
import UserInfo from "@/components/element/user/UserInfo";
import TableDropdown, {
  ItemList,
} from "@/components/element/dropdown/TableDropdown";
import { Pencil, Trash2, SendHorizontal, ClipboardCheck, MoreVertical } from "lucide-react";
import { useAppSelector } from "@/store/hook";
import { useMemo } from "react";
import { Pagination } from "antd";
import PriorityRender from "./Priority";

interface TaskTableProps {
  data: Task[];
  loading: boolean;
  onUpdateTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  onSendToQC?: (task: Task) => void;
  onQCReview?: (task: Task) => void;
  onViewTask?: (task: Task) => void;
  query: {
    page: number;
    limit: number;
  };
  total: number;
  setQuery?: (query: any) => void;
}

const columnHelpers = createColumnHelper<Task>();

const TaskTable = (props: TaskTableProps) => {
  const {
    data,
    loading,
    onUpdateTask,
    onDeleteTask,
    onSendToQC,
    onQCReview,
    onViewTask,
    query,
    total = 100,
    setQuery,
  } = props;

  const userInfo = useAppSelector((state) => state.userInfo);
  const team = useAppSelector((state) => state.selectedTeam.team);

  const isLead = useMemo(() => {
    return team?.leadId === userInfo?.user?.id;
  }, [team]);

  const defaultColumn = [
    columnHelpers.accessor("title", {
      header: "Title",
      cell: (props) => {
        const task = props.row.original;
        const needsReview = task.status === "WAIT_REVIEW";

        return (
          <div className="flex flex-col jusutify-start items-start gap-1">
            <span
              className="underline text-blue-500 cursor-pointer"
              onClick={() => onUpdateTask?.(task)}
            >
              #ISSUE{task.id}
            </span>
            <>
              <span>{props.getValue()}</span>
              {needsReview && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200">
                  Needs review
                </span>
              )}
            </>
          </div>
        );
      },
      size: 300,
      footer: (info) => info.column.id,
    }),
    columnHelpers.accessor("priority", {
      header: "Priority",
      cell: (props) => {
        const priority = props.getValue();
        return <PriorityRender priority={priority} />;
      },
    }),
    columnHelpers.accessor("todos", {
      header: "Todos",
      cell: (props) => {
        const todos = props.getValue();
        if (!todos || todos.length === 0) return <span className="text-gray-300">—</span>;
        const done = todos.filter((t) => t.isCompleted).length;
        const total = todos.length;
        const allDone = done === total;
        return (
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              allDone
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <span className="text-[10px]">✓</span>
            {done}/{total}
          </span>
        );
      },
    }),
    columnHelpers.accessor("project", {
      header: "Project",
      cell: (props) => {
        const project = props.getValue();
        return project ? project.name : "--";
      },
      footer: (info) => info.column.id,
    }),
    columnHelpers.accessor("assignee", {
      header: "Assignee",
      cell: (props) => {
        const user = props.getValue();
        return user ? <UserInfo user={user!} /> : "--";
      },
      footer: (info) => info.column.id,
    }),
    columnHelpers.accessor("status", {
      header: "Status",
      cell: (props) => {
        const status = props.getValue();
        return <TaskStatusRender status={status} />;
      },
    }),

    columnHelpers.accessor("dueDate", {
      header: "Due Date",
      cell: (props) => {
        const dueDate = props.getValue();
        const status = props.row.original.status;
        return <DeadlineCalculator dueDate={dueDate} status={status} />;
      },
    }),
    columnHelpers.display({
      id: "actions",
      cell: (props) => {
        const task = props.row.original;
        const items: ItemList[] = [];


          items.push({
            label: "Edit",
            action: () => onUpdateTask?.(task),
            icon: <Pencil size={13} />,
          });

          items.push({
            label: "Send to QC",
            action: () => onSendToQC?.(task),
            icon: <SendHorizontal size={13} />,
          });

          items.push({
            label: "QC Review",
            action: () => onQCReview?.(task),
            icon: <ClipboardCheck size={13} />,
          });

          items.push({
            label: "Delete",
            action: () => onDeleteTask?.(task),
            icon: <Trash2 size={13} />,
          });

        return (
          <TableDropdown
            items={items}
            trigger={<MoreVertical size={15} className="cursor-pointer text-gray-400 hover:text-gray-600" />}
          />
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns: defaultColumn,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mt-4">
      <table className="min-w-full text-xs text-gray-700">
        <thead className="bg-gray-50 text-[11px] uppercase text-gray-500 tracking-wide">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2.5 text-left font-semibold border-b border-gray-200"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td
                colSpan={defaultColumn.length}
                className="p-4 text-center text-gray-500"
              >
                Loading data...
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={defaultColumn.length}
                className="p-6 text-center text-gray-400 italic"
              >
                No data available
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={`transition-colors duration-100 ${
                  rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:shadow-line-hover`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-2 border-b border-gray-100 text-xs text-gray-600"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="p-2">
        <Pagination
          defaultPageSize={query.limit}
          current={query.page}
          total={total}
          onChange={(page, limit) => {
            query.page = page;
            query.limit = limit;
            setQuery?.({ ...query });
          }}
        />
      </div>
    </div>
  );
};

export default TaskTable;
