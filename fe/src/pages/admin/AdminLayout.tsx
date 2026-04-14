import { Link, NavLink, Outlet, useNavigate } from "react-router";
import {
  BarChart3,
  BrainCircuit,
  CreditCard,
  FolderOpen,
  LogOut,
  Receipt,
  Settings,
  Users,
  UsersRound,
} from "lucide-react";
import { clearAdminSession } from "./auth/AdminLogin";
import "./AdminLayout.scss";

const NAV_ITEMS = [
  { path: "/admin/users", label: "Users", icon: <Users size={18} /> },
  { path: "/admin/teams", label: "Teams", icon: <UsersRound size={18} /> },
  {
    path: "/admin/projects",
    label: "Projects",
    icon: <FolderOpen size={18} />,
  },
  {
    path: "/admin/ai-feedback",
    label: "AI Insights",
    icon: <BrainCircuit size={18} />,
  },
  { path: "/admin/plans", label: "Plans", icon: <CreditCard size={18} /> },
  { path: "/admin/billing", label: "Billing", icon: <Receipt size={18} /> },
  {
    path: "/admin/revenue",
    label: "Revenue",
    icon: <BarChart3 size={18} />,
  },
];

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <Settings size={20} />
          <span>Admin Panel</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                "nav-item" + (isActive ? " active" : "")
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="nav-item go-app">
            <span>← Go to App</span>
          </Link>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
