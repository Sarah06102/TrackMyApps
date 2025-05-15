import React, { useState } from 'react';
import { auth } from "../../../firebase.js";
import { signInWithEmailAndPassword } from 'firebase/auth';
import AuthDetails from '../auth-details.jsx';
import NavBar from '../../components/nav-bar.jsx';

const Login = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const logIn = (e) => {
            e.preventDefault();
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log(userCredential);
            }).catch((error) => {
                console.log(error);
            });   
        }

        
    return (
        <div className='login-page'>
            <NavBar />
            <h1>Login</h1>
            <form onSubmit={logIn}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input className="input-field" type="email" value= {email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button className="auth-button" type="submit">Login</button>
            </form>
            <AuthDetails />
        </div>
    );
}


export default Login;