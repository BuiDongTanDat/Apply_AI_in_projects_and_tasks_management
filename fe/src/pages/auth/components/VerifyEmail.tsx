import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import "./Form.scss";
import logo from "@/assets/logo.png";
import { MdCheckCircleOutline, MdErrorOutline } from "react-icons/md";
import { authApi } from "@/api/auth.api";

type VerifyState = "loading" | "success" | "error";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<VerifyState>("loading");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }

    // TODO: handle API call
    authApi
      .verifyEmail(token)
      .then(() => setState("success"))
      .catch(() => setState("error"));
  }, [token]);

  if (state === "loading") {
    return (
      <div className="form-container">
        <div className="flex justify-center mb-2">
          <img src={logo} alt="Logo" className="h-12" />
        </div>
        <div className="flex flex-col items-center text-center gap-4 mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          <h1 className="text-xl font-semibold">Verifying your email...</h1>
          <p className="text-gray-500 text-sm">
            Please wait while we verify your email address.
          </p>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="form-container">
        <div className="flex justify-center mb-2">
          <img src={logo} alt="Logo" className="h-12" />
        </div>
        <div className="flex flex-col items-center text-center gap-4 mt-6">
          <MdCheckCircleOutline size={64} className="text-green-500" />
          <h1 className="text-2xl font-semibold">Email verified!</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Your email has been successfully verified. You can now log in to
            your account.
          </p>
        </div>
        <div className="text-sm text-gray-400 mt-8 w-full text-center">
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="flex justify-center mb-2">
        <img src={logo} alt="Logo" className="h-12" />
      </div>
      <div className="flex flex-col items-center text-center gap-4 mt-6">
        <MdErrorOutline size={64} className="text-red-500" />
        <h1 className="text-2xl font-semibold">Verification failed</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          The verification link is invalid or has expired. Please try
          registering again.
        </p>
      </div>
      <div className="text-sm text-gray-400 mt-8 w-full text-center">
        <Link
          to="/register"
          className="text-blue-600 font-medium hover:underline"
        >
          Back to Register
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
