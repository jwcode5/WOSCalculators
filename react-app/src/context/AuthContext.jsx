import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Sync logic: Pull from Firebase on login
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.accounts) {
              const parsedAccounts = JSON.parse(data.accounts);
              localStorage.setItem('wosCalc_accounts', data.accounts);
              
              if (!sessionStorage.getItem('wosCalc_justSynced')) {
                sessionStorage.setItem('wosCalc_justSynced', 'true');
                window.location.reload();
                return;
              } else {
                sessionStorage.removeItem('wosCalc_justSynced');
              }
            }
          } else {
            // First time login, save current local accounts to Firebase
            await setDoc(docRef, {
              email: user.email,
              accounts: localStorage.getItem('wosCalc_accounts') || '[]',
              activeAccountId: localStorage.getItem('wosCalc_activeAccountId') || '',
              createdAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('Firebase Sync Error:', err);
        } finally {
          setHasInitialPulled(true);
        }
      } else {
        setHasInitialPulled(false);
      }
    });

    return unsubscribe;
  }, []);

  // Sync to Firebase when accounts change locally
  useEffect(() => {
    if (currentUser && hasInitialPulled && accounts.length > 0) {
      // Avoid pushing empty default if we haven't loaded their actual accounts
      const activeId = localStorage.getItem('wosCalc_activeAccountId') || '';
      const docRef = doc(db, 'users', currentUser.uid);
      setDoc(docRef, {
        accounts: JSON.stringify(accounts),
        activeAccountId: activeId,
        lastUpdated: new Date().toISOString()
      }, { merge: true }).catch(err => console.error("Firebase Push Error:", err));
    }
  }, [accounts, currentUser, hasInitialPulled]);

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
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
