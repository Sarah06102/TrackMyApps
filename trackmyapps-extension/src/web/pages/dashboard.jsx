import { doc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import React, { useEffect, useState } from 'react';
import NavBar from '../components/nav-bar.jsx';
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from 'firebase/auth';
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async (userId) => {
            setLoading(true);
            const jobsRef = collection(db, 'users', userId, 'jobs');
            const jobsSnapshot = await getDocs(jobsRef);
            const jobsList = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setJobs(jobsList);
            setLoading(false);
        };
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchJobs(user.uid);
            }
        });
        return () => {
            unsubscribe();
        };
    }, []);


    const logOut = async () => {
        try {
            //Sign out from Firebase
            await signOut(auth);
            console.log('Logged out from Firebase');
    
            //Remove Google OAuth token if logged in via Chrome extension
            if (window.chrome?.identity) {
                chrome.identity.getAuthToken({ interactive: false }, function(token) {
                    if (token) {
                        chrome.identity.removeCachedAuthToken({ token }, function() {
                            console.log('Removed Google cached token');
                        });
                    }
                });
            }

            //Set flag to signal popup state change
            localStorage.setItem("userLoggedOut", "true");

            // Navigate back to login
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div>
            <NavBar />
            <h1>Dashboard</h1>
            <p>Welcome to the dashboard!</p>
            <button onClick={logOut}>Logout</button>

            {loading ? (
            <p>Loading jobs...</p>
            ) : jobs.length > 0 ? (
            jobs.map((job) => (
                <div key={job.id} className="border p-4 my-2 rounded">
                <p><strong>{job.companyName}</strong></p>
                <p>{job.jobTitle}</p>
                <p className="text-sm text-gray-500">
                    {new Date(job.dateSaved).toLocaleString()}
                </p>
            </div>
        ))
    ) : (
      <p>No jobs saved yet.</p>
    )}
  </div>
)};

export default Dashboard;