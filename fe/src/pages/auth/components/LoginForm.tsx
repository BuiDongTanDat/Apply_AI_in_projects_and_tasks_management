import { loginSchema, LoginSchemaType } from "@/schema/auth.schema";
import { useForm, SubmitHandler } from "react-hook-form";
import "./Form.scss";
import logo from "@/assets/logo.png";
import { Button } from "@/components/element/button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { StylingInput } from "@/components/element/input";
import { Link } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "@/api/auth.api";
import { useCookie } from "@/hooks/logic/useCookie";
import { useState } from "react";
import { useLocalStorage } from "@/hooks/logic/useLocalStorage";
import { useNavigate } from "react-router";
import { useAppDispatch } from "@/store/hook";
import { loginSuccess } from "@/store/slices/user-info";
import { alert } from "@/provider/AlertService";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const LoginForm = () => {
  const [, setAccessToken] = useCookie("access_token", "", 7);
  const [, setUserId] = useLocalStorage("user_id", "");

  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  // state for loading
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  // function to submit
  const onSubmit: SubmitHandler<LoginSchemaType> = async (data) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(data);
      if (response) {
        setAccessToken(response.metadata.token.accessToken);
        setUserId(response.metadata.user.id);
        dispatch(
          loginSuccess({
            user: response.metadata.user,
            isAuthenticated: !!response.metadata.token,
          }),
        );
        navigate("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      {/* section logo */}
      <div className="flex justify-center mb-2">
        <img src={logo} alt="Logo" className="h-12" />
      </div>

      {/* section intro */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">
          Login to continue rising
        </h1>
        <p className="text-gray-400 text-sm font-medium">
          Enter your credentials to access your account
        </p>
      </div>

      {/* section form */}
      <form className="mt-6 gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Button
          variant="white"
          leftIcon={isGoogleLoading ? <AiOutlineLoading3Quarters size={22} className="animate-spin" /> : <FcGoogle size={22} />}
          className="mb-6"
          type="button"
          disabled={isGoogleLoading}
          onClick={async () => {
            try {
              setIsGoogleLoading(true);
              const response = await authApi.getGoogleAuthUrl();
              window.location.href = response.metadata.url;
            } catch {
              alert("Không thể kết nối Google", "Lỗi", "error");
              setIsGoogleLoading(false);
            }
          }}
        >
          {isGoogleLoading ? "Redirecting..." : "Login with Google"}
        </Button>
        <Button
          variant="white"
          leftIcon={<FaGithub size={22} />}
          className="mb-6"
          type="button"
          onClick={() =>
            alert("Tính năng đang được phát triển", "Thông báo", "info")
          }
        >
          Login with GitHub
        </Button>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <StylingInput
            placeholder="youremail@domain.com"
            variant="normal"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        <div className="form-group">
          <div className="form-label-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            {/* <button
              type="button"
              tabIndex={-1}
              className="text-blue-600 hover:underline text-sm"
              onClick={() =>
                alert("Tính năng đang được phát triển", "Thông báo", "info")
              }
            >
              Forgot password?
            </button> */}
          </div>
          <StylingInput
            placeholder="********"
            variant="normal"
            type="password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          variant="primary"
          type="submit"
          className="mt-4"
          isLoading={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div className="text-sm text-gray-400 mt-3 w-full text-center">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-600 font-medium">
          Register
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
