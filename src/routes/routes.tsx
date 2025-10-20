import { createBrowserRouter } from "react-router";
import { publicPermission } from "./publicPermission";
import PageTitle from "./PageTitle";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/NotFound";
import { AuthLayout } from "@/pages/auth/Layout";
import { dashboardRoutes } from "./adminRoutes";
import TasksPage from "@/pages/admin/tasks/TasksPage";
import ProjectsPage from "@/pages/admin/projects/ProjectsPage";
import JoinedProjectsPage from "@/pages/admin/projects/JoinedProjectsPage";
import WorkspacesPage from "@/pages/admin/workspaces/WorkspacePage";
import TeamsPage from "@/pages/admin/teams/TeamsPage";
import CalendarPage from "@/pages/admin/calendar/CalendarPage";
import ProjectDetailPage from "@/pages/admin/projects/ProjectDetailPage";

// --- Added: bypass auth routes for design ---
import ProjectLayout, {
} from "@/components/layout/Layout";
import Dashboard from "@/pages/admin/Dashboard";

const publicRoutes = createBrowserRouter([
  {
    path: publicPermission.landing,
    element: <PageTitle title="Landing" element={<Landing />} />,
  },
  {
    path: publicPermission.notFound,
    element: <PageTitle title="404" element={<NotFound />} />,
  },
  {
    path: publicPermission.login,
    element: <PageTitle title="Login" element={<AuthLayout type="login" />} />,
  },
  {
    path: publicPermission.register,
    element: (
      <PageTitle title="Register" element={<AuthLayout type="register" />} />
    ),
  },
  {
    path: dashboardRoutes.tasks,
    element: <PageTitle title="Tasks" element={<TasksPage />} />,
  },

  // --- Public design routes (auth disabled for quick access) ---
  {
    path: "/dashboard",
    element: <PageTitle title="Dashboard" element={<ProjectLayout><Dashboard /></ProjectLayout>} />,
  },
  {
    path: "/projects",
    element: <PageTitle title="Projects" element={<ProjectLayout><ProjectsPage /></ProjectLayout>} />,
  },
  {
    path: "/projects/my",
    element: <PageTitle title="My Projects" element={<ProjectLayout><ProjectsPage type="my" /></ProjectLayout>} />,
  },
  {
    path: "/projects/joined",
    element: <PageTitle title="Joined Projects" element={<ProjectLayout><JoinedProjectsPage /></ProjectLayout>} />,
  },
  {
    path: "/projects/:projectId",
    element: <PageTitle title="Project Detail" element={<ProjectLayout><ProjectDetailPage /></ProjectLayout>} />,
  },
  
  
  {
    path: "/workspaces",
    element: <PageTitle title="Workspaces" element={<ProjectLayout><WorkspacesPage /></ProjectLayout>} />,
  },
  {
    path: "/teams",
    element: <PageTitle title="Teams" element={<ProjectLayout><TeamsPage /></ProjectLayout>} />,
  },
  {
    path: "/calendar",
    element: <PageTitle title="Calendar" element={<ProjectLayout><CalendarPage /></ProjectLayout>} />,
  },

]);

export { publicRoutes };
