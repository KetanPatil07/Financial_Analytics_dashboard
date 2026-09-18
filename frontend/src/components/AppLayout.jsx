import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PieChart,
  UserRound,
  MessageSquare,
  Settings,
  Search,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/analytics", label: "Analytics", icon: PieChart },
  { to: "/personal", label: "Personal", icon: UserRound },
  { to: "/messages", label: "Message", icon: MessageSquare },
  { to: "/settings", label: "Setting", icon: Settings },
];

const titles = {
  "/": "Dashboard",
  "/transactions": "Transactions",
  "/wallet": "Wallet",
  "/analytics": "Analytics",
  "/personal": "Personal",
  "/messages": "Message",
  "/settings": "Setting",
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const profileName = user?.name || "User";

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">P</span>
          Penta
        </div>
        <nav>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink key={link.to} to={link.to} end={link.to === "/"} className="nav-link">
                <Icon size={18} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <h1>{titles[location.pathname] || "Dashboard"}</h1>
          <div className="topbar-actions" ref={menuRef}>
            <label className="search">
              <Search size={16} />
              <input placeholder="Search..." />
            </label>
            <button className="icon-btn" type="button">
              <Bell size={18} />
            </button>
            <div className="profile-menu-wrapper">
              <button
                className="avatar-btn"
                type="button"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <img src={user?.avatar} alt={profileName} />
              </button>

              {menuOpen && (
                <div className="profile-menu" role="menu" aria-label="User menu">
                  <div className="profile-menu-item profile-menu-user" role="menuitem">
                    {profileName}
                  </div>
                  <button className="profile-menu-item profile-menu-logout" type="button" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
