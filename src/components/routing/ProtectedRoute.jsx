import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../../services/firebase.js';
import { doc, getDoc } from 'firebase/firestore';

function ProtectedRoute({ children, adminOnly = false }) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const user = auth.currentUser;

      if (!user) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      if (!adminOnly) {
        // For non-admin routes, just check if user exists
        setIsAuthorized(true);
        setLoading(false);
        return;
      }

      // For admin routes, check role in Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('[FireWatch] Error checking admin role:', error);
        setIsAuthorized(false);
      }

      setLoading(false);
    };

    checkAccess();
  }, [adminOnly]);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;