// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvvcIgDo8bPXsPRObe5s6XJCwLoxBzQX8",
  authDomain: "trackmyapps-2636e.firebaseapp.com",
  projectId: "trackmyapps-2636e",
  storageBucket: "trackmyapps-2636e.firebasestorage.app",
  messagingSenderId: "693498453789",
  appId: "1:693498453789:web:3ea65bfa5507c1720a0bf4",
  measurementId: "G-HRJ4251BQY",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
.then(() => {
  console.log("Firebase Auth persistence set.");
})
.catch((error) => {
  console.error("Error setting Firebase Auth persistence:", error);
});

export { app, auth, db };