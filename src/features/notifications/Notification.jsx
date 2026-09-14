import React, { useState, useEffect } from 'react';
import { db, auth } from "../../services/firebase.js";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import UserNavBar from '../../components/navigation/UserNavBar.jsx'; 
import './Notification.css'; 

const Notification = () => {
  const [latestEmergency, setLatestEmergency] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen to the most recent emergency report created by THIS user
    const q = query(
      collection(db, "emergencies"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLatestEmergency({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
    });

    return () => unsubscribe();
  }, []);

  // Determine the message based on the status set by the Admin
  const getStatusContent = () => {
    if (!latestEmergency) {
      return (
        <div className="notif-card">
          <p>No active notifications at this time.</p>
        </div>
      );
    }

    if (latestEmergency.status === "responding") {
      return (
        <div className="notif-card responding">
          <strong>ðŸš’ Response in Progress</strong>
          <p>The fireman responded to your help request</p>
        </div>
      );
    }

    if (latestEmergency.status === "resolved") {
      return (
        <div className="notif-card success">
          <strong>âœ… Alert Resolved</strong>
          <p>Your help request has been resolved</p>
        </div>
      );
    }

    // Default "Active" state
    return (
      <div className="notif-card danger">
        <strong>ðŸ”¥ Emergency Reported</strong>
        <p>Your request is active. Waiting for fireman response...</p>
      </div>
    );
  };

  return (
    <div className="homescreen">
      <header className="top-bar">
        <img className="top-logo" src="/Logo.png" alt="FireWatch Logo" />
        <div className="top-title">Notification</div>
      </header>

      <main className="content">
        <div className="notification-list">
          {getStatusContent()}
        </div>
      </main>

      <UserNavBar />
    </div>
  );
};

export default Notification;
