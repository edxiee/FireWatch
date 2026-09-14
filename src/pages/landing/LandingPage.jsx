import React from "react";
import { useNavigate } from "react-router-dom";
import "../../app/App.css";

function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // 1. Save the flag so this screen is hidden on next login
    localStorage.setItem("hasSeenFireWatchIntro", "true");
    
    // 2. Move to the actual app
    navigate("/home");
  };

  return (
    <div className="screen-container">
      <header className="header-section">
        <h1 className="main-title">Start with FireWatch</h1>
      </header>

      <main className="image-section">
        <img src="/Logo.png" alt="FireWatch Logo" className="hero-logo" />
      </main>

      <footer className="footer-section">
        <p className="description-text">
          Login page design is ready: here's a UI concept for an event booking
          app that helps users to keep.
        </p>
        <button className="get-started-btn" onClick={handleGetStarted}>
          Get Started <span className="arrow">â†’</span>
        </button>
      </footer>
    </div>
  );
}

export default LandingPage;
