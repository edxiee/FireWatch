import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../../services/firebase.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/navigation/AdminNavBar.jsx";
import "./EditProfile.css";

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const fullName = data.lastName 
            ? `${data.firstName} ${data.lastName}` 
            : (data.firstName || "Admin");
            
          setName(fullName);
          setPhone(data.contactNumber || "");
          setAddress(data.address || "");
          setPreviewUrl(data.profileImage || "");
        }
      }
    };
    fetchUserData();
  }, [user]);

  // Convert image to Base64 for permanent storage
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (Firestore documents have a 1MB limit)
      if (file.size > 800000) {
        alert("Image is too large. Please select an image under 800KB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // This is a permanent Base64 string
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        contactNumber: phone,
        address: address,
        profileImage: previewUrl, 
      });
      alert("Profile updated successfully!");
      navigate("/admin/profile");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-wrapper">
      <div className="admin-top-bar">
        <button onClick={() => navigate(-1)} className="back-btn" title="Go Back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
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
              {/* Only show image if it is a real Base64 string or URL */}
              {previewUrl && previewUrl.startsWith('data:image') ? (
                <img src={previewUrl} alt="Profile" className="profile-img-preview" />
              ) : (
                /* Fallback to SVG person icon */
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-person-circle default-avatar-svg" viewBox="0 0 16 16" style={{width: '70%', height: '70%', color: '#a31224'}}>
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                  <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                </svg>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              onChange={handleImageChange} 
            />
            
            <button 
              type="button" 
              className="change-photo-btn" 
              onClick={() => fileInputRef.current.click()}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#FFD700',
                padding: '4px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8.37722C2 8.0269 2 7.85174 2.01462 7.70421C2.1556 6.28127 3.28127 5.1556 4.70421 5.01462C4.85174 5 5.03636 5 5.40558 5C5.54785 5 5.61899 5 5.67939 4.99634C6.45061 4.94963 7.12595 4.46288 7.41414 3.746C7.43671 3.68986 7.45781 3.62657 7.5 3.5C7.54219 3.37343 7.56329 3.31014 7.58586 3.254C7.87405 2.53712 8.54939 2.05037 9.32061 2.00366C9.38101 2 9.44772 2 9.58114 2H14.4189C14.5523 2 14.619 2 14.6794 2.00366C15.4506 2.05037 16.126 2.53712 16.4141 3.254C16.4367 3.31014 16.4578 3.37343 16.5 3.5C16.5422 3.62657 16.5633 3.68986 16.5859 3.746C16.874 4.46288 17.5494 4.94963 18.3206 4.99634C18.381 5 18.4521 5 18.5944 5C18.9636 5 19.1483 5 19.2958 5.01462C20.7187 5.1556 21.8444 6.28127 21.9854 7.70421C22 7.85174 22 8.0269 22 8.37722V16.2C22 17.8802 22 18.7202 21.673 19.362C21.3854 19.9265 20.9265 20.3854 20.362 20.673C19.7202 21 18.8802 21 17.2 21H6.8C5.11984 21 4.27976 21 3.63803 20.673C3.07354 20.3854 2.6146 19.9265 2.32698 19.362C2 18.7202 2 17.8802 2 16.2V8.37722Z" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16.5C14.2091 16.5 16 14.7091 16 12.5C16 10.2909 14.2091 8.5 12 8.5C9.79086 8.5 8 10.2909 8 12.5C8 14.7091 9.79086 16.5 12 16.5Z" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="edit-body">
          <form onSubmit={handleUpdate} className="edit-form">
            <div className="input-field-group">
              <label className="input-label">Full Name</label>
              <input type="text" className="edit-input disabled" value={name} disabled />
            </div>

            <div className="input-field-group">
              <label className="input-label">Email Address</label>
              <input type="text" className="edit-input disabled" value={user?.email || ""} disabled />
            </div>

            <div className="input-field-group">
              <label className="input-label">Contact Number</label>
              <input 
                type="tel" 
                className="edit-input" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="0912 345 6789"
              />
            </div>

            <div className="input-field-group">
              <label className="input-label">Home Address</label>
              <textarea 
                className="edit-input text-area" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="Enter complete home address"
                rows="3"
              />
            </div>

            <button type="submit" className="save-changes-btn" disabled={loading}>
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
      <AdminNavbar />
    </div>
  );
}
