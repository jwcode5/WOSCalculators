import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

export { app, auth, db };
