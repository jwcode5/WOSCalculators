const fs = require('fs');
let c = fs.readFileSync('react-app/src/components/Sidebar.jsx', 'utf8');

c = c.replace(
  /<button className="secondary-button" style={{ padding: '10px', fontSize: '0.9em', marginTop: '10px' }} onClick={handleForceUpdate}>Update App<\/button>\s*\{currentUser && \(\s*<button\s*className="secondary-button"\s*style={{ padding: '10px', fontSize: '0.9em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}\s*onClick=\{\(\) => pullFromCloud\(true\)\}\s*disabled=\{isSyncing\}\s*>\s*\{isSyncing \? t\('buttons.refresh', \{\}, 'Syncing...'\) : t\('buttons.refresh', \{\}, 'Sync with Cloud'\)\}\s*<\/button>\s*\)\}/,
  `<div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button className="secondary-button" style={{ flex: 1, padding: '10px', fontSize: '0.85em' }} onClick={handleForceUpdate}>Update App</button>
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
        </div>`
);

fs.writeFileSync('react-app/src/components/Sidebar.jsx', c);
