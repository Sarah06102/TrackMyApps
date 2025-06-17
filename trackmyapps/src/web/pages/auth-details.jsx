import React, { useEffect, useState } from 'react'
import { auth } from "../../firebase.js";
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getAuth, setPersistence, browserLocalPersistence, signInWithEmailAndPassword } from 'firebase/auth';

const handleLogin = async (email, password) => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in:", userCredential.user.email);
    } catch (error) {
        if (error.code === 'auth/wrong-password') {
            console.error("Wrong password:", error.message);
        } else if (error.code === 'auth/user-not-found') {
            console.error("User not found:", error.message);
        } else if (error.code === 'auth/too-many-requests') {
            alert("Too many failed attempts. Please try again later or reset your password.");
        } else {
            console.error("Auth error:", error.message);
        }
    } 
  };

const AuthDetails = () => {
    const navigate = useNavigate();
    const [authUser, setAuthUser] = useState(null);
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthUser(user);
                navigate('/dashboard');
            } else {
                setAuthUser(null);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [navigate]);

  return (
    <div>
        { authUser ? <><p>{`Logged In as ${authUser.email}`}</p></> : <p>Logged Out</p>}
    </div>
  )
}

export default AuthDetails;