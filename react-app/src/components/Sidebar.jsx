import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAccounts } from '../context/AccountContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { accounts, activeAccountId, setActiveAccountId, addAccount, renameAccount, deleteAccount } = useAccounts();
  const { currentUser, setIsAuthModalOpen, pullFromCloud, isSyncing } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside id="sidebar" className={isExpanded ? 'expanded' : ''}>
      <div className="sidebar-header">
        <h1>WOS Calc</h1>
        <button 
          id="mobileMenuBtn" 
          className="icon-btn mobile-only" 
          style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: 'var(--text-primary)' }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          ☰
        </button>
      </div>
      
      <div className="header-actions">
        <button 
          id="themeToggleBtn" 
          className="icon-btn theme-toggle-icon" 
          title="Toggle Theme"
          onClick={() => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('wosCalc_theme', newTheme);
            document.getElementById('themeToggleBtn').textContent = newTheme === 'light' ? '☀️' : '🌙';
          }}
        >
          {document.documentElement.getAttribute('data-theme') === 'light' ? '☀️' : '🌙'}
        </button>
        <button id="languageMenuBtn" className="icon-btn" title="Language">🌐</button>
        <button 
          id="authBtn" 
          className="icon-btn profile-btn" 
          title="Login"
          onClick={() => setIsAuthModalOpen(true)}
          style={{ background: currentUser ? 'var(--accent-color)' : 'none' }}
        >
          {currentUser ? currentUser.email[0].toUpperCase() : 'L'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink onClick={() => setIsExpanded(false)} to="/upgrade" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Buildings</NavLink>
        <NavLink onClick={() => setIsExpanded(false)} to="/chiefGear" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Chief Gear</NavLink>
        <NavLink onClick={() => setIsExpanded(false)} to="/chiefCharm" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Chief Charm</NavLink>
        <NavLink onClick={() => setIsExpanded(false)} to="/pets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Pets</NavLink>
        <NavLink onClick={() => setIsExpanded(false)} to="/experts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Experts</NavLink>
        <NavLink onClick={() => setIsExpanded(false)} to="/svs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>SvS Calculator</NavLink>
      </nav>
      
      <div className="sidebar-footer" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--glass-border)' }}>
        <div className="account-controls" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select 
            id="accountSelect" 
            className="account-select global-select" 
            style={{ flex: 1, padding: '10px' }}
            value={activeAccountId || ''}
            onChange={(e) => setActiveAccountId(e.target.value)}
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
          <button 
            className="icon-btn" 
            style={{ padding: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}
            onClick={() => {
              const name = prompt('Enter new account name:');
              if (name) addAccount(name);
            }}
            title="Add Account"
          >
            +
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button 
            style={{ flex: 1, padding: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85em' }}
            onClick={() => {
              const name = prompt('Rename account to:', accounts.find(a => a.id === activeAccountId)?.name);
              if (name) renameAccount(activeAccountId, name);
            }}
          >
            Rename
          </button>
          <button 
            style={{ flex: 1, padding: '8px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.85em' }}
            onClick={() => {
              if (confirm('Delete this account?')) deleteAccount(activeAccountId);
            }}
          >
            Delete
          </button>
        </div>
        <div className="global-controls" style={{ display: 'flex' }}>
          <select id="globalValeriaSkill" className="global-select" style={{ flex: 1, padding: '10px' }}>
            <option value="0">Well Prepared (0%)</option>
            <option value="1">Level 1 (2%)</option>
            <option value="2">Level 2 (4%)</option>
            <option value="3">Level 3 (6%)</option>
            <option value="4">Level 4 (8%)</option>
            <option value="5">Level 5 (10%)</option>
            <option value="6">Level 6 (12%)</option>
            <option value="7">Level 7 (14%)</option>
            <option value="8">Level 8 (16%)</option>
            <option value="9">Level 9 (18%)</option>
            <option value="10">Level 10 (20%)</option>
          </select>
        </div>
        <select id="languageSelect" className="language-select" style={{ display: 'none' }}></select>
        {currentUser && (
          <button 
            className="secondary-button" 
            style={{ padding: '10px', fontSize: '0.9em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            onClick={() => pullFromCloud(true)}
            disabled={isSyncing}
          >
            {isSyncing ? 'Syncing...' : 'Sync with Cloud'}
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
