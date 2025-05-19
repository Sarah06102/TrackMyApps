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
        <div>
            <NavBar />
            <div className="min-h-screen flex items-center justify-center pt-20 px-4">
                <div className="w-full max-w-md bg-white p-8 rounded shadow"> 
                    <h1 className="text-2xl font-semibold mb-6 text-center">Create an Account</h1>
                    <form className="space-y-4" onSubmit={signUp}>
                        <div>
                            <label className="block mb-1 font-medium" htmlFor="email">Email:</label>
                            <input className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" type="email" value= {email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium" htmlFor="password">Password:</label>
                            <input className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <button className="w-full bg-sky-600 text-white py-2 rounded-xl hover:bg-sky-700 transition duration-300" type="submit">Sign Up</button>
                    </form>
                </div>
            </div>
        </div>       
    );
}

export default SignUp;