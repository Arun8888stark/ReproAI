import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBug } from "react-icons/fa";
import { FiHome, FiPlusSquare, FiClock, FiBarChart2, FiSettings, FiX } from "react-icons/fi";
import { api } from "../api";

const LINKS = [
  { to: "/", label: "Dashboard", icon: FiHome, end: true },
  { to: "/new", label: "New Report", icon: FiPlusSquare },
  { to: "/history", label: "History", icon: FiClock },
  { to: "/analytics", label: "Analytics", icon: FiBarChart2 },
  { to: "/settings", label: "Settings", icon: FiSettings },
];

function Sidebar({ open, onClose }) {
  const [online, setOnline] = useState(null);

  useEffect(() => {
    const check = () => api.health().then(() => setOnline(true)).catch(() => setOnline(false));
    check();
    const t = setInterval(check, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {open && <div className="scrim" onClick={onClose} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <FaBug className="brand-icon" />
          <div>
            <p className="brand-name">Repro<span>AI</span></p>
            <p className="brand-tag">From Bug Reports to Verified Playwright Tests</p>
          </div>
          <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu"><FiX /></button>
        </div>

        <nav className="nav">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose}>
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className={`engine ${online === false ? "engine-down" : online ? "engine-up" : ""}`}>
            <span className="dot" />
            {online === null ? "Checking engine…" : online ? "AI engine online" : "Engine offline"}
          </div>
          <div className="user-card">
            <span className="avatar">D</span>
            <div>
              <p>Dinesh Kumar</p>
              <small>Team Veridyn</small>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
