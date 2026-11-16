import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAccounts } from '../context/AccountContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageModal from './LanguageModal';

const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const handleForceUpdate = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let reg of registrations) {
          await reg.unregister();
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (let name of cacheNames) {
          await caches.delete(name);
        }
      }
      window.location.href = window.location.pathname + '?v=' + new Date().getTime();
    } catch (e) {
      console.error(e);
      alert('Failed to update: ' + e.message);
    }
  };
  const { accounts, activeAccountId, setActiveAccountId, addAccount, renameAccount, deleteAccount } = useAccounts();
  const { currentUser, setIsAuthModalOpen, pullFromCloud, pushToCloud, isSyncing } = useAuth();
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  return (
    <aside id="sidebar" className={`${isExpanded ? 'expanded' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <LanguageModal isOpen={isLanguageModalOpen} onClose={() => setIsLanguageModalOpen(false)} />
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onToggleCollapse && (
            <button 
              className="icon-btn desktop-collapse-btn" 
              title="Hide Sidebar" 
              onClick={onToggleCollapse} 
              style={{ fontSize: '0.9rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              ◀
            </button>
          )}
          <h1>{t('app.name', {}, 'WOS Calc')}</h1>
        </div>
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
          title={t('common.toggleTheme', {}, 'Toggle Theme')}
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
        <button id="languageMenuBtn" className="icon-btn" title={t('common.language', {}, 'Language')} onClick={() => setIsLanguageModalOpen(true)}>🌐</button>
        <button 
          id="authBtn" 
          className="icon-btn profile-btn" 
          title={t('common.login', {}, 'Login')}
          onClick={() => setIsAuthModalOpen(true)}
          style={{ background: currentUser ? 'var(--accent-color)' : 'none' }}
        >
          {currentUser ? currentUser.email[0].toUpperCase() : 'L'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink onClick={() => setIsExpanded(false)} to="/upgrade" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>{t('calculator.upgrade', {}, 'Upgrade')}</NavLink>
        <NavLink onClick={() => setIsExpanded(false)} to="/chiefGear" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>{t('calculator.chiefGear', {}, 'Chief Gear')}</NavLink>
        <NavLink onClick={() => setIsExpanded(false)} to="/chiefCharm" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>{t('calculator.chiefCharm', {}, 'Chief Charm')}</NavLink>
        <NavLink onClick={() => setIsExpanded(false)} to="/pets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>{t('calculator.pets', {}, 'Pets')}</NavLink>
        <NavLink onClick={() => setIsExpanded(false)} to="/experts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>{t('calculator.experts', {}, 'Experts')}</NavLink>
        <NavLink onClick={() => setIsExpanded(false)} to="/research" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>{t('calculator.research', {}, 'Research')}</NavLink>
        <NavLink onClick={() => setIsExpanded(false)} to="/svs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>{t('calculator.svs', {}, 'SvS Calculator')}</NavLink>
        <NavLink onClick={() => setIsExpanded(false)} to="/territory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>{t('calculator.territory', {}, 'Territory Planner')}</NavLink>
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
            id="renameAccountBtn" 
            className="icon-btn" 
            title={t('account.renameTitle', {}, 'Rename account')}
            onClick={() => {
              const current = accounts.find(a => a.id === activeAccountId);
              const newName = prompt(t('account.renamePrompt', {}, 'Rename account:'), current ? current.name : '');
              if (newName && newName.trim()) renameAccount(activeAccountId, newName.trim());
            }}
          >
            ✏️
          </button>
          <button 
            id="addAccountBtn" 
            className="icon-btn" 
            title={t('account.addTitle', {}, 'Add account')}
            onClick={() => {
              const name = prompt(t('account.namePrompt', {}, 'Account name:'), t('account.defaultName', { number: accounts.length + 1 }, `Account ${accounts.length + 1}`));
              if (name && name.trim()) addAccount(name.trim());
            }}
          >
            ➕
          </button>
          <button 
            id="deleteAccountBtn" 
            className="icon-btn" 
            title={t('account.deleteTitle', {}, 'Delete account')}
            onClick={() => {
              const current = accounts.find(a => a.id === activeAccountId);
              if (confirm(t('account.deleteConfirm', { name: current ? current.name : '' }, `Delete "${current ? current.name : ''}"? This cannot be undone.`))) {
                deleteAccount(activeAccountId);
              }
            }}
          >
            🗑️
          </button>
        </div>

        {/* VP Buff Selection */}
        <div className="vp-buff-selection-control" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="vpBuffSelect" style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>VP Buff Level</label>
          <select 
            id="vpBuffSelect" 
            className="state-select global-select" 
            style={{ width: '100%', padding: '10px' }}
            value={accounts.find(a => a.id === activeAccountId)?.vpBuff || '0'}
            onChange={(e) => {
              const newBuff = e.target.value;
              const current = accounts.find(a => a.id === activeAccountId);
              if (current) {
                current.vpBuff = newBuff;
                renameAccount(activeAccountId, current.name);
              }
            }}
          >
            <option value="0">None (0%)</option>
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
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button className="secondary-button" style={{ flex: 1, padding: '10px', fontSize: '0.85em' }} onClick={handleForceUpdate}>Update App</button>
          {currentUser && <button className="secondary-button" style={{ flex: 1, padding: '10px', fontSize: '0.85em' }} onClick={pushToCloud} disabled={isSyncing}>Force Push</button>}
          {currentUser && (
            <button 
              className="secondary-button" 
              style={{ flex: 1, padding: '10px', fontSize: '0.85em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              onClick={() => pullFromCloud(true)}
              disabled={isSyncing}
            >
              {isSyncing ? t('buttons.refresh', {}, 'Syncing...') : t('buttons.refresh', {}, 'Sync with Cloud')}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
