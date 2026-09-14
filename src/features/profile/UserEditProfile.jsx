import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../../services/firebase.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import UserNavBar from "../../components/navigation/UserNavBar.jsx"; 
import "./UserEditProfile.css";

export default function UserEditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Focus states to handle visibility safety
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isAddressFocused, setIsAddressFocused] = useState(false);

  // Masking for non-editable fields (Name/Email)
  const maskData = (str, type) => {
    if (!str) return "********";
    if (type === "email") {
      const [userPart, domain] = str.split("@");
      return `${userPart.substring(0, 2)}***@${domain}`;
    }
    return str.split(" ").map(word => 
      word.length > 2 ? `${word[0]}${"*".repeat(word.length - 2)}${word[word.length - 1]}` : `${word[0]}*`
    ).join(" ");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const fullName = data.lastName 
            ? `${data.firstName} ${data.lastName}` 
            : (data.firstName || "User");
          setName(fullName);
          setPhone(data.contact || ""); 
          setAddress(data.address || "");
          setPreviewUrl(data.profileImage || "");
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800000) {
        alert("Image is too large. Max 800KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        contact: phone,
        address: address,
        profileImage: previewUrl, 
      });
      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-wrapper">
      <div className="admin-top-bar">
        <button onClick={() => navigate("/profile")} className="back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" width="20" height="20">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div className="top-title">Edit Profile</div>
      </div>

      <div className="content-scrollable">
        <div className="edit-header-dark">
          <div className="avatar-container-large">
            <div className="avatar-img-large">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" className="profile-img-preview" />
              ) : (
                <svg viewBox="0 0 16 16" width="80" height="80">
                  <path fill="#a31224" d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                  <path fill="#a31224" fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                </svg>
              )}
            </div>
            
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageChange} />
            
            <button type="button" className="change-photo-btn" onClick={() => fileInputRef.current.click()}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="22" 
                height="22" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#1a1a1a" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </button>
          </div>
        </div>

        <div className="edit-body">
          <form onSubmit={handleUpdate} className="edit-form">
            <div className="input-field-group">
              <label className="input-label">Full Name (Protected)</label>
              <input type="text" className="edit-input disabled" value={maskData(name, "name")} disabled />
            </div>
            
            <div className="input-field-group">
              <label className="input-label">Email (Protected)</label>
              <input type="text" className="edit-input disabled" value={maskData(user?.email, "email")} disabled />
            </div>

            <div className="input-field-group">
              <label className="input-label">Contact Number</label>
              <input 
                type={isPhoneFocused ? "tel" : "password"} 
                className="edit-input" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                onFocus={() => setIsPhoneFocused(true)}
                onBlur={() => setIsPhoneFocused(false)}
                placeholder="09xx xxx xxxx" 
              />
            </div>

            <div className="input-field-group">
              <label className="input-label">Home Address</label>
              <textarea 
                className={`edit-input text-area ${!isAddressFocused ? "blurred-field" : ""}`} 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                onFocus={() => setIsAddressFocused(true)}
                onBlur={() => setIsAddressFocused(false)}
                rows="3" 
                placeholder="Enter address..." 
              />
            </div>

            <button type="submit" className="save-changes-btn" disabled={loading}>
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
      <UserNavBar />
    </div>
  );
}
