import React, { useState, useMemo, useEffect } from "react";
import { Plus, Filter, Square, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppPagination from "@/components/common/AppPagination";
import TeamsCardView from "./components/TeamsCardView";
import TeamsListView from "./components/TeamsListView";

// Dummy data
const myTeams = [
  {
    id: 1,
    name: "Frontend Team",
    description: "Responsible for UI/UX and frontend logic.",
    date: "12 MAR 2023",
    members: [
      { id: 1, avatar: "https://i.pravatar.cc/40?img=8" },
      { id: 2, avatar: "https://i.pravatar.cc/40?img=9" },
      { id: 3, avatar: "https://i.pravatar.cc/40?img=10" },
      { id: 4, avatar: "https://i.pravatar.cc/40?img=11" },
    ],
    projects: 3,
    private: true,
  },
];
const otherTeams = [
  {
    id: 2,
    name: "Backend Team",
    description: "Handles server, API, and database.",
    date: "20 APR 2023",
    members: [
      { id: 1, avatar: "https://i.pravatar.cc/40?img=12" },
      { id: 2, avatar: "https://i.pravatar.cc/40?img=13" },
    ],
    projects: 2,
    private: false,
  },
];

const tabList = [
  { key: "my", label: "My Teams" },
  { key: "others", label: "Others" },
];

const TeamsPage: React.FC = () => {
  const [tab, setTab] = useState<"my" | "others">("my");
  const [view, setView] = useState<"card" | "list">("card");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const teamsPerPage = 6;

  useEffect(() => setCurrentPage(1), [searchQuery, tab]);

  const filteredTeams = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const data = tab === "my" ? myTeams : otherTeams;
    if (!q) return data;
    return data.filter((team) =>
      team.name.toLowerCase().includes(q)
    );
  }, [searchQuery, tab]);

  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / teamsPerPage));
  const indexOfLast = currentPage * teamsPerPage;
  const indexOfFirst = indexOfLast - teamsPerPage;
  const currentTeams = filteredTeams.slice(indexOfFirst, indexOfLast);

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };
  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-0">
      <div className="sticky top-[56px] z-10 bg-white shadow flex flex-col px-6 py-4 mb-0 w-full">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold">All Teams</h1>
            <div className="text-xs text-gray-400 mt-0">
              Team/ALL_Teams
            </div>
          </div>
          <div className="relative w-56 md:w-72 lg:w-80">
            <Input
              type="text"
              variant="search"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border/60 bg-white dark:bg-gray-800/60 backdrop-blur"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-end justify-between mt-0">
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
              <Plus className="w-4 h-4 mr-2" /> New team
            </Button>
          </div>
        </div>
      </div>
      <div className="px-2 md:px-6 pt-4 h-[calc(100vh-56px-88px)] overflow-y-auto">
        {view === "card" ? (
          <TeamsCardView teams={currentTeams} cardSize="sm" />
        ) : (
          <TeamsListView teams={currentTeams} />
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

export default TeamsPage;
