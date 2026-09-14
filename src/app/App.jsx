import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase.js';
import './App.css'; // Importing App.css for global styles

// Page imports
import LandingPage from '../pages/landing/LandingPage.jsx';
import Auth from '../features/auth/Auth.jsx';
import HomeScreen from '../features/home/HomeScreen.jsx';
import PersonalDetails from '../features/profile/PersonalDetails.jsx';
import UserEditProfile from '../features/profile/UserEditProfile.jsx';
import EmergencyScreen from '../features/emergencies/EmergencyScreen.jsx';
import Notification from '../features/notifications/Notification.jsx';
import Message from '../features/messages/Message.jsx';
import AdminScreen from '../features/admin/dashboard/AdminScreen.jsx';
import AdminProfile from '../features/profile/AdminProfile.jsx';
import EditProfile from '../features/profile/EditProfile.jsx';
import AdminMessages from '../features/messages/AdminMessages.jsx';
import AdminNotifications from '../features/notifications/AdminNotifications.jsx';
import CreateAdmin from '../features/admin/users/CreateAdmin.jsx';
import UserList from '../features/admin/users/UserList.jsx';
import ProtectedRoute from '../components/routing/ProtectedRoute.jsx';

// We are intentionally NOT importing App.css here to rule out CSS overlay bugs.
// Once this works, you can add it back.

function AppRoutes() {
  console.log('[DEBUG] ✅ AppRoutes component is rendering');
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/landing" element={<LandingPage />} />
      
      <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><PersonalDetails /></ProtectedRoute>} />
      <Route path="/edit-profile" element={<ProtectedRoute><UserEditProfile /></ProtectedRoute>} />
      <Route path="/emergency" element={<ProtectedRoute><EmergencyScreen /></ProtectedRoute>} />
      <Route path="/notification" element={<ProtectedRoute><Notification /></ProtectedRoute>} />
      <Route path="/message" element={<ProtectedRoute><Message /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminScreen /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute adminOnly><AdminProfile /></ProtectedRoute>} />
      <Route path="/admin/edit-profile" element={<ProtectedRoute adminOnly><EditProfile /></ProtectedRoute>} />
      <Route path="/admin/messages" element={<ProtectedRoute adminOnly><AdminMessages /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute adminOnly><AdminNotifications /></ProtectedRoute>} />
      <Route path="/admin/create-account" element={<ProtectedRoute adminOnly><CreateAdmin /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly><UserList /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  console.log('[DEBUG] <App /> rendering. checkingAuth =', checkingAuth);

  useEffect(() => {
    console.log('[DEBUG] useEffect running: Starting onAuthStateChanged...');

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log('[DEBUG] onAuthStateChanged fired. User:', user ? user.uid : 'null (No signed-in user)');
        
        // This is the critical line that was likely missing or misplaced
        setCheckingAuth(false);
        console.log('[DEBUG] ✅ setCheckingAuth(false) called successfully');
      },
      (error) => {
        console.error('[DEBUG] ❌ Auth state check error:', error);
        setCheckingAuth(false);
      }
    );

    return () => {
      console.log('[DEBUG] Cleanup: unsubscribing from onAuthStateChanged');
      unsubscribe();
    };
  }, []);

    if (checkingAuth) {
    console.log('[DEBUG] Returning Splash Screen JSX');
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        width: '100vw', 
        backgroundColor: '#f8f9fa', 
        fontSize: '2rem', 
        fontWeight: 'bold',
        color: '#a31224'
      }}>
        FireWatch Loading...
      </div>
    );
  }

  console.log('[DEBUG] ✅ Returning BrowserRouter JSX');
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}