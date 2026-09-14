import React, { useState, useEffect } from "react";
import { db } from "../../../services/firebase.js";
import { collection, onSnapshot, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../../components/navigation/AdminNavBar.jsx";
import "./UserList.css";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'admin', or 'user'
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("firstName", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
    });
    return () => unsubscribe();
  }, []);

  const deleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteDoc(doc(db, "users", id));
        alert("User deleted successfully.");
      } catch (error) {
        alert("Error deleting user: " + error.message);
      }
    }
  };

  // Logic to handle both Search and Role Filtering
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filter === "all" ? true : (user.role || "user") === filter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="profile-wrapper">
      <div className="admin-top-bar">
        <button onClick={() => navigate(-1)} className="back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div className="top-title">User Management</div>
      </div>

      <div className="content-scrollable">
        <div className="search-container">
          <div className="search-box-wrapper">
            <svg className="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search name or email..." 
              className="search-input"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* New Filter Chip Section */}
          <div className="filter-chips">
            <button 
              className={`chip ${filter === 'all' ? 'active' : ''}`} 
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`chip ${filter === 'admin' ? 'active' : ''}`} 
              onClick={() => setFilter('admin')}
            >
              Admins
            </button>
            <button 
              className={`chip ${filter === 'user' ? 'active' : ''}`} 
              onClick={() => setFilter('user')}
            >
              Users
            </button>
          </div>
        </div>

        <div className="user-list">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-info">
                  <p className="user-name">{user.firstName} {user.lastName}</p>
                  <p className="user-email">{user.email}</p>
                  <span className={`role-tag ${user.role || 'user'}`}>{user.role || "user"}</span>
                </div>
                
                <button 
                  className="delete-btn" 
                  onClick={() => deleteUser(user.id, user.firstName)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <div className="no-results">No matches found.</div>
          )}
        </div>
      </div>
      <AdminNavbar />
    </div>
  );
}
