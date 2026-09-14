import React, { useState, useEffect } from "react";
import { db } from "../../services/firebase.js";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  getDoc,  
  serverTimestamp 
} from "firebase/firestore";
import AdminNavbar from "../../components/navigation/AdminNavBar.jsx";
import "./AdminNotifications.css";

// Custom SVG Icon for Resolved State
const CheckIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default function AdminNotifications() {
  const [alerts, setAlerts] = useState([]);

  const playAlarm = () => {
    const alarm = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-emergency-alert-alarm-1007.mp3");
    alarm.volume = 0.5;
    alarm.play().catch(() => console.log("Audio waiting for user interaction."));
  };

  useEffect(() => {
    const q = query(collection(db, "emergencies"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" && change.doc.data().status === "active") {
          playAlarm();
        }
      });

      const alertPromises = snapshot.docs.map(async (alertDoc) => {
        const data = alertDoc.data();
        let fullName = "Loading...";
        
        if (data.userId && data.userId !== "Anonymous") {
          try {
            const userSnap = await getDoc(doc(db, "users", data.userId));
            if (userSnap.exists()) {
              const u = userSnap.data();
              fullName = `${u.firstName} ${u.lastName}`;
            } else {
              fullName = "Unknown User";
            }
          } catch {
            fullName = "Error loading name";
          }
        } else {
          fullName = "Anonymous User";
        }
        return { id: alertDoc.id, ...data, fullName };
      });

      const resolvedAlerts = await Promise.all(alertPromises);
      setAlerts(resolvedAlerts);
    });

    return () => unsubscribe();
  }, []);

  const respondToEmergency = async (id) => {
    try {
      const alertRef = doc(db, "emergencies", id);
      await updateDoc(alertRef, { 
        status: "responding",
        respondedAt: serverTimestamp() 
      });
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const markAsResolved = async (id) => {
    try {
      const alertRef = doc(db, "emergencies", id);
      await updateDoc(alertRef, { 
        status: "resolved",
        resolvedAt: serverTimestamp() 
      });
      alert("Emergency marked as resolved.");
    } catch {
      alert("Permission Denied: Check your Firestore rules.");
    }
  };

  return (
    <div className="homescreen">
      <div className="top-bar">
        <div className="top-title">Notifications</div>
      </div>

      <div className="content">
        <div className="welcome-section">
          <h2 className="services-header">Active Emergencies</h2>
          <p className="services-subtitle">Real-time reports from users.</p>
        </div>

        <div className="alerts-container">
          {alerts.length === 0 ? (
            <p className="no-alerts">No emergency alerts reported.</p>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className={`alert-card ${alert.status}`}>
                <div className="alert-header">
                  <span className="alert-type">ðŸ”¥ {alert.type}</span>
                  <span className="alert-time">
                    {alert.timestamp?.toDate().toLocaleString()}
                  </span>
                </div>
                
                <div className="alert-body">
                  <p><strong>Reporter:</strong> {alert.fullName}</p>
                  <p><strong>Status:</strong> <span className={`status-tag ${alert.status}`}>{alert.status.toUpperCase()}</span></p>
                  
                  {alert.latitude && (
                    <a 
                      href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="map-link"
                    >
                      ðŸ“ View on Google Maps
                    </a>
                  )}
                </div>

                <div className="alert-actions">
                  {/* STEP 1: RESPOND */}
                  {alert.status === "active" && (
                    <button className="respond-btn" onClick={() => respondToEmergency(alert.id)}>
                      RESPOND NOW
                    </button>
                  )}

                  {/* STEP 2: RESOLVE */}
                  {alert.status === "responding" && (
                    <button className="resolve-btn" onClick={() => markAsResolved(alert.id)}>
                      Mark as Resolved
                    </button>
                  )}

                  {/* COMPLETED STATE */}
                  {alert.status === "resolved" && (
                    <div className="resolved-badge">
                      <CheckIcon />
                      <span>Resolved</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <AdminNavbar />
    </div>
  );
}
