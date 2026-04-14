import { Route } from "./routes";
import PageTitle from "./PageTitle";
import {
  ChartNoAxesGantt,
  Contact,
  CreditCard,
  FolderArchive,
  ListTodo,
  Settings,
  User,
} from "lucide-react";
import ProfilePage from "@/pages/profile/ProfilePage";
import PlansPage from "@/pages/billing/PlansPage";
import Tasks from "@/pages/task/Task";
import TeamList from "@/pages/team/TeamList.page";
import TeamPage from "@/pages/team/Team.page";
import Dashboard from "@/pages/dashboard/Dashboard";
import { ProjectPage } from "@/pages/project/Project";
import { ProjectDetailPage } from "@/pages/project/ProjectDetail";
import ApiKeySettingsPage from "@/pages/settings/ApiKeySettingsPage";

export const adminRoutes: Route[] = [
  {
    path: "/dashboard",
    element: <PageTitle title="Dashboard" element={<Dashboard />} />,
    name: "dashboard",
    icon: <ChartNoAxesGantt size={16} />,
    breadcrumbs: [{ name: "Dashboard", path: "/dashboard" }],
  },
  {
    path: "/project",
    element: <PageTitle title="Projects" element={<ProjectPage />} />,
    name: "projects",
    icon: <FolderArchive size={16} />,
    breadcrumbs: [{ name: "Projects", path: "/project" }],
  },
  {
    path: "/project/:id",
    element: (
      <PageTitle title="Project Detail" element={<ProjectDetailPage />} />
    ),
    hidden: true,
    breadcrumbs: [
      { name: "Projects", path: "/project" },
      { name: "Project Detail", path: "/project/:id" },
    ],
  },
  {
    path: "/team",
    element: <PageTitle title="Teams" element={<TeamList />} />,
    name: "team",
    icon: <Contact size={16} />,
    breadcrumbs: [{ name: "Teams", path: "/team" }],
  },
  {
    path: "/team/:id",
    element: <PageTitle title="Team Detail" element={<TeamPage />} />,
    hidden: true,
    breadcrumbs: [
      { name: "Teams", path: "/team" },
      { name: "Team Detail", path: "/team/:id" },
    ],
  },
  {
    path: "/settings",
    element: (
      <PageTitle
        title="AI Settings"
        element={<ApiKeySettingsPage />}
      />
    ),
    name: "settings",
    icon: <Settings size={16} />,
    breadcrumbs: [{ name: "Settings", path: "/settings" }],
  },
  {
    path: "/task",
    element: <PageTitle title="Tasks" element={<Tasks />} />,
    name: "tasks",
    icon: <ListTodo size={16} />,
    breadcrumbs: [{ name: "Tasks", path: "/task" }],
  },
  {
    path: "/plans",
    element: <PageTitle title="Plans" element={<PlansPage />} />,
    name: "plans",
    icon: <CreditCard size={16} />,
    breadcrumbs: [{ name: "Plans", path: "/plans" }],
  },
  {
    path: "/profile",
    element: <PageTitle title="Profile" element={<ProfilePage />} />,
    name: "profile",
    icon: <User size={16} />,
    breadcrumbs: [{ name: "Profile", path: "/profile" }],
  },
];
