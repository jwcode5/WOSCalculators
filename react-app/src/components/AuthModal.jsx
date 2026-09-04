import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, currentUser, loginWithEmail, registerWithEmail, loginWithGoogle, logout } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLogin = async () => {
    try {
      setError('');
      await loginWithEmail(email, password);
      setIsAuthModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async () => {
    try {
      setError('');
      await registerWithEmail(email, password);
      setIsAuthModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      setError('');
      await loginWithGoogle();
      setIsAuthModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-backdrop" style={{ display: 'flex', zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
      <div className="modal-panel" style={{ background: 'var(--sidebar-bg)', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '1px solid var(--glass-border)' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2>{currentUser ? 'Profile' : 'Login / Register'}</h2>
          <button className="close-btn" onClick={() => setIsAuthModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>
        <div className="modal-body">
          {error && <div className="error-message" style={{ color: '#ff6b6b', marginBottom: '10px' }}>{error}</div>}
          
          {currentUser ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '16px' }}>Logged in as: <strong>{currentUser.email}</strong></p>
              <button className="secondary-button" onClick={handleLogout} style={{ width: '100%', padding: '10px', borderRadius: '8px' }}>Logout</button>
            </div>
          ) : (
            <>
              <input 
                type="email" 
                placeholder="Email" 
                className="auth-input global-select" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={{ width: '100%', marginBottom: '12px', padding: '10px' }} 
              />
              <input 
                type="password" 
                placeholder="Password" 
                className="auth-input global-select" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ width: '100%', marginBottom: '16px', padding: '10px' }} 
              />
              <div className="auth-buttons" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button className="accent-button" onClick={handleLogin} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'var(--accent-color)', color: 'white', border: 'none' }}>Login</button>
                <button className="secondary-button" onClick={handleRegister} style={{ flex: 1, padding: '10px', borderRadius: '8px' }}>Register</button>
              </div>
              <div className="auth-divider" style={{ textAlign: 'center', margin: '16px 0', borderBottom: '1px solid var(--glass-border)', lineHeight: '0.1em' }}>
                <span style={{ background: 'var(--sidebar-bg)', padding: '0 10px', color: 'var(--text-secondary)' }}>OR</span>
              </div>
              <button className="google-button" onClick={handleGoogle} style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', padding: '10px', borderRadius: '8px', background: 'white', color: 'black', border: 'none' }}>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                Continue with Google
              </button>
            </>
          )}
          
          {currentUser && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
              <p style={{ fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '8px', textAlign: 'center' }}>Missing data? Click below to allow your live app to re-sync its data upwards.</p>
              <button 
                className="secondary-button" 
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ff6b6b', color: '#ff6b6b', background: 'rgba(255,107,107,0.1)' }}
                onClick={async () => {
                  try {
                    const { doc, setDoc } = await import('firebase/firestore');
                    const { db } = await import('../firebase');
                    await setDoc(doc(db, 'users', currentUser.uid), {
                      lastUpdated: '2000-01-01T00:00:00.000Z'
                    }, { merge: true });
                    alert('Sync reset! Now open the live app (woscalculator.web.app) on the device that has the data, and it will automatically re-upload it to Firebase.');
                  } catch (e) {
                    alert('Error: ' + e.message);
                  }
                }}
              >
                Restore Live Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
