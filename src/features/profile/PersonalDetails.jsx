import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebase.js"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import UserNavBar from "../../components/navigation/UserNavBar.jsx"; 
import "./PersonalDetails.css"; 

export default function PersonalDetails() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const user = auth.currentUser;

  // --- MASKING HELPERS ---
  const maskEmail = (email) => {
    if (!email) return "No Email";
    const [userPart, domain] = email.split("@");
    if (userPart.length <= 2) return `*@${domain}`;
    return `${userPart[0]}${"*".repeat(userPart.length - 2)}${userPart.slice(-1)}@${domain}`;
  };

  const maskPhone = (phone) => {
    if (!phone) return "Not set";
    const strPhone = String(phone);
    // Shows only the last 4 digits: *******6789
    return strPhone.length > 4 
      ? "*".repeat(strPhone.length - 4) + strPhone.slice(-4) 
      : "****";
  };

  const maskAddress = (address) => {
    if (!address) return "No address provided";
    // Shows the first 5 characters then masks the rest
    return address.length > 5 
      ? address.slice(0, 5) + "*".repeat(address.length - 5) 
      : "*****";
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); 
    } catch (error) {
      alert("Error logging out: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="profile-wrapper" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
        <div style={{color: '#a31224', fontWeight: 'bold', textAlign: 'center'}}>
          Loading Profile...
        </div>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <div className="admin-top-bar">
        <div className="top-title">PROFILE</div>
      </div>

      <div className="content-scrollable">
        <div className="profile-header-red">
          <div className="profile-main">
            <div className="avatar-container">
              <div className="avatar-img">
                {userData?.profileImage && userData.profileImage.startsWith('data:image') ? (
                  <img src={userData.profileImage} alt="" className="profile-pic-img" />
                ) : (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="currentColor" 
                    className="bi bi-person-circle default-avatar-svg" 
                    viewBox="0 0 16 16"
                  >
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                  </svg>
                )}
              </div>
            </div>
            
            <h2 className="profile-name">{userData?.fullName || userData?.firstName || "User"}</h2>
            <p className="profile-email">{maskEmail(user?.email)}</p>
            
            <button className="edit-profile-btn" onClick={() => navigate("/edit-profile")}>
              Edit Profile
            </button>
          </div>
        </div>

        <div className="profile-body-light">
          <div className="menu-list">
            
            <div className="menu-item-compact">
              <div className="menu-icon-small yellow-bg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div className="menu-text-compact">
                <p className="menu-title-small">Phone</p>
                <p className="menu-subtext">{maskPhone(userData?.contact || userData?.phone)}</p>
              </div>
            </div>

            <div className="menu-item-compact">
              <div className="menu-icon-small purple-bg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="menu-text-compact">
                <p className="menu-title-small">Address</p>
                <p className="menu-subtext">{maskAddress(userData?.address)}</p>
              </div>
            </div>

            <div className="menu-item-compact logout" onClick={handleLogout}>
              <div className="menu-icon-small red-bg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <div className="menu-text-compact">
                <p className="menu-title-small red-text">Logout</p>
              </div>
              <div className="arrow-small">â€º</div>
            </div>

          </div>
        </div>
      </div>

      <UserNavBar />
    </div>
  );
}
