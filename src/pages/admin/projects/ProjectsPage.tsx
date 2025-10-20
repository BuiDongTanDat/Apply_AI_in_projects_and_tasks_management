import React, { useState, useMemo, useEffect } from "react";
import { Plus, Filter, Square, List, Search } from "lucide-react";
import ProjectsCardView from "./components/ProjectsCardView";
import ProjectsListView from "./components/ProjectsListView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppPagination from "@/components/common/AppPagination";
import { mockProjects } from "@/db/projects.mock";
import { useNavigate } from "react-router-dom"; // Thêm import


const tabList = [
	{ key: "my", label: "My Projects" },
	{ key: "others", label: "Others" },
];

const ProjectsPage: React.FC<{ type?: "my" }> = ({ type }) => {
	const [view, setView] = useState<"card" | "list">("card");
	const [tab, setTab] = useState<"my" | "others">(type === "my" ? "my" : "others");
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const projectsPerPage = 9;
	const navigate = useNavigate(); // Thêm hook

	// Reset về trang 1 khi search
	useEffect(() => setCurrentPage(1), [searchQuery]);

	// Lọc dữ liệu theo searchQuery
	const filteredProjects = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return mockProjects;
		return mockProjects.filter((project) =>
			project.name.toLowerCase().includes(q) ||
			project.description.toLowerCase().includes(q) ||
			project.members.some((m) => m.id.toString().includes(q)) ||
			(project.workspaceName && project.workspaceName.toLowerCase().includes(q))
		);
	}, [searchQuery]);

	const totalPages = Math.max(1, Math.ceil(filteredProjects.length / projectsPerPage));
	const indexOfLast = currentPage * projectsPerPage;
	const indexOfFirst = indexOfLast - projectsPerPage;
	const currentProjects = filteredProjects.slice(indexOfFirst, indexOfLast);

	const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
	const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
	const handlePageChange = (page: number) => setCurrentPage(page);

	const handleProjectClick = (projectId: number) => {
		navigate(`/projects/${projectId}`);
	};

	return (
		<div className=" px-0">
			{/* Sticky header container */}
			<div className="sticky top-[56px] z-10 bg-white shadow flex flex-col px-6 py-4 mb-0 w-full">
				{/* Hàng trên: title + search */}
				<div className="flex items-center justify-between mb-2">
					<div>
						<h1 className="text-xl font-bold">All Projects</h1>
						<div className="text-xs text-gray-400 mt-0">
							Project/ALL_Projects
						</div>
					</div>
					<div className="relative w-56 md:w-72 lg:w-80">
						<Input
							type="text"
							variant="search"
							placeholder="Search projects..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className={`${/* isScrolled */ false
								? 'border-gray-200 bg-white/90 dark:bg-gray-800/90'
								: 'border-border/60 bg-white dark:bg-gray-800/60 backdrop-blur'
								}`}
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
								className={tab === t.key
									? "text-primary border-b-2 border-primary"
									: "text-gray-500 border-b-2 border-transparent"}
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
							<Plus className="w-4 h-4 mr-2" /> New project
						</Button>
					</div>
				</div>
			</div>
			{/* Scrollable content */}
			<div
				className="px-2 md:px-6 pt-4 "
			>
				{view === "card" ? (
					<ProjectsCardView
						projects={currentProjects}
						onProjectClick={handleProjectClick} />
				) : (
					<ProjectsListView
						projects={currentProjects}
						onProjectClick={handleProjectClick} 
					/>
				)}
				<AppPagination
					totalPages={totalPages}
					currentPage={currentPage}
					handlePageChange={handlePageChange}
					handleNext={handleNext}
					handlePrev={handlePrev}
					className="mt-2 "
				/>
			</div>
		</div>
	);
};

export default ProjectsPage;
