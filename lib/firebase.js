// lib/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDLn3dR29BpVuQFh22rDb6tUw0kbPB5Jeg",
  authDomain: "cinereserve-6150e.firebaseapp.com",
  projectId: "cinereserve-6150e",
  storageBucket: "cinereserve-6150e.appspot.com",
  messagingSenderId: "721862170769",
  appId: "1:721862170769:web:5be5d36678a6909a680730",
  measurementId: "G-BM20QWBSLF"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);
export const storage = getStorage(app);

export { auth, db};
