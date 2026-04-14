import { useState } from "react";
import { useNavigate } from "react-router";
import { ShieldCheck } from "lucide-react";
import "./AdminLogin.scss";

const ADMIN_PIN = "123456"; // PIN mặc định
const SESSION_KEY = "admin_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 1 ngày

export const setAdminSession = () => {
  const expiry = Date.now() + SESSION_DURATION;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ expiry }));
};

export const isAdminAuthenticated = (): boolean => {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return false;
  try {
    const { expiry } = JSON.parse(raw);
    return Date.now() < expiry;
  } catch {
    return false;
  }
};

export const clearAdminSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
};

const AdminLogin = () => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setError("Please enter password.");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 400));
    if (pin === ADMIN_PIN) {
      setAdminSession();
      navigate("/admin/users");
    } else {
      setError("Invalid password. Please try again.");
      setPin("");
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-icon">
          <ShieldCheck size={40} />
        </div>
        <h1>System Administration</h1>
        <p className="subtitle">Enter password to access admin panel</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="admin-pin">Password</label>
            <input
              id="admin-pin"
              type="password"
              value={pin}
              onChange={(e) => {
                if (e.target.value.length <= 6) setPin(e.target.value);
              }}
              placeholder="Enter password"
              autoFocus
              maxLength={6}
              className={error ? "input-error" : ""}
            />
            {error && <p className="error-msg">{error}</p>}
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
