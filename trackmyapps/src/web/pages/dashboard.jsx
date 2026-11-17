import { doc, collection, getDocs, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase.js";
import React, { useEffect, useState, useRef } from 'react';
import NavBar from '../components/nav-bar.jsx';
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from 'firebase/auth';
import { signOut } from "firebase/auth";
import { auth } from "../../firebase.js";
import { updateDoc, deleteDoc } from "firebase/firestore";
import { query, orderBy } from "firebase/firestore";

const TABLE_HEAD = ["Company Name", "Job Title", "Description", "Status", "Date Saved", ""];
const STATUS = ["Saved", "Applied", "Interview", "Offer", "Rejected"];
const STATUS_COLORS = {
    Saved: "bg-gray-100 text-gray-800",
    Applied: "bg-blue-100 text-blue-800",
    Interview: "bg-yellow-100 text-yellow-800",
    Offer: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
};

const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [appliedStatusFilter, setAppliedStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!user) return;
      
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        });
      
        return () => unsubscribe();
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

    const clearAllJobs = async () => {
        if (!window.confirm(`Delete all ${jobs.length} saved jobs? This can't be undone.`)) return;
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

    const filteredJobs = jobs.filter(job => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (job.companyName || '').toLowerCase().includes(term) ||
                              (job.jobTitle || '').toLowerCase().includes(term);
        const matchesStatus = appliedStatusFilter ? job.status === appliedStatusFilter : true;
        return matchesSearch && matchesStatus;
      });


    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <div className="max-w-[90%] mx-auto pt-20 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-2 ml-6">Hi{userData?.firstName ? `, ${userData.firstName}` : ''}! Welcome to your Dashboard</h1>
                    <div className="flex flex-col gap-3 items-end m-6">
                        {jobs.length > 0 && (
                            <button onClick={clearAllJobs} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">
                                Clear All Jobs
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 mb-6">
                    <input type="text" placeholder="Search by company or job title" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 border rounded-lg w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-sky-500"/>

                    <select value={appliedStatusFilter} onChange={(e) => setAppliedStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <option value="">All Statuses</option>
                        {STATUS.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>

                    {(appliedStatusFilter || searchTerm) && (
                        <button onClick={() => {
                            setAppliedStatusFilter('');
                            setSearchTerm('');
                        }}
                        className="text-sm text-gray-600 underline whitespace-nowrap"
                        >
                        Clear Filters
                        </button>
                    )}
                    </div>
                {jobs.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-6 mb-4">
                        {STATUS.map((status) => {
                            const count = jobs.filter((job) => job.status === status).length;
                            const active = appliedStatusFilter === status;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setAppliedStatusFilter(active ? '' : status)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium border transition ${STATUS_COLORS[status]} ${active ? "ring-2 ring-offset-1 ring-sky-500" : "border-transparent hover:opacity-80"}`}
                                >
                                    {count} {status}
                                </button>
                            );
                        })}
                    </div>
                )}
                <JobsTable jobs={filteredJobs} setJobs={setJobs} />
            </div>
        </div>  
    );
};  
    
//Jobs Table
const JobsTable = ({ jobs, setJobs }) => {
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState({});

    // Jobs saved after the previous dashboard load get a "New" highlight.
    // Read the last visit once (pure), then record this visit in an effect.
    const [lastVisit] = useState(() => {
        try {
            const saved = localStorage.getItem("dashboardLastVisit");
            return saved ? Number(saved) : null;
        } catch {
            return null;
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem("dashboardLastVisit", String(Date.now()));
        } catch { /* storage unavailable - highlights just won't persist */ }
    }, []);
    const isNew = (job) => lastVisit !== null && job.dateSaved && new Date(job.dateSaved).getTime() > lastVisit;

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
      const job = jobs.find((j) => j.id === jobId);
      if (!window.confirm(`Delete ${job?.jobTitle || "this job"}${job?.companyName ? ` at ${job.companyName}` : ""}?`)) return;
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

                    return (

                    <tr key={job.id} className={`border-b transition-colors ${isNew(job) ? "bg-sky-50 hover:bg-sky-100" : "hover:bg-gray-50"}`}>
                        <td className="py-3 px-4">{job.companyName || "N/A"}</td>
                        <td className="py-3 px-4">
                            {job.url ? (
                                <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 font-medium hover:underline">
                                    {job.jobTitle || "N/A"}
                                </a>
                            ) : (job.jobTitle || "N/A")}
                            {isNew(job) && (
                                <span className="ml-2 align-middle text-xs font-semibold bg-sky-600 text-white px-2 py-0.5 rounded-full">New</span>
                            )}
                        </td>
                        <td className="py-3 px-4 text-sm align-top w-[400px] max-w-[400px]">
                            <div className={`whitespace-pre-line text-gray-700 ${isExpanded ? "max-h-96 overflow-y-auto pr-2" : "line-clamp-3"}`}>
                                {cleanDesc || <span className="text-gray-400 italic">No description</span>}
                            </div>
                            {cleanDesc.length > 150 && (
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
                            <select className={`cursor-pointer border rounded px-2 py-1 text-sm font-medium ${STATUS_COLORS[job.status] || ""}`}
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