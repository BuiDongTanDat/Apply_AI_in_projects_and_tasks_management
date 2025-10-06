import { createBrowserRouter } from "react-router";
import { publicPermission } from "./publicPermission";
import PageTitle from "./PageTitle";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/NotFound";
import { AuthLayout } from "@/pages/auth/Layout";
import { dashboardRoutes } from "./adminRoutes";
import Tasks from "@/pages/task";

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
    element: <PageTitle title="Tasks" element={<Tasks />} />,
  },
]);

export { publicRoutes };
