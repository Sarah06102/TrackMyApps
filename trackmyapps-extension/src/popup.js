import { db } from './firebase.js';
import { doc, collection, addDoc} from 'firebase/firestore';
import './popup.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";

const chromeLoginToFirebase = () => {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
        if (chrome.runtime.lastError || !token) {
            console.error("Chrome login failed:", chrome.runtime.lastError?.message || chrome.runtime.lastError || "Unknown error");
            alert("Login failed: " + (chrome.runtime.lastError?.message || "No details"));
            return;
        }
    

        // Use token to sign into Firebase
        const credential = GoogleAuthProvider.credential(null, token);
        const auth = getAuth();

        signInWithCredential(auth, credential)
            .then((result) => {
                console.log("Firebase sign-in success:", result.user.email);
            })
            .catch((error) => {
                console.error("Firebase sign-in error:", error.message || error);
            });
    });
};


document.addEventListener('DOMContentLoaded', function () {
    const saveJobBtn = document.getElementById("save-job-btn");
    const mainContent = document.getElementById("main-content");
    const successMsg = document.getElementById("success-msg");
    const notLoggedIn = document.getElementById("not-logged-in");
    const errorMsg = document.getElementById("error-msg");
    const logoutBtn = document.getElementById("logout-btn");

    document.getElementById("chrome-signin-btn").addEventListener("click", chromeLoginToFirebase);
    
    const auth = getAuth();
    let currentUser = null;

    function updateUI(user) {
        if (user) {
            console.log("User is signed in:", user.email);
            mainContent.style.display = "block";
            notLoggedIn.style.display = "none";
            errorMsg.style.display = "none";
            successMsg.style.display = "none";
        } else {
            console.warn("No user signed in");
            currentUser = null;
            mainContent.style.display = "none";
            successMsg.style.display = "none";
            errorMsg.innerText = "";
            errorMsg.style.display = "none";
            notLoggedIn.style.display = "block";
        }
    }
        // Watch for auth state changes
        onAuthStateChanged(auth, (user) => {
        console.log("Firebase sees this user:", user);
        currentUser = user;
        updateUI(user);
    });
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            auth.signOut()
                .then(() => {
                    console.log("User signed out.");
                    window.location.reload(); 
                })
                .catch((error) => {
                    console.error("Sign-out error:", error);
                });
        });
    };
    
        saveJobBtn.addEventListener("click", function () {
            if (!currentUser) {
                errorMsg.innerText = "You must be signed in to save jobs.";
                errorMsg.style.display = "block";
                return;
            }

            
        //Send message to content script to get job info
            chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
                chrome.tabs.sendMessage(tabs[0].id, {action: "getJobInfo"}, function(response) {
                    if (!response) {
                        errorMsg.innerText = "No job info received. Try again.";
                        errorMsg.style.display = "block";
                        return;
                    }
                    
                    console.log("Received response from content script:", response);
                    //Save job info to Firebase
                    console.log("Received job info:", response);

                if (response && response.jobTitle && response.companyName && response.jobDesc) {
                    const userRef = doc(db, 'users', currentUser.uid);
                    const jobsRef = collection(userRef, 'jobs');        
                        
                    addDoc(jobsRef, {
                        jobTitle: response.jobTitle,
                        companyName: response.companyName,
                        jobDesc: response.jobDesc,
                        dateSaved: new Date().toISOString(),
                    }).then(function() {
                        console.log("Job saved successfully!");

                        // Hide main content and show success message
                        mainContent.classList.add("fade-out");
                        mainContent.style.display = "none";
                        successMsg.style.display = "block";
                        successMsg.classList.add("fade-in");

                        //Fade out popup after 2 seconds
                        setTimeout(() => {
                            successMsg.classList.remove("fade-in");
                            successMsg.classList.add("fade-out");
                        }, 2000);
                        //Fully close the popup 
                        setTimeout(() => {
                            window.close();
                        }, 2500); 

                    }).catch(function(error) {
                        console.error("Error saving job: ", error);
                        errorMsg.innerText = "Failed to save job. Try again.";
                        errorMsg.style.display = "block";
                    });
                } else {
                    errorMsg.innerText = "Could not get job info. Try again.";
                    errorMsg.style.display = "block";
                }
            });
        });
    });
});