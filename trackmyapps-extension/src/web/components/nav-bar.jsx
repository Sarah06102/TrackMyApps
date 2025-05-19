import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
        <nav className="bg-sky-700 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-6 text-white font-medium h-full">
                    <Link className= "rounded-xl h-full px-4 py-2 hover:bg-sky-400 transition-all duration-300 ease-in-out" to='/'>Home</Link>
                    <Link className= "rounded-xl h-full px-4 py-2 hover:bg-sky-400 transition-all duration-300 ease-in-out" to='/login'>Login</Link>
                    <Link className= "rounded-xl h-full px-4 py-2 hover:bg-sky-400 transition-all duration-300 ease-in-out" to='/signup'>Sign Up</Link>
                    <Link className= "rounded-xl h-full px-4 py-2 hover:bg-sky-400 transition-all duration-300 ease-in-out" to='/dashboard'>Dashboard</Link>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;