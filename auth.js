import { app, auth, db, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, doc, setDoc, getDoc, updateDoc } from './firebase.js';

// Elements
const authBtn = document.getElementById('authBtn');
const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const googleAuthBtn = document.getElementById('googleAuthBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authErrorMsg = document.getElementById('authErrorMsg');
const loggedInView = document.getElementById('loggedInView');
const loggedInEmail = document.getElementById('loggedInEmail');

// Check GitHub Hostname for Migration
if (window.location.hostname === 'jwcode5.github.io') {
  document.getElementById('githubMigrationOverlay').style.display = 'flex';
}

function showModal() {
  authModal.style.display = 'flex';
}

function hideModal() {
  authModal.style.display = 'none';
  authErrorMsg.style.display = 'none';
}

function showError(msg) {
  authErrorMsg.textContent = msg;
  authErrorMsg.style.display = 'block';
}

authBtn.addEventListener('click', showModal);
closeAuthModal.addEventListener('click', hideModal);

// Sync Logic
async function syncDataToFirebase(user) {
  try {
    const localAccounts = localStorage.getItem('wosCalc_accounts');
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Load from Firebase if exists and no local conflicts, or overwrite local (simplified)
      const data = docSnap.data();
      if (data.accounts) {
        localStorage.setItem('wosCalc_accounts', data.accounts);
        if (data.activeAccountId) localStorage.setItem('wosCalc_activeAccountId', data.activeAccountId);
        
        // Trigger a reload of the app data if the function exists
        if (typeof window.loadAccounts === 'function') {
          window.loadAccounts();
          if (typeof window.loadAllStateFromAccount === 'function') window.loadAllStateFromAccount();
        }
        if (!sessionStorage.getItem('wosCalc_justSynced')) {
          sessionStorage.setItem('wosCalc_justSynced', 'true');
          window.location.reload();
        } else {
          sessionStorage.removeItem('wosCalc_justSynced');
        }
      }
    } else if (localAccounts) {
      // First login with local data, migrate it up
      await setDoc(docRef, {
        email: user.email,
        accounts: localAccounts,
        activeAccountId: localStorage.getItem('wosCalc_activeAccountId') || '',
        createdAt: new Date().toISOString()
      });
    } else {
      // First login, no local data
      await setDoc(docRef, {
        email: user.email,
        accounts: '[]',
        activeAccountId: '',
        createdAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Firebase Sync Error:', err);
  }
}

// Intercept LocalStorage Saves
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  originalSetItem.apply(this, arguments);
  
  if (key === 'wosCalc_accounts' || key === 'wosCalc_activeAccountId') {
    const user = auth.currentUser;
    if (user) {
      // Debounce saving to Firestore
      clearTimeout(window.fbSaveTimeout);
      window.fbSaveTimeout = setTimeout(async () => {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            [key === 'wosCalc_accounts' ? 'accounts' : 'activeAccountId']: value,
            lastUpdated: new Date().toISOString()
          });
        } catch(e) {
          console.warn('Failed to sync to Firebase:', e);
        }
      }, 2000);
    }
  }
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    authBtn.textContent = user.email ? user.email.charAt(0).toUpperCase() : 'L';
    loggedInView.style.display = 'block';
    loggedInEmail.textContent = user.email;
    
    // Hide inputs
    authEmail.style.display = 'none';
    authPassword.style.display = 'none';
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    googleAuthBtn.style.display = 'none';
    document.querySelector('.auth-divider').style.display = 'none';
    
    syncDataToFirebase(user);
    hideModal(); // Optional: close modal automatically on login
  } else {
    authBtn.textContent = 'L';
    loggedInView.style.display = 'none';
    
    // Show inputs
    authEmail.style.display = 'block';
    authPassword.style.display = 'block';
    loginBtn.style.display = 'block';
    registerBtn.style.display = 'block';
    googleAuthBtn.style.display = 'flex';
    document.querySelector('.auth-divider').style.display = 'flex';
  }
});

// Auth Actions

// Allow submitting with Enter key
authPassword.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    loginBtn.click();
  }
});
authEmail.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    authPassword.focus();
  }
});

loginBtn.addEventListener('click', async () => {
  try {
    await signInWithEmailAndPassword(auth, authEmail.value, authPassword.value);
    hideModal();
  } catch (error) {
    showError(error.message);
  }
});

registerBtn.addEventListener('click', async () => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, authEmail.value, authPassword.value);
    await setDoc(doc(db, 'users', cred.user.uid), {
      email: cred.user.email,
      accounts: localStorage.getItem('wosCalc_accounts') || '[]',
      activeAccountId: localStorage.getItem('wosCalc_activeAccountId') || '',
      createdAt: new Date().toISOString()
    });
    hideModal();
  } catch (error) {
    showError(error.message);
  }
});

// Handle mobile-friendly Redirect Result on page load
getRedirectResult(auth).then(async (cred) => {
  if (cred) {
    const docRef = doc(db, 'users', cred.user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        email: cred.user.email,
        accounts: localStorage.getItem('wosCalc_accounts') || '[]',
        activeAccountId: localStorage.getItem('wosCalc_activeAccountId') || '',
        createdAt: new Date().toISOString()
      });
    }
  }
}).catch((error) => {
  console.error("Google Auth Redirect Error:", error);
  showError(error.message);
});

googleAuthBtn.addEventListener('click', async () => {
  try {
    const provider = new GoogleAuthProvider();
    // Use signInWithPopup which is more reliable across different domains and prevents third-party cookie blocking issues
    await signInWithPopup(auth, provider);
  } catch (error) {
    showError(error.message);
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    hideModal();
  } catch (error) {
    showError(error.message);
  }
});


window.forceFirebaseSync = async function() {
  if (window.fbSaveTimeout) clearTimeout(window.fbSaveTimeout);
  const user = auth.currentUser;
  if (!user) return;
  try {
    await updateDoc(doc(db, 'users', user.uid), {
      accounts: localStorage.getItem('wosCalc_accounts'),
      activeAccountId: localStorage.getItem('wosCalc_activeAccountId'),
      lastUpdated: new Date().toISOString()
    });
  } catch(e) {
    console.warn('Failed to force sync to Firebase:', e);
  }
};