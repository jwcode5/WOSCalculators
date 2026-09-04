import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [links, setLinks] = useState([]);
  const location = useLocation();

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

  return (
    <>
      <Sidebar />
      <main id="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {links.length > 1 && (
          <div className="quick-links-bar" style={{ 
            display: 'flex', gap: '8px', padding: '12px var(--base-padding)', 
            overflowX: 'auto', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--glass-border)', scrollbarWidth: 'none', 
            flexShrink: 0, zIndex: 10
          }}>
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
        <div id="app-content" style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </main>
    </>
  );
};

export default Layout;
