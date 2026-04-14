import { Link, useLocation } from "react-router";
import { ChevronRight } from "lucide-react";
import { adminRoutes } from "@/routes/adminRoutes";

interface HeaderBreadcrumbsProps {
  className?: string;
}

const HeaderBreadcrumbs = ({ className = "" }: HeaderBreadcrumbsProps) => {
  const location = useLocation();

  // Tìm route hiện tại
  const currentRoute = adminRoutes.find(
    (route) => route.path === location.pathname
  );

  if (!currentRoute || !currentRoute.breadcrumbs) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`}>
      {currentRoute.breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center space-x-1">
          {index > 0 && (
            <ChevronRight size={12} className="text-gray-400 mx-1" />
          )}

          {index === currentRoute.breadcrumbs!.length - 1 ? (
            <span className="font-medium text-gray-700">{crumb.name}</span>
          ) : (
            <Link
              to={crumb.path}
              className="text-gray-500 hover:text-gray-700 transition-colors text-xs"
            >
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default HeaderBreadcrumbs;
