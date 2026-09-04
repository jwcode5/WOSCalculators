import React, { createContext, useContext, useState, useEffect } from 'react';

const AccountContext = createContext();

export const useAccounts = () => useContext(AccountContext);

export const AccountProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [activeAccountId, setActiveAccountId] = useState(null);

  useEffect(() => {
    // Load accounts from local storage initially
    const saved = localStorage.getItem('wosCalc_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAccounts(parsed);
      } catch (e) {
        console.error("Failed to parse accounts", e);
        setAccounts([{ id: 'default', name: 'Main Account', state: {} }]);
      }
    } else {
      setAccounts([{ id: 'default', name: 'Main Account', state: {} }]);
    }

    const savedActive = localStorage.getItem('wosCalc_activeAccountId');
    if (savedActive) {
      setActiveAccountId(savedActive);
    } else {
      setActiveAccountId('default');
    }
  }, []);

  // Save to local storage whenever accounts change
  useEffect(() => {
    if (accounts.length > 0) {
      localStorage.setItem('wosCalc_accounts', JSON.stringify(accounts));
    }
  }, [accounts]);

  useEffect(() => {
    if (activeAccountId) {
      localStorage.setItem('wosCalc_activeAccountId', activeAccountId);
    }
  }, [activeAccountId]);

  const addAccount = (name) => {
    const newId = Date.now().toString();
    const newAccount = { id: newId, name, state: {} };
    setAccounts(prev => [...prev, newAccount]);
    setActiveAccountId(newId);
  };

  const renameAccount = (id, newName) => {
    setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, name: newName } : acc));
  };

  const deleteAccount = (id) => {
    setAccounts(prev => {
      const filtered = prev.filter(acc => acc.id !== id);
      if (filtered.length === 0) {
        return [{ id: 'default', name: 'Main Account', state: {} }];
      }
      return filtered;
    });
    if (activeAccountId === id) {
      setActiveAccountId(accounts.find(a => a.id !== id)?.id || 'default');
    }
  };

  const updateAccountState = (sectionKey, updatedState) => {
    if (!activeAccountId) return;
    setAccounts(prev => prev.map(acc => {
      if (acc.id === activeAccountId) {
        return {
          ...acc,
          state: {
            ...acc.state,
            [sectionKey]: updatedState
          }
        };
      }
      return acc;
    }));
  };

  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0];

  return (
    <AccountContext.Provider value={{ 
      accounts, activeAccount, activeAccountId, 
      setActiveAccountId, addAccount, renameAccount, deleteAccount, updateAccountState 
    }}>
      {children}
    </AccountContext.Provider>
  );
};
