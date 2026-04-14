import { authApi } from "@/api/auth.api";
import { useCookie } from "@/hooks/logic/useCookie";
import { useLocalStorage } from "@/hooks/logic/useLocalStorage";
import AppLoading from "@/pages/AppLoading";
import { useAppDispatch } from "@/store/hook";
import { setUser } from "@/store/slices/user-info";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";

// Routes không cần auth (end-user)
const whiteList = ["/login", "/register", "/forgot-password", "/"];

// Admin routes có guard riêng — AuthProvider không được can thiệp
const isAdminRoute = (pathname: string) => pathname.startsWith("/admin");

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [token, ,] = useCookie("access_token", "");
  const [userId] = useLocalStorage("user_id", "");
  const dispatch = useAppDispatch();
  const location = useLocation();

  // Lưu pathname tại thời điểm mount để sau auth thành công quay lại đúng trang
  const intendedPath = useRef(location.pathname);

  const handleAuth = async () => {
    try {
      const data = await authApi.profile();
      dispatch(setUser(data.metadata));

      // Chỉ redirect về /team khi người dùng đang ở "/" (root) — không redirect nếu đang ở trang cụ thể như /task
      if (intendedPath.current === "/" || intendedPath.current === "") {
        navigate("/team");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // navigate("/login");
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    // Admin routes: skip hoàn toàn
    if (isAdminRoute(location.pathname)) {
      setIsLoaded(true);
      return;
    }

    if (!whiteList.includes(location.pathname)) {
      if (!token || !userId) {
        navigate("/login");
      } else {
        // Cập nhật intended path theo pathname hiện tại
        intendedPath.current = location.pathname;
        handleAuth();
      }
    } else {
      setIsLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (!isLoaded) {
    return <AppLoading />;
  }

  return <>{children}</>;
};
