import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import "./Auth.css";

// --- SVG ICONS ---
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);

export default function Auth() {
  const navigate = useNavigate();
  
  // ✅ NEW: Auto-redirect if user is already logged in
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.exists() ? userDoc.data() : null;
          
          if (userData && userData.role === "admin") {
            navigate("/admin", { replace: true });
          } else {
            const hasSeenLanding = localStorage.getItem("hasSeenFireWatchIntro");
            navigate(!hasSeenLanding ? "/landing" : "/home", { replace: true });
          }
        } catch (error) {
          console.error("Error checking user role:", error);
        }
      }
    };
    checkAuthAndRedirect();
  }, [navigate]);

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;

        if (userData && userData.role === "admin") {
          navigate("/admin");
          return;
        }

        if (!user.emailVerified) {
          await signOut(auth);
          alert("Please verify your email before logging in. Check your inbox!");
          setLoading(false);
          return;
        }

        const hasSeenLanding = localStorage.getItem("hasSeenFireWatchIntro");
        navigate(!hasSeenLanding ? "/landing" : "/home");

      } else {
        // --- SIGN UP ---
        if (password !== confirmPassword) {
          alert("Passwords do not match!");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          firstName,
          lastName,
          contact,
          address,
          email,
          role: "user",
          createdAt: new Date()
        });
        
        await sendEmailVerification(user);
        await signOut(auth); 
        
        setVerificationSent(true);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="auth-container">
        <div className="auth-header"><img src="/Logo.png" alt="FireWatch" className="auth-logo" /></div>
        <div className="auth-card" style={{ textAlign: "center", padding: "40px 20px" }}>
          <h2 style={{ color: "#a31224", marginBottom: "15px" }}>Check Your Email!</h2>
          <p style={{ color: "#555", marginBottom: "25px", lineHeight: "1.5" }}>
            We've sent a verification link to <strong>{email}</strong>. Please click the link to verify your account before logging in.
          </p>
          <button 
            className="submit-btn" 
            onClick={() => {
              setVerificationSent(false);
              setIsLogin(true);
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-header"><img src="/Logo.png" alt="FireWatch" className="auth-logo" /></div>
      <div className="auth-card">
        <div className="tab-container">
          <button type="button" className={`tab ${isLogin ? "active" : ""}`} onClick={() => setIsLogin(true)}>Login</button>
          <button type="button" className={`tab ${!isLogin ? "active" : ""}`} onClick={() => setIsLogin(false)}>Sign Up</button>
        </div>

        <form className="auth-form" onSubmit={handleAuth}>
          <div className="scrollable-fields">
            {!isLogin && (
              <>
                <div className="input-row">
                  <div className="input-group"><label>First Name</label><input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
                  <div className="input-group"><label>Last Name</label><input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
                </div>
                <div className="input-group"><label>Contact No.</label><input type="tel" required pattern="[0-9]{11}" value={contact} onChange={(e) => setContact(e.target.value)} /></div>
                <div className="input-group"><label>Address</label><input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} /></div>
              </>
            )}
            <div className="input-group"><label>Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            
            <div className="input-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
              {isLogin && (
                <div className="forgot-password-container">
                  <span className="forgot-password-link" onClick={handleForgotPassword} style={{ cursor: "pointer" }}>Forgot Password?</span>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="input-group">
                <label>Confirm Password</label>
                <div className="password-wrapper">
                  <input type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                </div>
              </div>
            )}
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>{loading ? "Processing..." : (isLogin ? "Login" : "Sign Up")}</button>
        </form>
        <p className="auth-footer-text" onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}</p>
      </div>
    </div>
  );
}