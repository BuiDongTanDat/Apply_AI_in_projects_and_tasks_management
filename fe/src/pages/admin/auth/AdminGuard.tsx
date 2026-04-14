import { Navigate, Outlet } from "react-router";
import { isAdminAuthenticated } from "./AdminLogin";

const AdminGuard = () => {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
};

export default AdminGuard;
