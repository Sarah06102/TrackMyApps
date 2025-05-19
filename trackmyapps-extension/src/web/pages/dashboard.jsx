import { doc, collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import React, { useEffect, useState, useRef } from 'react';
import NavBar from '../components/nav-bar.jsx';
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from 'firebase/auth';
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { updateDoc, deleteDoc } from "firebase/firestore";
import { query, orderBy } from "firebase/firestore";

const TABLE_HEAD = ["Company Name", "Job Title", "Description", "Status", "Date Saved", ""];
const STATUS = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const navigate = useNavigate();

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

    const clearAllJobs = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
            console.error("User not logged in");
            return;
            }

            const querySnapshot = await getDocs(collection(db, "users", user.uid, "jobs"));
            const deletePromises = querySnapshot.docs.map(docSnap => deleteDoc(doc(db, "users", user.uid, "jobs", docSnap.id)));
            await Promise.all(deletePromises);

            setJobs([]);
            console.log("All jobs deleted.");
        } catch (error) {
            console.error("Error deleting jobs:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <div className="max-w-[90%] mx-auto p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-2 ml-6">Dashboard</h1>
                    <p className="text-sm text-gray-500">Your saved job applications at a glance</p>
                    <div className="flex flex-col gap-3 items-end m-6">
                        <button onClick={logOut} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Logout</button>
                        {jobs.length > 0 && (
                            <button onClick={clearAllJobs} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">
                                Clear All Jobs
                            </button>
                        )}
                    </div>
                </div>
                <JobsTable jobs={jobs} setJobs={setJobs} />
            </div>
        </div>  
    );
};  
    
//Jobs Table
const JobsTable = ({ jobs, setJobs }) => {
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState(false);
    const [descHeights, setDescHeights] = useState({});
    const descRefs = useRef({});

      useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) return;
            const jobsQuery = query(
                collection(db, "users", user.uid, "jobs"),
                orderBy("dateSaved", "desc")
              );
          
              const unsubscribeJobs = onSnapshot(jobsQuery, (querySnapshot) => {
                const jobsList = querySnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                }));
                setJobs(jobsList);
                setLoading(false);
              });
          
              return () => {
                unsubscribeJobs();
              };
            });
          
            return () => {
              unsubscribe();
            };
          }, []);

      useEffect(() => {
        const newHeights = {};
        Object.entries(descRefs.current).forEach(([id, el]) => {
          if (el) newHeights[id] = el.scrollHeight;
        });
        setDescHeights(newHeights);
      }, [jobs]);
    
    const statusChange = async (jobId, newStatus) => {
      try {
        const user = auth.currentUser;
        const jobRef = doc(db, "users", user.uid, "jobs", jobId);
        await updateDoc(jobRef, { status: newStatus });
        setJobs(jobs.map(job => job.id === jobId ? { ...job, status: newStatus } : job));
      } catch (error) {
        console.error("Failed to update status:", error);
      }
    };
  
    const deleteJob = async (jobId) => {
      try {
        const user = auth.currentUser;
        const jobRef = doc(db, "users", user.uid, "jobs", jobId);
        await deleteDoc(jobRef);
        setJobs(jobs.filter(job => job.id !== jobId));
      } catch (error) {
        console.error("Failed to delete job:", error);
      }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-60">
                <p className="text-gray-500 text-lg animate-pulse">Loading jobs...</p>
            </div>
        ); 
    }   
       
    if (jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-gray-600">
                <span className="text-4xl mb-2">📄</span>
                <p className="text-lg font-semibold mb-1">No jobs saved yet.</p>
                <p className="text-sm mb-4">Start saving roles you're interested in.</p>
            </div>
        )
    }
        
    return (
        <div className="w-full px-6 overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow">
            <thead>
                <tr className="bg-gray-200">
                {TABLE_HEAD.map((head) => (
                    <th key={head} className="px-4 py-2 text-left font-medium text-sm text-gray-700">
                    {head}
                    </th>
                ))}
                </tr>
            </thead>
            <tbody>
                {jobs.map((job) => {
                    const desc = job.jobDesc || "";
                    const cleanDesc = desc.replace(/\n{3,}/g, '\n\n').replace(/(\n\s*){2,}/g, '\n\n').trim();
                    const isExpanded = expandedRows[job.id];
                    const shortDesc = cleanDesc.length > 100 ? cleanDesc.slice(0, 100) + "..." : cleanDesc;

                    return (

                    <tr key={job.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">{job.companyName || "N/A"}</td>
                        <td className="py-3 px-4">{job.jobTitle || "N/A"}</td>
                        <td className="py-3 px-4 max-w-xs text-sm align-top w-[400px]">
                            <div ref={(el) => (descRefs[job.id] = el)} className="overflow-y-scroll transition-[max-height] duration-500 ease-in-out overflow-hidden whitespace-pre-line border rounded p-2 pr-2" style={{ maxHeight: expandedRows[job.id] ? `${descHeights[job.id] || 500}px` : "170px"}}>
                                <div className="whitespace-pre-line pr-2 max-h-[500px]">
                                    {isExpanded ? cleanDesc : shortDesc}
                                </div>
                            </div>
                            {desc.length > 100 && (
                            <button onClick={() => setExpandedRows((prev) => ({
                                ...prev,
                                [job.id]: !prev[job.id],
                                }))
                            } className="text-sky-600 ml-1 hover:text-sky-300 underline text-xs mt-1 inline-flex items-center gap-1">
                                {isExpanded ? "Read Less" : "Read More"}
                            </button>
                        )}
                        </td>
                        <td className="py-3 px-4 align-middle">
                            <select className={`cursor-pointer border rounded px-2 py-1 text-sm font-medium
                                    ${
                                    job.status === "Saved"
                                        ? "bg-gray-100 text-gray-800"
                                        : job.status === "Applied"
                                        ? "bg-blue-100 text-blue-800"
                                        : job.status === "Interview"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : job.status === "Offer"
                                        ? "bg-green-100 text-green-800"
                                        : job.status === "Rejected"
                                        ? "bg-red-100 text-red-800"
                                        : ""
                                    }
                                `}
                                value={job.status} onChange={(e) => statusChange(job.id, e.target.value)}>
                                {STATUS.map((status) => (
                                <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                        {job.dateSaved ? `${new Date(job.dateSaved).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })} at ${new Date(job.dateSaved).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}`
                        : "N/A"}
                        </td>
                        <td className="py-8 px-4 align-middle">
                            <button className="bg-red-500 text-white rounded px-3 py-1 text-sm hover:bg-red-600" onClick={() => deleteJob(job.id)}>
                                Delete
                            </button>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
      </div>
    );
};  

export default Dashboard;