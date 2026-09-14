import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../services/firebase.js";
import { collection, query, where, onSnapshot, getCountFromServer } from "firebase/firestore";
import AdminNavbar from "../../../components/navigation/AdminNavBar.jsx";
import "./AdminScreen.css"; 

export default function AdminScreen() {
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [stats, setStats] = useState({ reports: 0, users: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const emergenciesQuery = query(
      collection(db, "emergencies"),
      where("status", "==", "active")
    );

    const unsubscribeEmergencies = onSnapshot(
      emergenciesQuery,

      (snapshot) => {
        if (!snapshot.empty) {
          const emergencyDoc = snapshot.docs[0];

          setActiveEmergency({
            id: emergencyDoc.id,
            ...emergencyDoc.data(),
          });

          const audio = new Audio(
            "https://assets.mixkit.co/sfx/preview/mixkit-emergency-alert-alarm-1007.mp3"
          );

          audio
            .play()
            .catch(() =>
              console.log("Audio waiting for interaction")
            );
        } else {
          setActiveEmergency(null);
        }
      },

      (error) => {
        console.error(
          "[FireWatch] Emergency listener error:",
          error
        );

        setActiveEmergency(null);
      }
    );

    const fetchStats = async () => {
      try {
        const reportsColl = collection(db, "emergencies");
        const usersColl = collection(db, "users");

        const [reportCount, userCount] = await Promise.all([
          getCountFromServer(reportsColl),
          getCountFromServer(usersColl),
        ]);

        setStats({
          reports: reportCount.data().count,
          users: userCount.data().count,
        });
      } catch (error) {
        console.error(
          "[FireWatch] Failed to load dashboard statistics:",
          error
        );
      }
    };

    fetchStats();

    return () => {
      unsubscribeEmergencies();
    };
  }, []);

  return (
    <div className="admin-layout">
      {/* EMERGENCY OVERLAY */}
      {activeEmergency && (
        <div className="emergency-overlay">
          <div className="emergency-modal">
            {/* SVG Siren Icon */}
            <div className="flashing-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h1>FIRE EMERGENCY!</h1>
            <div className="emergency-details">
              <p><strong>User:</strong> {activeEmergency.userEmail}</p>
              <p><strong>Location:</strong> {activeEmergency.latitude}, {activeEmergency.longitude}</p>
            </div>
            <button className="view-details-btn" onClick={() => navigate("/admin/notifications")}>
              RESPOND NOW
            </button>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="admin-top-bar">
        <img className="top-logo" src="/Logo.png" alt="Logo" />
        <div className="top-title">Dashboard</div>
      </div>

      <div className="admin-content">
        <div className="welcome-section">
          <h2 className="services-header">System Overview</h2>
          <div className="header-line"></div>
          <p className="services-subtitle">Real-time community monitoring</p>
        </div>

        {/* STATS GRID */}
        <div className="stats-grid">
          <div className="stat-card urgent">
            <span className="stat-value">{activeEmergency ? "1" : "0"}</span>
            <span className="stat-label">Active Fires</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.users}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.reports}</span>
            <span className="stat-label">Total Logs</span>
          </div>
          
          <div className="stat-card" onClick={() => navigate("/admin/messages")}>
            <span className="stat-value">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </span>
            <span className="stat-label">Support Chat</span>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="quick-actions">
          <h3 className="section-title">Quick Actions</h3>
          <div className="action-row">
            <button className="action-tile" onClick={() => navigate("/admin/notifications")}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span>Notifications</span>
            </button>
            
            <button className="action-tile" onClick={() => navigate("/admin/users")}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Users</span>
            </button>
            
            <button className="action-tile" onClick={() => navigate("/admin/create-account")}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="17" y1="11" x2="23" y2="11"/>
              </svg>
              <span>Add Admin</span>
            </button>
          </div>
        </div>
      </div>
      <AdminNavbar />
    </div>
  );
}