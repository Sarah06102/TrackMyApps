import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FaSignOutAlt } from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import { db, auth } from '../../firebase.js';

const getInitials = (first = '', last = '', email = '') => {
    const initials = `${first.trim()[0] || ''}${last.trim()[0] || ''}`;
    return (initials || email[0] || '?').toUpperCase();
};

export const DashboardNavBar = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (!currentUser) return;
            const snap = await getDoc(doc(db, 'users', currentUser.uid));
            if (snap.exists()) setUserData(snap.data());
        });
        return () => unsubscribe();
    }, []);

    // Close the menu when clicking anywhere outside it
    useEffect(() => {
        if (!menuOpen) return;
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [menuOpen]);

    const logOut = async () => {
        try {
            await signOut(auth);
            localStorage.setItem('userLoggedOut', 'true');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const fullName = [userData?.firstName, userData?.lastName].filter(Boolean).join(' ');
    const email = userData?.email || user?.email || '';

    return (
        <nav className="fixed top-0 w-full z-50 bg-sky-700 py-3">
            <div className="mx-auto flex justify-between items-center px-4">
                <span onClick={() => navigate('/dashboard')} className="cursor-pointer text-white font-bold text-xl">
                    TrackMyApps
                </span>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Account menu"
                        className="w-9 h-9 rounded-full bg-white text-sky-700 font-bold text-sm flex items-center justify-center hover:ring-2 hover:ring-sky-300 transition"
                    >
                        {getInitials(userData?.firstName, userData?.lastName, email)}
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100">
                                {fullName && <p className="font-semibold text-gray-800 truncate">{fullName}</p>}
                                <p className="text-sm text-gray-500 truncate">{email}</p>
                            </div>
                            <button
                                onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 text-left"
                            >
                                <CgProfile /> Profile
                            </button>
                            <button
                                onClick={logOut}
                                className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 text-left"
                            >
                                <FaSignOutAlt /> Log out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
