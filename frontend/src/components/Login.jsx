import React from 'react';

function Login() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://3.129.45.165:3001/auth/google';
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🎯 Task Management Board</h1>
        <p>Sign in to manage your tasks securely</p>
        <button 
          onClick={handleGoogleLogin}
          className="google-login-btn"
        >
          <span className="google-icon">🔐</span>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;