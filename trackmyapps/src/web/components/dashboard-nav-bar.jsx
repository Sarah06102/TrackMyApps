import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './sidebar';
import { FaBars, FaTimes } from 'react-icons/fa';

export const DashboardNavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const toggleSidebar = () => setIsOpen(!isOpen);
    
    return (
        <>
        {/* Sidebar*/}
        <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
        <nav className="fixed top-0 w-full z-50 bg-sky-700 py-3">
            <div className="mx-auto flex justify-between items-center px-4">
                <div className="flex items-center gap-4">
                    {/* Toggle Button */}
                    <button onClick={toggleSidebar} className="text-white text-2xl focus:outline-none z-50">
                        {isOpen ? <FaTimes /> : <FaBars />}
                    </button>
                    {/* Logo */}
                    <span onClick={() => navigate('/dashboard')} className="cursor-pointer text-white font-bold text-xl">
                        TrackMyApps
                    </span>
                </div>
            </div>
        </nav>
        </>
    )
};  