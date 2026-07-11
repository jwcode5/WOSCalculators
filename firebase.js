import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey:            'AIzaSyBdYdrUBDOzDPDnYmnvAICnAoLV4RA5Bn4',
  authDomain:        'woscalculator.web.app',
  projectId:         'embersmith-gaming',
  storageBucket:     'embersmith-gaming.firebasestorage.app',
  messagingSenderId: '596014572252',
  appId:             '1:596014572252:web:fc62d3ccea035911560a19',
  measurementId:     'G-BJBE9YWWYG',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
  app, auth, db, onAuthStateChanged,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  doc, setDoc, getDoc, updateDoc
};
