import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAccounts } from './AccountContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { accounts, setAccounts, setActiveAccountId } = useAccounts();

  const [hasInitialPulled, setHasInitialPulled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const pullFromCloud = useCallback(async (force = false, user = currentUser) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.accounts) {
          const fbLastUpdated = data.lastUpdated || '';
          const localLastUpdated = localStorage.getItem('wosCalc_lastLocalUpdate') || '';
          
          // If forced, OR if Firebase has newer data than local
          if (force || (!localLastUpdated && fbLastUpdated) || (fbLastUpdated && fbLastUpdated > localLastUpdated)) {
            const parsedAccounts = JSON.parse(data.accounts);
            setAccounts(parsedAccounts);
            if (data.activeAccountId) setActiveAccountId(data.activeAccountId);
            if (fbLastUpdated) localStorage.setItem('wosCalc_lastLocalUpdate', fbLastUpdated);
            
            // First time load fallback reload if it was a page refresh
            if (!hasInitialPulled && !sessionStorage.getItem('wosCalc_justSynced')) {
              sessionStorage.setItem('wosCalc_justSynced', 'true');
              window.location.reload();
              return;
            }
          }
        }
      } else if (!hasInitialPulled) {
        // First time login ever, save current local accounts to Firebase
        const now = new Date().toISOString();
        localStorage.setItem('wosCalc_lastLocalUpdate', now);
        await setDoc(docRef, {
          email: user.email,
          accounts: JSON.stringify(accounts),
          activeAccountId: localStorage.getItem('wosCalc_activeAccountId') || '',
          lastUpdated: now,
          createdAt: now
        });
      }
    } catch (err) {
      console.error('Firebase Sync Error:', err);
    } finally {
      setIsSyncing(false);
      setHasInitialPulled(true);
      sessionStorage.removeItem('wosCalc_justSynced');
    }
  }, [currentUser, hasInitialPulled, accounts, setAccounts, setActiveAccountId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await pullFromCloud(false, user);
      } else {
        setHasInitialPulled(false);
      }
    });

    return unsubscribe;
  }, [pullFromCloud]);

  // Handle Visibility Change to automatically pull from cloud when coming back to tab/app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && currentUser && hasInitialPulled) {
        pullFromCloud(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser, hasInitialPulled, pullFromCloud]);

  // Sync to Firebase when accounts change locally
  useEffect(() => {
    if (currentUser && hasInitialPulled && accounts.length > 0 && !isSyncing) {
      const activeId = localStorage.getItem('wosCalc_activeAccountId') || '';
      const now = new Date().toISOString();
      
      localStorage.setItem('wosCalc_lastLocalUpdate', now);
      const docRef = doc(db, 'users', currentUser.uid);
      setDoc(docRef, {
        accounts: JSON.stringify(accounts),
        activeAccountId: activeId,
        lastUpdated: now
      }, { merge: true }).catch(err => console.error("Firebase Push Error:", err));
    }
  }, [accounts, currentUser, hasInitialPulled, isSyncing]);

  const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const registerWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };
  const logout = () => signOut(auth);

  const value = {
    currentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    pullFromCloud,
    isSyncing
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
