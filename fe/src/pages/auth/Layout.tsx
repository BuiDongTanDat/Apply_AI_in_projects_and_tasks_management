import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import EmailSent from "./components/EmailSent";
import VerifyEmail from "./components/VerifyEmail";
import "./Layout.scss";

export interface AuthLayoutProps {
  type: "login" | "register" | "email-sent" | "verify-email";
}

const formMap = {
  login: LoginForm,
  register: RegisterForm,
  "email-sent": EmailSent,
  "verify-email": VerifyEmail,
};

export const AuthLayout = ({ type }: AuthLayoutProps) => {
  const Component = formMap[type];
  return (
    <div className="container-single">
      <Component />
    </div>
  );
};
