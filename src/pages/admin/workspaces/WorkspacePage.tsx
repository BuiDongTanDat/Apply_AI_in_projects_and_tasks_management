import React, { useState, useMemo, useEffect } from "react";
import WorkspaceCardView from "./components/WorkspaceCardView";
import WorkspaceListView from "./components/WorkspaceListView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Square, List, Search } from "lucide-react";
import { mockWorkspaces, otherWorkspaces } from "@/db/workspaces.mock";
import AppPagination from "@/components/common/AppPagination";
import { useNavigate } from "react-router-dom";

const tabList = [
  { key: "my", label: "My Workspaces" },
  { key: "others", label: "Others" },
];

const WorkspacesPage: React.FC = () => {
  const [tab, setTab] = useState<"my" | "others">("my");
  const [view, setView] = useState<"card" | "list">("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const workspacesPerPage = 9;
  const navigate = useNavigate();

  useEffect(() => setCurrentPage(1), [searchQuery, tab]);

  const filteredWorkspaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const data = tab === "my" ? mockWorkspaces : otherWorkspaces;
    if (!q) return data;
    return data.filter((ws) =>
      ws.name.toLowerCase().includes(q)
    );
  }, [searchQuery, tab]);

  const totalPages = Math.max(1, Math.ceil(filteredWorkspaces.length / workspacesPerPage));
  const indexOfLast = currentPage * workspacesPerPage;
  const indexOfFirst = indexOfLast - workspacesPerPage;
  const currentWorkspaces = filteredWorkspaces.slice(indexOfFirst, indexOfLast);

  const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleWorkspaceClick = (ws: any) => {
    navigate(`/workspaces/${ws.id}`);
  };

  return (
    <div >
      {/* Sticky header container */}
      <div className="sticky top-[56px] z-10 bg-white shadow flex flex-col px-6 py-4 mb-0 w-full">
        {/* Hàng trên: title + search */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold">All Workspaces</h1>
            <div className="text-xs text-gray-400 mt-0">
              Workspace/ALL_Workspaces
            </div>
          </div>
          <div className="relative w-56 md:w-72 lg:w-80">
            <Input
              type="text"
              variant="search"
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border/60 bg-white dark:bg-gray-800/60 backdrop-blur"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        {/* Hàng dưới: tab + các nút */}
        <div className="flex items-end justify-between mt-0">
          {/* Tabs bên trái */}
          <div className="flex gap-6 -mb-4">
            {tabList.map((t) => (
              <Button
                key={t.key}
                variant="tab"
                className={
                  tab === t.key
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-500 border-b-2 border-transparent"
                }
                style={{ minWidth: 100 }}
                onClick={() => setTab(t.key as "my" | "others")}
              >
                {t.label}
              </Button>
            ))}
          </div>
          {/* Nhóm nút bên phải */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0">
              <Button
                variant={view === "card" ? "actionCreate" : "actionNormal"}
                size="icon"
                className="rounded-none rounded-tl-[10px] rounded-bl-[10px]"
                onClick={() => setView("card")}
              >
                <Square className="w-4 h-4" />
              </Button>
              <Button
                variant={view === "list" ? "actionCreate" : "actionNormal"}
                size="icon"
                className="rounded-none rounded-tr-[10px] rounded-br-[10px]"
                onClick={() => setView("list")}
              >
                <List />
              </Button>
            </div>
            <Button
              variant="actionNormal"
              className="flex items-center gap-1"
            >
              <Filter className="w-4 h-4" /> Filter
            </Button>
            <Button variant="actionUpdate">
              <Plus className="w-4 h-4 mr-2" /> New workspace
            </Button>
          </div>
        </div>
      </div>
      {/* Scrollable content */}
      <div className="px-2 md:px-6 pt-4">
        {view === "card" ? (
          <WorkspaceCardView
            workspaces={currentWorkspaces}
            cardSize="sm"
            onWorkspaceClick={handleWorkspaceClick}
          />
        ) : (
          <WorkspaceListView
            workspaces={currentWorkspaces}
            onWorkspaceClick={handleWorkspaceClick}
          />
        )}
        <AppPagination
          totalPages={totalPages}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          handleNext={handleNext}
          handlePrev={handlePrev}
          className="mt-6"
        />
      </div>
    </div>
  );
};

export default WorkspacesPage;
