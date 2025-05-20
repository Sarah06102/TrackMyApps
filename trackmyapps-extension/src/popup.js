import { db } from './firebase.js';
import { doc, collection, addDoc} from 'firebase/firestore';
import './popup.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { onIdTokenChanged } from "firebase/auth";

let currentUser = null;
let justLoggedOut = false;

function forceGoogleReauth(callback) {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (token) {
            chrome.identity.removeCachedAuthToken({ token }, () => {
                console.log("🔄 Removed existing token");
                callback();
            });
        } else {
            callback();
        }
    });
}

const chromeLoginToFirebase = () => {
    const auth = getAuth();

    //Remove cached Chrome token
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (token) {
            chrome.identity.removeCachedAuthToken({ token }, () => {
                console.log("🔄 Removed cached Chrome token");
                requestNewToken();
            });
        } else {
            requestNewToken();
        }
    });

    function requestNewToken() {
        // Step 2: force user prompt to select Google account
        chrome.identity.getAuthToken({ interactive: true }, function(token) {
            if (chrome.runtime.lastError || !token) {
                console.error("Chrome login failed:", chrome.runtime.lastError?.message || "Unknown error");
                alert("Login failed: " + (chrome.runtime.lastError?.message || "No details"));
                return;
            }

            console.log("New token retrieved:", token);
              
            const credential = GoogleAuthProvider.credential(null, token);

            signInWithCredential(auth, credential)
                .then((result) => {
                console.log("Firebase login successful:", result.user);
                currentUser = result.user;
                updateUI(result.user);
                })
                .catch((error) => {
                console.error("Firebase sign-in error:", error.code, error.message, error.customData);
                });
            
              
        });
    }
};


document.addEventListener('DOMContentLoaded', function () {
    const saveJobBtn = document.getElementById("save-job-btn");
    const mainContent = document.getElementById("main-content");
    const successMsg = document.getElementById("success-msg");
    const notLoggedIn = document.getElementById("not-logged-in");
    const errorMsg = document.getElementById("error-msg");
    const logoutBtn = document.getElementById("logout-btn");

    function updateUI(user) {
        if (user) {
            console.log("User is signed in:", user.email);
            mainContent.style.display = "block";
            notLoggedIn.style.display = "none";
            errorMsg.style.display = "none";
            successMsg.style.display = "none";
            if (logoutBtn) logoutBtn.style.display = "block";
        } else {
            console.warn("No user signed in");
            currentUser = null;
            mainContent.style.display = "none";
            successMsg.classList.remove("fade-in", "fade-out");
            successMsg.style.display = "none";
            errorMsg.innerText = "";
            errorMsg.style.display = "none";
            notLoggedIn.style.display = "block";
            if (logoutBtn) {
                logoutBtn.style.display = "none";
            }            
        }
    }

    document.getElementById("chrome-login-btn").addEventListener("click", () => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (token) {
                chrome.identity.removeCachedAuthToken({ token }, () => {
                    console.log("🧼 Cleared token before Firebase login");
                    chromeLoginToFirebase(); // Will now always show picker
                });
            } else {
                chromeLoginToFirebase();
            }
        });
    });
    
    
    const auth = getAuth();
    let hasTriedAutoLogin = false;
    let lastUid = null;


        onIdTokenChanged(auth, (user) => {
            if (user?.uid === lastUid) return;
            lastUid = user?.uid || null;

            console.log("Firebase sees this user (via onIdTokenChanged):", user);
            currentUser = user;
            document.getElementById("loading-state").style.display = "none";
            updateUI(user);

            if (!user && !hasTriedAutoLogin && !justLoggedOut) {
                hasTriedAutoLogin = true;
                console.log("🔒 No user, forcing Google login flow...");
                forceGoogleReauth(chromeLoginToFirebase);
            }
            if (!user) {
                justLoggedOut = false;
            }
        });

        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                justLoggedOut = true;
                auth.signOut()
                    .then(() => {
                        console.log("User signed out.");
                        chrome.identity.getAuthToken({ interactive: false }, function(token) {
                            if (token) {
                                chrome.identity.removeCachedAuthToken({ token }, function() {
                                    console.log("Removed cached token after logout");
                                    currentUser = null;
                                    updateUI(null);
                                    setTimeout(() => {
                                        console.log("✅ Next login will show Google picker.");
                                    }, 200);
                                });
                            } else {
                                currentUser = null;
                                updateUI(null);
                            }
                        });
                    })
                    .catch((error) => {
                        console.error("Sign-out error:", error);
                    });
            });
        }

        saveJobBtn.addEventListener("click", function () {
            if (!currentUser) {
                errorMsg.innerText = "You must be signed in to save jobs.";
                errorMsg.style.display = "block";
                return;
            }

            
        //Send message to content script to get job info
            chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
                if (!tabs.length) {
                    console.error("No active tab found");
                    return;
                }
                chrome.tabs.sendMessage(tabs[0].id, {action: "getJobInfo"}, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error("Message error:", chrome.runtime.lastError.message);
                        errorMsg.innerText = "Cannot access tab. Try refreshing the page.";
                        errorMsg.style.display = "block";
                        return;
                    }
                    
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
                        
                    console.log("✅ Saving job for user:", currentUser.uid);
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