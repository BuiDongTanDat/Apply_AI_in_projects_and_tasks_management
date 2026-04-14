import { createBrowserRouter, RouteObject } from "react-router";
import { publicPermission } from "./publicPermission";
import PageTitle from "./PageTitle";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/NotFound";
import { AuthLayout } from "@/pages/auth/Layout";
import { adminRoutes } from "./adminRoutes";
import Layout from "@/pages/Layout";
import { AuthProvider } from "@/provider/AuthProvider";
import AdminLogin from "@/pages/admin/auth/AdminLogin";
import AdminGuard from "@/pages/admin/auth/AdminGuard";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminUsersPage from "@/pages/admin/users/AdminUsers";
import AdminTeamsPage from "@/pages/admin/teams/AdminTeams";
import AdminProjectsPage from "@/pages/admin/projects/AdminProjects";
import AiFeedbackDashboard from "@/pages/admin/ai-feedback/AiFeedbackDashboard";
import PlansPage from "@/pages/billing/PlansPage";
import BillingResultPage from "@/pages/billing/BillingResultPage";
import AdminPlansPage from "@/pages/admin/plans/AdminPlans";
import AdminBillingPage from "@/pages/admin/billing/AdminBilling";
import AdminBillingDashboard from "@/pages/admin/billing/AdminBillingDashboard";
import GoogleCallback from "@/pages/auth/components/GoogleCallback";

export type Route = RouteObject & {
  title?: string;
  icon?: React.ReactNode;
  breadcrumbs?: { name: string; path: string }[];
  hidden?: boolean;
  name?: string;
};

const publicRoutes = createBrowserRouter([
  {
    path: publicPermission.landing,
    element: <PageTitle title="Taskee" element={<Landing />} />,
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
    path: publicPermission.emailSent,
    element: (
      <PageTitle
        title="Email Sent"
        element={<AuthLayout type="email-sent" />}
      />
    ),
  },
  {
    path: publicPermission.verifyEmail,
    element: (
      <PageTitle
        title="Verify Email"
        element={<AuthLayout type="verify-email" />}
      />
    ),
  },
  {
    path: "/auth/google/callback",
    element: <PageTitle title="Google Login" element={<GoogleCallback />} />,
  },
  {
    path: "/billing/result",
    element: (
      <PageTitle title="Payment Result" element={<BillingResultPage />} />
    ),
  },
  {
    children: adminRoutes,
    element: <AuthProvider children={<Layout />} />, // Placeholder element for nested routes
  },
  // ─── Admin routes (no auth provider, separate session) ───
  {
    path: "/admin/login",
    element: <PageTitle title="Admin Login" element={<AdminLogin />} />,
  },
  {
    path: "/admin",
    element: <AdminGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: "users",
            element: (
              <PageTitle title="Admin - Users" element={<AdminUsersPage />} />
            ),
          },
          {
            path: "teams",
            element: (
              <PageTitle title="Admin - Teams" element={<AdminTeamsPage />} />
            ),
          },
          {
            path: "projects",
            element: (
              <PageTitle
                title="Admin - Projects"
                element={<AdminProjectsPage />}
              />
            ),
          },
          {
            path: "ai-feedback",
            element: (
              <PageTitle
                title="Admin - AI Feedback"
                element={<AiFeedbackDashboard />}
              />
            ),
          },
          {
            path: "plans",
            element: (
              <PageTitle title="Admin - Plans" element={<AdminPlansPage />} />
            ),
          },
          {
            path: "billing",
            element: (
              <PageTitle
                title="Admin - Billing"
                element={<AdminBillingPage />}
              />
            ),
          },
          {
            path: "revenue",
            element: (
              <PageTitle
                title="Admin - Revenue"
                element={<AdminBillingDashboard />}
              />
            ),
          },
        ],
      },
    ],
  },
]);

export { publicRoutes };
