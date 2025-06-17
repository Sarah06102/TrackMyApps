import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDvvcIgDo8bPXsPRObe5s6XJCwLoxBzQX8",
  authDomain: "trackmyapps-2636e.firebaseapp.com",
  projectId: "trackmyapps-2636e",
  storageBucket: "trackmyapps-2636e.firebasestorage.app",
  messagingSenderId: "693498453789",
  appId: "1:693498453789:web:3ea65bfa5507c1720a0bf4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { auth, db };
