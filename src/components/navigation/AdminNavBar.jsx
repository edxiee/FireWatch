import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminNavBar.css";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <div className="bottom-bar">
      <button className={`nav-btn ${isActive("/admin")}`} onClick={() => navigate("/admin")}>
        <svg viewBox="0 0 24 24" className="nav-icon"><path d="M3 10.5L12 3l9 7.5V21h-6v-6H9v6H3z" /></svg>
      </button>
      <button className={`nav-btn ${isActive("/admin/messages")}`} onClick={() => navigate("/admin/messages")}>
        <svg viewBox="0 0 24 24" className="nav-icon"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
      </button>
      <button className={`nav-btn ${isActive("/admin/notifications")}`} onClick={() => navigate("/admin/notifications")}>
        <svg viewBox="0 0 24 24" className="nav-icon"><path d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5L4 18v1h16v-1l-2-2z" /></svg>
      </button>
      <button className={`nav-btn ${isActive("/admin/profile")}`} onClick={() => navigate("/admin/profile")}>
        <svg viewBox="0 0 24 24" className="nav-icon"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></svg>
      </button>
    </div>
  );
}