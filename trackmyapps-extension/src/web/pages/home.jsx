import React, { useRef, useEffect } from 'react';
import NavBar from '../components/nav-bar.jsx';
import { Link } from 'react-router-dom';

export const ScrollFade = () => {
    const lastScrollY = useRef(window.scrollY);
    useEffect(() => {
        const elements = document.querySelectorAll('.fade-in-start');

        const observer = new IntersectionObserver((entries) => {
            const direction = window.scrollY > lastScrollY.current ? 'down' : 'up';
            lastScrollY.current = window.scrollY;

            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(direction ? 'fade-in-up' : 'fade-in-down');
                    entry.target.classList.remove(direction ? 'fade-in-down' : 'fade-in-up');
                } else {
                    entry.target.classList.remove('fade-in-up', 'fade-in-down');
                }
            });
          }, {
            threshold: 0.1
    });
        elements.forEach(el => observer.observe(el));   
        return () => observer.disconnect();
    }, [])
    return null; 
};

const Home = () => {
    return (
        
        <div className="scroll-smooth bg-gradient-to-r from-sky-100 to-blue-50 animate-fade-in">
            <ScrollFade />
            <NavBar />
            {/* Home Section */}
            <div id="Home" className="fade-in-start duration-700 min-h-screen flex flex-col justify-center items-center text-center px-4">
                <h1 className="text-6xl md:text-6xl font-bold text-center text-gray-800 mb-4">
                    Welcome to <span className="text-sky-600">TrackMyApps</span>
                </h1>
                <p className="text-lg md:text-2xl text-gray-600 text-center max-w-xl mx-auto">
                    Organize and track your job applications seamlessly.
                </p>
                <div className="flex justify-center items-center mt-8 gap-4">
                    <h5 className="text-2xl font-semibold text-gray-700">Get Started Today</h5>
                    <Link className= "rounded-2xl font-semibold px-4 py-2 bg-sky-400 hover:bg-sky-300 transition-all duration-300 ease-in-out" to='/signup'>Create An Account</Link>
                </div>
            </div>
            
            {/* About Section */}
            <section id="About" className="fade-in-start scroll-mt-40 px-6 py-16 max-w-3xl mx-auto text-center mb-40">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">What is TrackMyApps?</h2>
                <p className="text-gray-700 text-md md:text-lg">TrackMyApps is your personal job application tracker. It allows you to effortlessly save jobs, monitor application statuses, and stay organized during your job search - all in one place.</p>
            </section>

            {/* Features Section */}
            <section id="Features" className="fade-in-start scroll-mt-30 py-16 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-12">Features</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {[
                        {
                        title: "One-Click Save",
                        desc: "Instantly save jobs from platforms like LinkedIn or Indeed using our Chrome extension."
                        },
                        {
                        title: "Visual Dashboard",
                        desc: "Track all your job applications in a clear, organized dashboard."
                        },
                        {
                        title: "Status Tracking",
                        desc: "Categorize jobs as Saved, Applied, Interview, Offer, or Rejected."
                        },
                        {
                        title: "Search & Filter",
                        desc: "Quickly find jobs by company, title, or status with advanced filters."
                        },
                        {
                        title: "Private & Secure",
                        desc: "Your job data is encrypted and securely stored with Firebase."
                        },
                    ].map(({ title, desc }) => (
                        <div key={title} className="bg-sky-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition duration-300 text-left">
                        <h3 className="text-xl font-bold text-sky-700 mb-2">{title}</h3>
                        <p className="text-gray-600">{desc}</p>
                        </div>
                    ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border border-text-zinc-900 text-center text-gray-500 pt-2s text-sm">
                &copy; {new Date().getFullYear()} TrackMyApps. All rights reserved.
            </footer>
        </div>
    );
}

export default Home;
