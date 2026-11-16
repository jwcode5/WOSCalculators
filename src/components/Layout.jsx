import { useLanguage } from '../context/LanguageContext';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { t } = useLanguage();
  const [links, setLinks] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('wosCalc_sidebarCollapsed') === 'true';
  });
  const location = useLocation();

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('wosCalc_sidebarCollapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    if (isSidebarCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const updateLinks = () => {
      const panels = document.querySelectorAll('#app-content .card-panel');
      const newLinks = [];
      
      panels.forEach((panel, idx) => {
        const h2 = panel.querySelector('h2');
        if (h2 && h2.textContent) {
          if (!panel.id) panel.id = 'section-' + idx;
          panel.style.scrollMarginTop = '80px';
          newLinks.push({ id: panel.id, text: h2.textContent });
        }
      });
      
      setLinks(prevLinks => {
        if (prevLinks.length !== newLinks.length) return newLinks;
        for (let i = 0; i < prevLinks.length; i++) {
          if (prevLinks[i].id !== newLinks[i].id || prevLinks[i].text !== newLinks[i].text) {
            return newLinks;
          }
        }
        return prevLinks;
      });
    };

    updateLinks(); // Initial update
    
    // Watch for dynamic additions/removals of panels or h2s (like conditional Totals)
    const observer = new MutationObserver(updateLinks);
    const appContent = document.getElementById('app-content');
    if (appContent) {
      observer.observe(appContent, { childList: true, subtree: true, characterData: true });
    }

    return () => observer.disconnect();
  }, [location.pathname]);

  const isTerritory = location.pathname === '/territory';

  return (
    <>
      <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={toggleSidebarCollapse} />
      <main id="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
        
        {/* Floating Expand Sidebar Button when collapsed on desktop */}
        {isSidebarCollapsed && (
          <button
            className="desktop-floating-menu-btn"
            onClick={toggleSidebarCollapse}
            title="Show Menu"
            style={{
              position: 'absolute',
              top: isTerritory ? '14px' : '12px',
              left: isTerritory ? '14px' : '12px',
              zIndex: 150,
              background: 'var(--accent-color)',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ☰ Menu
          </button>
        )}

        {links.length > 1 && (
          <div className="quick-links-bar">
            {links.map(link => (
              <a 
                key={link.id} 
                href={`#${link.id}`} 
                className="quick-link"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {link.text}
              </a>
            ))}
          </div>
        )}
        <div 
          id="app-content" 
          style={{ 
            flex: 1, 
            overflowY: isTerritory ? 'hidden' : 'auto',
            padding: isTerritory ? '8px' : 'var(--base-padding)',
            display: isTerritory ? 'flex' : 'block',
            flexDirection: 'column'
          }}
        >
          {children}
        </div>
      </main>
    </>
  );
};

export default Layout;
