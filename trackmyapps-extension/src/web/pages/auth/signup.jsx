import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from "../../../firebase.js";
import NavBar from '../../components/nav-bar.jsx';

const SignUp = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const signUp = (e) => {
            e.preventDefault();
            createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log(userCredential);
            }).catch((error) => {
                console.log(error);
            });   
        }

        
    return (
        <div className='login-page'>
            <NavBar />
            <h1>Create an Account</h1>
            <form onSubmit={signUp}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input className="input-field" type="email" value= {email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button className="auth-button" type="submit">Sign Up</button>
            </form>
        </div>
    );
}

export default SignUp;