// frontend/src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAuXpjEzHU2q0A-vemHnajJCShMOhBFn_0",
  authDomain: "taskq-834db.firebaseapp.com",
  projectId: "taskq-834db",
  storageBucket: "taskq-834db.firebasestorage.app",
  messagingSenderId: "663132538676",
  appId: "1:663132538676:web:8ae0320d36274aa6118761",
  measurementId: "G-62VJXZ59Q0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();