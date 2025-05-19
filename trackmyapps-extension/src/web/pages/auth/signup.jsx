import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from "../../../firebase.js";
import NavBar from '../../components/nav-bar.jsx';
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
        const [email, setEmail] = useState('');
        const [firstName, setFirstName] = useState('');
        const [lastName, setLastName] = useState('');
        const [password, setPassword] = useState('');
        const [showPassword, setShowPassword] = useState(false);
        const navigate = useNavigate();
        const signUp = (e) => {
            e.preventDefault();
            createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log(userCredential);
                navigate('/dashboard');
            }).catch((error) => {
                console.log(error);
            });   
        }

        
    return (
        <div className="min-h-screen bg-gradient-to-r from-sky-100 to-blue-50">
            <NavBar />
            <div className="min-h-screen flex items-center justify-center pt-20 px-4">
                <div className="w-full max-w-md bg-white p-8 rounded shadow"> 
                    <h1 className="text-2xl font-semibold mb-6 text-center">Create an Account</h1>
                    <form className="space-y-4" onSubmit={signUp}>
                        <div>
                            <label className="block mb-1 font-medium" htmlFor="firstName">First Name</label>
                            <input placeholder="Enter your first name" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" type="email" value= {firstName} onChange={(e) => setFirstName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium" htmlFor="lastName">Last Name:</label>
                            <input placeholder="Enter your last name" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" type="email" value= {lastName} onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium" htmlFor="email">Email:</label>
                            <input placeholder="Enter your email" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" type="email" value= {email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="relative w-full">
                            <label className="block mb-1 font-medium" htmlFor="password">Password:</label>
                            <input type={showPassword ? "text" : "password"} placeholder="Enter your password" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-4 mt-8 -translate-y-1/2 text-gray-600 hover:text-sky-500">
                                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                            </button>
                        </div>
                        <button className="w-full bg-sky-600 text-white py-2 rounded-xl hover:bg-sky-700 transition duration-300" type="submit">Sign Up</button>
                    </form>
                </div>
            </div>
        </div>       
    );
}

export default SignUp;