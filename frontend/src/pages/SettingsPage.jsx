import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="page">
      <article className="panel">
        <div className="panel-head">
          <h2>Settings</h2>
        </div>
        <p className="muted">Manage your session and export preferences from the Transactions page.</p>
        <button
          className="primary-btn"
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Log out
        </button>
      </article>
    </div>
  );
}
