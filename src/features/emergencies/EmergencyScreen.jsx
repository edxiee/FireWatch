import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../services/firebase.js"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import UserNavBar from "../../components/navigation/UserNavBar.jsx"; 
import "./EmergencyScreen.css"; 

export default function EmergencyScreen() {
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  
  // LIVE LOCATION STATES
  const [userCoords, setUserCoords] = useState({ lat: 14.628, lng: 121.051 }); 
  const [locationReady, setLocationReady] = useState(false);

  // 1. Live Tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLocationReady(true);
      },
      (err) => {
        console.error("GPS Watch Error:", err);
        setLocationReady(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${userCoords.lng - 0.005}%2C${userCoords.lat - 0.005}%2C${userCoords.lng + 0.005}%2C${userCoords.lat + 0.005}&layer=mapnik&marker=${userCoords.lat}%2C${userCoords.lng}`;

  const handleEmergency = async () => {
    if (isSending) return;

    if (window.confirm("WARNING: Are you sure you want to report a FIRE? This will alert authorities immediately.")) {
      setIsSending(true);

      try {
        const user = auth.currentUser;
        if (!locationReady) throw new Error("LOCATION_NOT_READY");

        await addDoc(collection(db, "emergencies"), {
          userId: user ? user.uid : "Anonymous",
          userEmail: user ? user.email : "No Email",
          type: "FIRE ALERT",
          status: "active",
          timestamp: serverTimestamp(),
          latitude: userCoords.lat,
          longitude: userCoords.lng,
        });

        alert("EMERGENCY ALERT SENT! Help is being notified. Please stay safe.");
        
      } catch (error) {
        if (error.message === "LOCATION_NOT_READY") {
          alert("Wait! We are still getting your GPS signal.");
        } else {
          alert("Failed to send alert. Please call emergency services directly.");
        }
      } finally {
        setTimeout(() => setIsSending(false), 10000);
      }
    }
  };

  return (
    <div className="homescreen">
      <div className="top-bar">
        <img className="top-logo" src="/Logo.png" alt="FireWatch Logo" />
        <div className="top-title">Emergency Center</div>
      </div>

      <div className="content">
        {/* Pulsing Status Text - Centered via CSS */}
        <div className="location-title">
          {locationReady ? (
            <span className="gps-active">ðŸ“ GPS Signal Active</span>
          ) : (
            <span className="searching-gps">ðŸ“¡ Searching for GPS signal...</span>
          )}
        </div>

        {/* Map Container */}
        <div className="map-frame">
          <iframe
            className="map-iframe"
            title="live-map"
            loading="lazy"
            src={mapUrl}
          />
        </div>

        <div className="emergency-title">Tap For Fire Emergency</div>

        {/* SOS Button */}
        <button 
          className={`emergency-circle ${isSending ? "disabled-btn" : ""}`} 
          onClick={handleEmergency} 
          disabled={isSending}
        >
          <div className="inner-glow">
            <span className="signal-waves">(((</span>
            <span className="help-text">{isSending ? "..." : "HELP!"}</span>
            <span className="signal-waves">)))</span>
          </div>
        </button>
      </div>

      <UserNavBar />
    </div>
  );
}
