import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://3.129.45.165:3001/auth/user', {
        withCredentials: true  // Important: sends cookies/session
      });
      setUser(response.data);
      console.log('User logged in:', response.data);
    } catch (error) {
      console.log('User not logged in');
      setUser(null);
    }
    setLoading(false);
  };

  const logout = async () => {
    try {
      await axios.get('http://3.129.45.165:3001/auth/logout', {
        withCredentials: true
      });
      setUser(null);
      console.log('User logged out');
      // Manually redirect to refresh the app
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout anyway
      setUser(null);
      window.location.href = '/';
    }
  };

  const value = {
    user,           // Current user info
    logout,         // Logout function
    isAuthenticated: !!user,  // true/false if logged in
    checkAuthStatus // Re-check auth status
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}