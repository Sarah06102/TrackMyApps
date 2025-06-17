import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DashboardNavBar } from './dashboard-nav-bar';
import { LoginAndSignupNavBar } from './login-signup-nav-bar';

const NavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isDashboard = location.pathname.startsWith('/dashboard');
    const isLogin = location.pathname.startsWith('/login');
    const isSignUp = location.pathname.startsWith('/signup')

    const handleHomeClick = () => {
        if (location.pathname === '/') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          navigate('/');
        }
    };
      
    if (isDashboard) {
        return <DashboardNavBar />;
    }

    if (isLogin || isSignUp) {
        return <LoginAndSignupNavBar />
    }

    return (
        <>
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-sky-700 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <h1 onClick={() => navigate('/')} className="cursor-pointer text-white font-bold text-xl hover:opacity-90">TrackMyApps</h1>
                        <div className="flex space-x-6 text-white font-medium h-full">
                            <a className= "rounded-xl h-full px-4 py-2 hover:bg-sky-400 transition-all duration-300 ease-in-out" href="#About">About</a>
                            <a className= "rounded-xl h-full px-4 py-2 hover:bg-sky-400 transition-all duration-300 ease-in-out" href="#Features">Features</a>
                            <Link className= "rounded-xl h-full px-4 py-2 hover:bg-sky-400 transition-all duration-300 ease-in-out" to="/login">Login</Link>
                        </div>
                </div>
            </nav>
        </>
        );
    };

export default NavBar; 