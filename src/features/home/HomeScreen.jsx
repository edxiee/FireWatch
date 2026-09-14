import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import UserNavBar from "../../components/navigation/UserNavBar.jsx"; 
import "./HomeScreen.css";

export default function HomeScreen() {
  const navigate = useNavigate(); // Initialize the hook

  return (
    <div className="homescreen">
      <div className="bg-glow"></div>

      {/* TOP BAR */}
      <div className="top-bar">
        <img className="top-logo" src="./Logo.png" alt="FireWatch Logo" />
        <div className="top-title">FireWatch</div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="content">
        <div className="services-container">
          
          <div className="welcome-section">
            <h2 className="services-header">Our Services</h2>
            <div className="header-line"></div>
            <p className="services-subtitle">
              Your safety is our priority. Explore how FireWatch helps you.
            </p>
          </div>
          
          <div className="services-grid">
            {/* SERVICE 1: FIRE PREVENTION */}
            <div className="service-box" onClick={() => navigate('/emergency')}>
              <div className="icon-circle">
                <svg viewBox="0 0 24 24" className="service-icon">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 3.03-3.08 7.37-5 9.77C10.08 16.37 7 12.03 7 9z"/>
                  <path d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/>
                </svg>
              </div>
              <div className="service-text">
                <h3>FIRE PREVENTION</h3>
                <p>Safety tips and emergency preparedness guides.</p>
              </div>
              <div className="arrow-link">â†’</div>
            </div>

            {/* SERVICE 2: NOTIFICATION */}
            <div className="service-box" onClick={() => navigate('/notification')}>
              <div className="icon-circle">
                <svg viewBox="0 0 24 24" className="service-icon">
                  <path d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5L4 18v1h16v-1l-2-2z" />
                </svg>
              </div>
              <div className="service-text">
                <h3>Notification</h3>
                <p>Allow our notification features to keep you informed.</p>
              </div>
              <div className="arrow-link">â†’</div>
            </div>

            {/* SERVICE 3: MESSAGES */}
            <div className="service-box" onClick={() => navigate('/message')}>
              <div className="icon-circle">
                <svg viewBox="0 0 24 24" className="service-icon">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </div>
              <div className="service-text">
                <h3>Messages</h3>
                <p>Direct communication for reporting and updates.</p>
              </div>
              <div className="arrow-link">â†’</div>
            </div>

            {/* SERVICE 4: USER PROFILE */}
            <div className="service-box" onClick={() => navigate('/profile')}>
              <div className="icon-circle">
                <svg viewBox="0 0 24 24" className="service-icon">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className="service-text">
                <h3>User Profile</h3>
                <p>Edit your personal details so we would know you better.</p>
              </div>
              <div className="arrow-link">â†’</div>
            </div>
          </div>
        </div>

        {/* ABOUT US SECTION */}
        <div className="about-section">
          <div className="about-header-group">
            <h2 className="services-header">About us</h2>
            <div className="header-line"></div>
          </div>
          <p className="about-text">
            FireWatch is committed to improving public safety through proactive fire prevention tools, 
            timely alerts, and direct engagement. Our mission is to provide all citizens with the tools
            and knowledge necessary to build a safer and more fire-resilient community for everyone.
          </p>
        </div>
      </div>

      {/* SHARED BOTTOM NAVIGATION BAR */}
      <UserNavBar />
    </div>
  );
}
