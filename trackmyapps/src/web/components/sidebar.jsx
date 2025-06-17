import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaSignOutAlt, FaTachometerAlt, FaTimes } from 'react-icons/fa';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              setUserData(userSnap.data());
            }
          }
        }); 
        return () => unsubscribe();
    }, []);

    const getInitials = (name = '') => {
        const parts = name.trim().split(' ');
        return parts.map(n => n[0]).join('').toUpperCase();
    };

    const handleClick = (path) => {
        navigate(path);
        onClose(); 
      };
    
  return (
    <>

      {/* Sidebar Panel */}
    <div
        className={`fixed top-0 left-0 h-full w-64 bg-sky-700 shadow-lg z-40 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-sky-600">
          <button onClick={onClose} className="text-white text-xl">
            <FaTimes />
          </button>
          <h2 className="text-white font-bold text-xl">TrackMyApps</h2>
        </div>

         {/* User Info */}
         {userData && (
          <div className="text-center mt-6 mb-4 px-6">
            <div className="mx-auto w-14 h-14 bg-white text-sky-700 font-bold text-lg rounded-full flex items-center justify-center">
              {getInitials(`${userData.firstName} ${userData.lastName}`)}
            </div>
            <p className="text-white mt-2 font-semibold">
              {userData.firstName} {userData.lastName}
            </p>
            <p className="text-sm text-sky-200">{userData.email}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col gap-6 px-6 py-8">
          <button
            onClick={() => handleClick('/dashboard')}
            className="flex items-center gap-3 text-white text-lg font-medium hover:bg-sky-600 px-4 py-2 rounded-lg transition"
          >
            <FaTachometerAlt />
            Dashboard
          </button>

          <button onClick={() => handleClick('/')} className="flex items-center gap-3 text-white text-lg font-medium hover:bg-sky-600 px-4 py-2 rounded-lg transition">
            <FaHome />
            Home
          </button>

          <button onClick={() => { localStorage.setItem('userLoggedOut', 'true'); handleClick('/login'); }} className="flex items-center gap-3 text-white text-lg font-medium hover:bg-sky-600 px-4 py-2 rounded-lg transition">
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>

      {/* Background Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={onClose}
        />
      )}
    </>
  );
};