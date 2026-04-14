import { Link } from "react-router";
import "./Form.scss";
import logo from "@/assets/logo.png";
import { MdOutlineMarkEmailRead } from "react-icons/md";

const EmailSent = () => {
  return (
    <div className="form-container">
      <div className="flex justify-center mb-2">
        <img src={logo} alt="Logo" className="h-12" />
      </div>

      <div className="flex flex-col items-center text-center gap-4 mt-6">
        <MdOutlineMarkEmailRead size={64} className="text-blue-500" />

        <h1 className="text-2xl font-semibold">Check your email</h1>

        <p className="text-gray-500 text-sm leading-relaxed">
          We've sent a verification link to your email address. Please check
          your inbox and click the link to verify your account.
        </p>

        <p className="text-gray-400 text-xs">
          Didn't receive the email? Check your spam folder or try registering
          again.
        </p>
      </div>

      <div className="text-sm text-gray-400 mt-8 w-full text-center">
        Back to{" "}
        <Link to="/login" className="text-blue-600 font-medium">
          Login
        </Link>
      </div>
    </div>
  );
};

export default EmailSent;
