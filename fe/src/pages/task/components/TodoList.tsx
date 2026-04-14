import { TodoItem } from "@/types/task.type";
import { taskApi } from "@/api/task.api";
import { useState, useRef, useCallback, useEffect } from "react";
import { Check, Trash2, Plus, GripVertical } from "lucide-react";

interface TodoListProps {
  /** Task id — present in update/view mode. Absent during create. */
  taskId?: number;
  initialTodos: TodoItem[];
  disabled?: boolean;
  /** Called whenever the local todos list changes (useful in create mode). */
  onChange?: (todos: TodoItem[]) => void;
}

const generateId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const TodoList = ({
  taskId,
  initialTodos,
  disabled = false,
  onChange,
}: TodoListProps) => {
  const [items, setItems] = useState<TodoItem[]>(initialTodos);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);

  // Sync when parent re-opens modal with a different task
  useEffect(() => {
    setItems(initialTodos);
  }, [initialTodos]);

  const persist = useCallback(
    async (next: TodoItem[]) => {
      onChange?.(next);
      if (!taskId) return; // create mode — no auto-save
      setSaving(true);
      try {
        await taskApi.updateTodos(String(taskId), next);
      } finally {
        setSaving(false);
      }
    },
    [taskId, onChange],
  );

  const applyAndPersist = (next: TodoItem[]) => {
    setItems(next);
    persist(next);
  };

  const handleToggle = (id: string) => {
    const next = items.map((t) =>
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t,
    );
    applyAndPersist(next);
  };

  const handleDelete = (id: string) => {
    applyAndPersist(items.filter((t) => t.id !== id));
  };

  const handleAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitAdd();
    }
  };

  const commitAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    const next: TodoItem[] = [
      ...items,
      { id: generateId(), title, isCompleted: false },
    ];
    applyAndPersist(next);
    setNewTitle("");
    addInputRef.current?.focus();
  };

  const startEdit = (item: TodoItem) => {
    if (disabled) return;
    setEditingId(item.id);
    setEditingTitle(item.title);
  };

  const commitEdit = (id: string) => {
    const trimmed = editingTitle.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    const next = items.map((t) =>
      t.id === id ? { ...t, title: trimmed } : t,
    );
    setEditingId(null);
    applyAndPersist(next);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") commitEdit(id);
    if (e.key === "Escape") setEditingId(null);
  };

  const completed = items.filter((t) => t.isCompleted).length;
  const total = items.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      {total > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {completed} / {total} completed
            </span>
            <span
              className={`text-xs font-semibold ${
                percent === 100 ? "text-green-600" : "text-gray-500"
              }`}
            >
              {percent}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percent === 100 ? "bg-green-500" : "bg-indigo-500"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Todo items */}
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors"
          >
            {/* Drag handle (visual only) */}
            {!disabled && (
              <GripVertical className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 flex-shrink-0 cursor-grab" />
            )}

            {/* Checkbox */}
            <button
              type="button"
              onClick={() => !disabled && handleToggle(item.id)}
              disabled={disabled}
              className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                item.isCompleted
                  ? "bg-indigo-500 border-indigo-500"
                  : "border-gray-300 hover:border-indigo-400"
              } ${
                disabled ? "cursor-default" : "cursor-pointer"
              }`}
            >
              {item.isCompleted && (
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              )}
            </button>

            {/* Title — inline edit on click */}
            {editingId === item.id ? (
              <input
                autoFocus
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => commitEdit(item.id)}
                onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                className="flex-1 text-sm bg-white border border-indigo-300 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-indigo-400"
              />
            ) : (
              <span
                onClick={() => startEdit(item)}
                className={`flex-1 text-sm select-none ${
                  item.isCompleted
                    ? "line-through text-gray-400"
                    : "text-gray-700"
                } ${
                  disabled ? "cursor-default" : "cursor-text hover:text-gray-900"
                }`}
              >
                {item.title}
              </span>
            )}

            {/* Delete button */}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-0.5 rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all duration-150"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add new item */}
      {!disabled && (
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-shrink-0 w-4 h-4" />{/* spacer for checkbox alignment */}
          <div className="flex flex-1 items-center gap-1 rounded-lg border border-dashed border-gray-200 px-2 py-1 hover:border-indigo-300 transition-colors focus-within:border-indigo-400">
            <input
              ref={addInputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleAddKeyDown}
              placeholder="Add a new item..."
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-300 text-gray-700"
            />
            <button
              type="button"
              onClick={commitAdd}
              disabled={!newTitle.trim()}
              className="flex-shrink-0 p-0.5 rounded text-gray-300 hover:text-indigo-500 disabled:opacity-30 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Saving indicator */}
      {saving && (
        <p className="text-[10px] text-gray-400 text-right">Saving...</p>
      )}
    </div>
  );
};

export default TodoList;
