import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleHomeClick = (e) => {
        if (location.pathname === '/') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          navigate('/');
        }
      };
      

    return (
        <nav className="fixed top-0 w-full z-50 bg-sky-700 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-6 text-white font-medium h-full">
                    <button onClick={handleHomeClick} className="rounded-xl h-full px-4 py-2 hover:bg-sky-400 transition-all duration-300 ease-in-out text-white">
                        Home
                    </button>
                    <a className= "rounded-xl h-full px-4 py-2 hover:bg-sky-400 transition-all duration-300 ease-in-out" href="#About">About</a>
                    <a className= "rounded-xl h-full px-4 py-2 hover:bg-sky-400 transition-all duration-300 ease-in-out" href="#Features">Features</a>
                    <Link className= "rounded-xl h-full px-4 py-2 hover:bg-sky-400 transition-all duration-300 ease-in-out" to='/login'>Login</Link>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;