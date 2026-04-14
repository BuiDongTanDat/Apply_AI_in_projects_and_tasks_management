import { useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import logo from "@/assets/logo.png";
import "./Form.scss";
import { useCookie } from "@/hooks/logic/useCookie";
import { useLocalStorage } from "@/hooks/logic/useLocalStorage";
import { useAppDispatch } from "@/store/hook";
import { authApi } from "@/api/auth.api";
import { loginSuccess } from "@/store/slices/user-info";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [, setAccessToken] = useCookie("access_token", "", 7);
  const [, setUserId] = useLocalStorage("user_id", "");

  const dispatch = useAppDispatch();

  const fetch = async () => {
    debugger;
    try {
      const { metadata } = await authApi.profile();
      dispatch(
        loginSuccess({
          user: metadata,
          isAuthenticated: true
        }),
      );
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const userId = +(searchParams.get("userId") || 0);

    if (accessToken && refreshToken && userId) {
      setAccessToken(accessToken);
      //@ts-ignore
      setUserId(userId);
      fetch();
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="container-single">
      <div className="form-container">
        <div className="flex justify-center mb-2">
          <img src={logo} alt="Logo" className="h-12" />
        </div>
        <p className="text-gray-400 text-sm font-medium text-center">
          Đang xử lý đăng nhập...
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;
