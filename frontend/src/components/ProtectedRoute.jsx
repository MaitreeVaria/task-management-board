import React from 'react';
import { useAuth } from '../context/AuthContext';
import Login from './Login';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  // If not logged in, show login page
  if (!isAuthenticated) {
    return <Login />;
  }
  
  // If logged in, show the protected content
  return children;
}

export default ProtectedRoute;