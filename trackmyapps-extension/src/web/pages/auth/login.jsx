import React, { useState } from 'react';
import { auth } from "../../../firebase.js";
import { signInWithEmailAndPassword } from 'firebase/auth';
import NavBar from '../../components/nav-bar.jsx';
import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

const Login = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [showPassword, setShowPassword] = useState(false);
        const [error, setError] = useState('');
        const navigate = useNavigate();
        const logIn = (e) => {
            e.preventDefault();
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log(userCredential);
                navigate('/dashboard');
            }).catch((error) => {
                console.log('Firebase error code:', error.code);
                switch (error.code) {
                    case 'auth/user-not-found':
                        setError('No account found with that email.');
                        break;
                    case 'auth/wrong-password':
                        setError('Incorrect password. Please try again.');
                        break;
                    case 'auth/invalid-email':
                        setError('Please enter a valid email address.');
                        break;
                    case 'auth/too-many-requests':
                        setError('Too many failed attempts. Please try again later.');
                        break;
                    case 'auth/internal-error':
                        setError('An internal error occurred. Try again shortly.');
                        break;
                    case 'auth/invalid-credential':
                        setError('Invalid email or password.');
                        break;
                    default:
                        setError('Login failed. Please try again.');
                }
            });   
        }
        
    return (
        <div className="min-h-screen bg-gradient-to-r from-sky-100 to-blue-50">
            <NavBar />
            <div className="min-h-screen flex items-center justify-center pt-20 px-4">
                <div className="w-full max-w-md bg-white p-8 rounded shadow">
                    <h1 className="text-2xl font-semibold mb-6 text-center" >Login</h1>
                    <form className="space-y-4" onSubmit={logIn}>
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
                        {error && (
                            <p className="text-red-600 text-sm text-center -mt-2">{error}</p>
                        )}
                            <button className="w-full bg-sky-600 text-white py-2 rounded-xl hover:bg-sky-700 transition duration-300" type="submit">Login</button>
                        <div className="mt-4 text-sm text-center">
                            <p>New to TrackMyApps?<Link className= "h-full px-1 py-2 text-sky-500 underline hover:text-purple-800 transition-all duration-300 ease-in-out" to='/signup'>Create An Account Here</Link>
                            </p>
                        </div>
                    </form>

                </div>
            </div>
        </div>    
    );
}


export default Login;