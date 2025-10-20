import { JSX, useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  Home,
  Inbox,
  Settings,
  ChevronDown,
  MoreHorizontal,
  Users,
  Package,
  UserRoundPen,
  BookText,
  X
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { Button } from "@/components/ui/button";

// Replace navItems with project layout (Dashboard, Workspace, Projects, Team, Calendar)
type NavItem = {
  icon: JSX.Element;
  name: string;
  path?: string;
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
  }[];
};

const navItems: NavItem[] = [
  {
    icon: <Home className="w-5 h-5" />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <Inbox className="w-5 h-5" />,
    name: "Workspaces",
    path: "/workspaces",
    // subItems: [
    //   { name: "My Workspace", path: "/workspace/my", pro: false },
    //   { name: "Team Workspace", path: "/workspace/team", pro: false },
    // ],
  },
  {
    icon: <BookText  className="w-5 h-5" />,
    name: "Projects",
    path: "/projects",
  },
  {
    icon: <Users className="w-5 h-5" />,
    name: "Team",
    path: "/teams",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    name: "Calendar",
    path: "/calendar",
  },
];

//Danh sách các menu khác
const othersItems: NavItem[] = [

  {
    icon: <UserRoundPen  className="w-5 h-5" />,
    name: "Profile",
    path: "/profile",
  },
];

type OpenSubmenuType = { type: string; index: number } | null;

export function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleSidebar, isMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const [openSubmenu, setOpenSubmenu] = useState<OpenSubmenuType>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  // Thêm state lưu nhiều project đang mở (user can open many projects, each persists until closed)
  const [openedProjects, setOpenedProjects] = useState<{ id: number; name: string; workspaceName: string }[]>([]);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Tự động mở đúng submenu nếu route nằm trong submenu nào
  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        // check regular subItems
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType,
                index,
              });
              submenuMatched = true;
            }
          });
        }

        // Projects-specific: check openedProjects paths as additional submenu entries
        if (nav.name === "Projects" && openedProjects.length > 0) {
          openedProjects.forEach((p) => {
            if (location.pathname === `/projects/${p.id}`) {
              setOpenSubmenu({
                type: menuType,
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, openedProjects]);

  // Cập nhật chiều cao submenu mỗi khi đổi submenu mở hoặc khi nội dung submenu (vd. openedProjects) thay đổi
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu, openedProjects]);

  // Khi vào ProjectDetailPage, lấy projectId từ URL và thêm project vào openedProjects (no duplicates).
  useEffect(() => {
    const match = location.pathname.match(/^\/projects\/(\d+)/);
    if (match) {
      const projectId = Number(match[1]);
      import("@/db/projects.mock").then(({ mockProjects }) => {
        const project = mockProjects.find((p) => p.id === projectId);
        if (project) {
          setOpenedProjects((prev) =>
            prev.some((p) => p.id === projectId)
              ? prev
              : [
                  ...prev,
                  {
                    id: project.id,
                    name: project.name,
                    workspaceName: project.workspaceName,
                  },
                ]
          );
        }
      });
    }
    
    // Mỗi project được mỡ chỉ mất đi khi bấm nút X thôi nha
  }, [location.pathname]);

  // Hàm đóng 1 project theo id
  const handleCloseProject = (id: number) => {
    setOpenedProjects((prev) => prev.filter((p) => p.id !== id));
    // Nếu mà xóa hết project đang xem thì điều hướng về /projects
    const match = location.pathname.match(/^\/projects\/(\d+)/);
    if (match && Number(match[1]) === id) {
      navigate("/projects");
    }
  };

  // Toggle mở/đóng submenu
  const handleSubmenuToggle = (index: number, menuType: string) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // Render menu items
  const renderMenuItems = (items: NavItem[], menuType: string) => (
    <ul className="flex flex-col gap-1">
      {items.map((nav, index) => {
        const keyStr = `${menuType}-${index}`;
        // Treat as submenu if nav.subItems exist OR this is Projects and there are openedProjects
        const hasSubmenu = !!nav.subItems || (nav.name === "Projects" && openedProjects.length > 0);
        const isItemActive = nav.path ? isActive(nav.path) : (openSubmenu?.type === menuType && openSubmenu?.index === index);
        const isItemHovered = hoverKey === keyStr;

        return (
          <li key={nav.name}>
            {hasSubmenu ? (
              <Button
                variant="menuSubmenu"
                size="menuItem"
                onClick={() => handleSubmenuToggle(index, menuType)}
                data-active={openSubmenu?.type === menuType && openSubmenu?.index === index}
                className={`${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"} ${isItemActive ? "bg-primary text-white" : isItemHovered ? "bg-primary-hover text-primary" : ""}`}
                onMouseEnter={() => setHoverKey(keyStr)}
                onMouseLeave={() => setHoverKey(null)}
              >
                <span className="flex-shrink-0">
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  // Make the label a link that does not toggle the submenu when clicked
                  <span className="flex-1 text-left">
                    {nav.path ? (
                      <Link to={nav.path} onClick={(e) => e.stopPropagation()}>
                        {nav.name}
                      </Link>
                    ) : (
                      nav.name
                    )}
                  </span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index ? "rotate-180" : ""}`}
                  />
                )}
              </Button>
            ) : (
              nav.path && (
                <Button
                  asChild
                  variant="menuItem"
                  size="menuItem"
                  data-active={isActive(nav.path)}
                  className={`${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"} ${isActive(nav.path) ? "bg-primary text-white" : hoverKey === keyStr ? "bg-primary-hover text-primary" : ""}`}
                  onMouseEnter={() => setHoverKey(keyStr)}
                  onMouseLeave={() => setHoverKey(null)}
                >
                  <Link to={nav.path}>
                    <span className="flex-shrink-0">
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span>{nav.name}</span>
                    )}
                  </Link>
                </Button>
              )
            )}

            {hasSubmenu && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-1 space-y-0.5 ml-6">
                  {/* render nav.subItems first if any */}
                  {nav.subItems && nav.subItems.map((subItem, sIndex) => {
                    const subKey = `${menuType}-${index}-sub-${sIndex}`;
                    const isSubActive = isActive(subItem.path);
                    const isSubHovered = hoverKey === subKey;
                    return (
                      <li key={subItem.name}>
                        <Button
                          asChild
                          variant="subMenuItem"
                          size="subMenuItem"
                          data-active={isSubActive}
                          className={`${isSubActive ? "font-semibold bg-primary text-white" : "font-normal"} ${isSubHovered && !isSubActive ? "bg-primary-hover text-primary" : ""}`}
                          onMouseEnter={() => setHoverKey(subKey)}
                          onMouseLeave={() => setHoverKey(null)}
                        >
                          <Link to={subItem.path}>
                            <span>{subItem.name}</span>
                            <span className="flex items-center gap-1">
                              {subItem.new && (
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                  new
                                </span>
                              )}
                              {subItem.pro && (
                                <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                  pro
                                </span>
                              )}
                            </span>
                          </Link>
                        </Button>
                      </li>
                    );
                  })}

                  {/* Render submenu cho project */}
                  {nav.name === "Projects" && openedProjects.map((proj, pIndex) => {
                    const projPath = `/projects/${proj.id}`;
                    const subKey = `${menuType}-${index}-opened-${pIndex}`;
                    const isProjActive = isActive(projPath);
                    const isProjHovered = hoverKey === subKey;
                    return (
                      <li key={`opened-${proj.id}`} className="relative">
                        <Button
                          asChild
                          variant="subMenuItem"
                          size="subMenuItem"
                          data-active={isProjActive}
                          className={`${isProjActive ? "font-semibold bg-primary text-white" : "font-normal"} ${isProjHovered && !isProjActive ? "bg-primary-hover text-primary" : ""} w-full text-left`}
                          onMouseEnter={() => setHoverKey(subKey)}
                          onMouseLeave={() => setHoverKey(null)}
                        >
                          {/* add right padding so text doesn't underlap the absolute X */}
                          <Link to={projPath} className="block pr-8">
                            <span className="text-sm truncate">{proj.name}</span>
                          </Link>
                        </Button>

                        {/* absolute X so it's always visible */}
                        <button
                          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleCloseProject(proj.id);
                          }}
                          title="Close project"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      role="navigation"
      aria-label="Main Sidebar"
      className={`fixed top-0 left-0 z-50 flex flex-col bg-background border-r border-border shadow-md transition-all duration-200 ease-in-out
        ${isExpanded || isMobileOpen || isHovered ? "w-[260px]" : "w-[64px]"}
        h-screen
        ${isMobile
          ? isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
          : ""}
        lg:translate-x-0
      `}
      style={{ height: "100vh" }}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header compact */}
      <div className="p-3 border-b border-border/40">
        <Link to="/" className="flex items-center gap-2">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--brand)" }}>
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-base font-semibold">Logo</span>
            </>
          ) : (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--brand)" }}>
              <span className="text-white font-bold text-sm">L</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation với spacing compact */}
      <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin">
        <nav className="space-y-4">
          <div>
            <h2
              className={`mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                "Menu"
              ) : (
                <MoreHorizontal className="w-4 h-4" />
              )}
            </h2>
            {renderMenuItems(navItems, "main")}
            {/* NOTE: moved project submenu to renderMenuItems under the Projects item */}
          </div>

          <div>
            <h2
              className={`mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                "Others"
              ) : (
                <MoreHorizontal className="w-4 h-4" />
              )}
            </h2>
            {renderMenuItems(othersItems, "others")}
          </div>
        </nav>
      </div>
    </aside>
  );
}