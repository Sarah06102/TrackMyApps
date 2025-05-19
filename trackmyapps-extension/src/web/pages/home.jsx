import React from 'react';
import NavBar from '../components/nav-bar.jsx';

const Home = () => {
    return (
        
        <div>
            <NavBar />
            <div className="animate-fade-in duration-700 min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-sky-100 to-blue-50 text-center px-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to TrackMyApps</h1>
                <p className="text-gray-600 text-lg">Your personal job application tracker</p>
            </div>
        </div>
        
        
        
    );
}



export default Home;
