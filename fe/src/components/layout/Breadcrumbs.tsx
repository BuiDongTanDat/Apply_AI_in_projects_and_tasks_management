import { Link, useLocation } from "react-router";
import { ChevronRight, Home } from "lucide-react";
import { adminRoutes } from "@/routes/adminRoutes";

const Breadcrumbs = () => {
  const location = useLocation();

  // Tìm route hiện tại trong adminRoutes
  const currentRoute = adminRoutes.find(
    (route) => route.path === location.pathname
  );

  // Nếu không tìm thấy route hoặc không có breadcrumbs, không hiển thị
  if (!currentRoute || !currentRoute.breadcrumbs) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-6">
      {/* Home icon */}
      <Link
        to="/dashboard"
        className="flex items-center hover:text-gray-700 transition-colors"
      >
        <Home size={16} />
      </Link>

      {/* Breadcrumb items */}
      {currentRoute.breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight size={14} className="text-gray-400" />

          {index === currentRoute.breadcrumbs!.length - 1 ? (
            // Current page - không có link
            <span className="font-medium text-gray-900">{crumb.name}</span>
          ) : (
            // Các page trước đó - có link
            <Link
              to={crumb.path}
              className="hover:text-gray-700 transition-colors"
            >
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
