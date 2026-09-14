import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import './UserNavBar.css'; // Import the CSS file for styling

const UserNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // This checks the current URL to apply the 'active' class (yellow highlight)
  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <div className="bottom-bar">
      {/* Home */}
      <button className={`nav-btn ${isActive("/home")}`} onClick={() => navigate("/home")}>
        <svg viewBox="0 0 24 24" className="nav-icon"><path d="M3 10.5L12 3l9 7.5V21h-6v-6H9v6H3z" /></svg>
      </button>

      {/* Emergency */}
      <button className={`nav-btn ${isActive("/emergency")}`} onClick={() => navigate("/emergency")}>
        <svg viewBox="0 0 24 24" className="nav-icon"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
      </button>

      {/* Message (Updated SVG Path) */}
      <button className={`nav-btn ${isActive("/message")}`} onClick={() => navigate("/message")}>
        <svg viewBox="0 0 24 24" className="nav-icon">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </button>

      {/* Notification */}
      <button className={`nav-btn ${isActive("/notification")}`} onClick={() => navigate("/notification")}>
        <svg viewBox="0 0 24 24" className="nav-icon">
          <path d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5L4 18v1h16v-1l-2-2z" />
        </svg>
      </button>

      {/* Profile */}
      <button className={`nav-btn ${isActive("/profile")}`} onClick={() => navigate("/profile")}>
        <svg viewBox="0 0 24 24" className="nav-icon">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      </button>
    </div>
  );
};

export default UserNavBar;