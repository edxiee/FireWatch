import React, { useState } from "react";
import { auth, db } from "../../../services/firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../../components/navigation/AdminNavBar.jsx";
import "./CreateAdmin.css";

export default function CreateAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      const adminDoc = await getDoc(doc(db, "users", currentUser.uid));

      if (!adminDoc.exists() || adminDoc.data().role !== "admin") {
        alert("Unauthorized: You do not have permission to create admin.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      await setDoc(doc(db, "users", newUser.uid), {
        firstName: name,
        lastName: "(Admin)",
        email: email,
        role: "admin",
        createdAt: new Date(),
      });

      alert("New Admin Account Created Successfully!");
      navigate("/admin/profile");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="profile-wrapper"> {/* Use profile-wrapper for consistency */}
      {/* TOP BAR - Title Only */}
      <div className="admin-top-bar">
        <button onClick={() => navigate(-1)} className="back-btn">
          <span className="back-icon">â†</span>
        </button>
        <div className="top-title">Register Admin</div>
      </div>

      <div className="content-scrollable">
        <div className="edit-body" style={{ marginTop: "20px" }}>
          <form className="edit-form" onSubmit={handleCreateAdmin}>
            <div className="input-field-group">
              <label className="input-label">Admin Full Name</label>
              <input 
                className="edit-input"
                type="text" placeholder="e.g. Officer Juan" required 
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="input-field-group">
              <label className="input-label">Admin Email</label>
              <input 
                className="edit-input"
                type="email" placeholder="admin@firewatch.com" required 
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-field-group">
              <label className="input-label">Temporary Password</label>
              <input 
                className="edit-input"
                type="password" placeholder="Min 6 characters" required 
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="save-changes-btn" disabled={loading}>
              {loading ? "Creating..." : "Confirm Registration"}
            </button>
          </form>
        </div>
      </div>
      <AdminNavbar />
    </div>
  );
}
