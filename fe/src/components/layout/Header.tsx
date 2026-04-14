import { useEffect, useState } from "react";
import {
  Bell,
  Search,
  Settings,
  User,
  Menu,
  LogOut,
  UserCircle,
  Crown,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Avatar, Dropdown, Input, Popover } from "antd";
import type { MenuProps } from "antd";
import HeaderBreadcrumbs from "./HeaderBreadcrumbs";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { useNavigate } from "react-router";
import { logout } from "@/store/slices/user-info";
import { useLocalStorage } from "@/hooks/logic/useLocalStorage";
import { useCookie } from "@/hooks/logic/useCookie";
import { billingApi } from "@/api/billing.api";
import type { Subscription } from "@/types/billing.type";
import NotificationList from "@/components/notification/NotificationList";
import { useNotifications } from "@/hooks/logic/useNotifications";


const Header = () => {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subLoaded, setSubLoaded] = useState(false);

  useEffect(() => {
    billingApi
      .getSubscription()
      .then(setSubscription)
      .catch(() => {})
      .finally(() => setSubLoaded(true));
  }, []);

  const user = useAppSelector((state) => state.userInfo.user);
  const unreadCount = useAppSelector((state) => state.notification.unreadCount);
  const dispatch = useAppDispatch();

  const [openNotifications, setOpenNotifications] = useState(false);

  const [, , deleteToken] = useCookie("access_token", "");
  const [, setUserId] = useLocalStorage("user_id", "");

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserCircle size={16} />,
    },
    {
      key: "settings",
      label: "Settings",
      icon: <Settings size={16} />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogOut size={16} />,
      danger: true,
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    console.log("Menu clicked:", e.key);
    // Handle menu actions here
    if (e.key === "logout") {
      // Implement logout logic
      deleteToken();
      setUserId("");
      dispatch(logout());
      navigate("/login");

      // clear all local storage
      localStorage.clear();
    } else if (e.key === "profile") {
      // Navigate to profile page
      navigate("/profile");
    } else if (e.key === "settings") {
      // Navigate to settings page
      navigate("/settings");
    }
  };

  return (
    <header className="h-16 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu size={20} />
          </Button>

          <div className="hidden md:block">
            <HeaderBreadcrumbs />
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8 hidden sm:block">
          <Input.Search
            placeholder="Search anything..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={(value) => console.log("Search:", value)}
            className="w-full"
            size="middle"
            allowClear
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Search Button for Mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden cursor-pointer"
          >
            <Search size={20} />
          </Button>

          {/* Plan Badge */}
          {subLoaded && (
            <button
              onClick={() => navigate("/plans")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer hover:shadow-md"
              style={{
                background:
                  subscription && subscription.status === "ACTIVE"
                    ? subscription.plan.name === "ENTERPRISE"
                      ? "linear-gradient(135deg, #f59e0b, #d97706)"
                      : "linear-gradient(135deg, #6366f1, #3b82f6)"
                    : "#f3f4f6",
                color:
                  subscription && subscription.status === "ACTIVE"
                    ? "#fff"
                    : "#374151",
                border:
                  subscription && subscription.status === "ACTIVE"
                    ? "none"
                    : "1px solid #e5e7eb",
              }}
            >
              {subscription && subscription.status === "ACTIVE" ? (
                <>
                  <Crown size={14} />
                  {subscription.plan.displayName}
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Upgrade
                  <ArrowUpRight size={12} />
                </>
              )}
            </button>
          )}

          {/* Notifications */}
          <Popover
            content={<NotificationList onItemClick={() => setOpenNotifications(false)} />}
            trigger="click"
            open={openNotifications}
            onOpenChange={setOpenNotifications}
            placement="bottomRight"
            arrow={false}
            overlayInnerStyle={{ padding: 0, borderRadius: '0.75rem', overflow: 'hidden' }}
          >
            <Badge count={unreadCount} size="small" className="relative pb-2 cursor-pointer">
              <Button
                variant="ghost"
                size="sm"
                className="relative cursor-pointer"
              >
                <Bell size={20} />
              </Button>
            </Badge>
          </Popover>

          {/* Settings */}
          <Button variant="ghost" size="sm" className="cursor-pointer">
            <Settings size={20} />
          </Button>

          {/* User Profile Dropdown */}
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleMenuClick }}
            trigger={["click"]}
            placement="bottomRight"
            arrow
          >
            <div className="flex items-center gap-3  cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
              <Avatar
                size="default"
                src={
                  user?.avatar ||
                  "https://avatars.githubusercontent.com/u/12345678?v=4"
                }
                icon={<User />}
                className="shadow-sm mr-2"
              />
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-700">
                  {user?.name || "John Doe"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email || "john@example.com"}
                </div>
              </div>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Header;
