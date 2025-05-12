import { db } from './firebase.js';
import { collection, addDoc} from 'firebase/firestore';
import './popup.css';

document.addEventListener('DOMContentLoaded', function () {
    const saveJobBtn = document.getElementById("save-job-btn");
    const mainContent = document.getElementById("main-content");
    const successMsg = document.getElementById("success-msg");

    saveJobBtn.addEventListener("click", function () {
        //Send message to content script to get job info
        chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {action: "getJobInfo"}, function(response) {
                console.log("Received response from content script:", response);
                //Save job info to Firebase
                console.log("Received job info:", response);
                if (response && response.jobTitle && response.companyName) {
                    addDoc(collection(db, "jobs"), {
                        jobTitle: response.jobTitle,
                        companyName: response.companyName,
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
                        //Fully close the popup (optional)
                        setTimeout(() => {
                            window.close();
                        }, 2500); 

                    }).catch(function(error) {
                        console.error("Error saving job: ", error);
                    });
                } else {
                    console.warn("No job information found.");
                }
            });
        });
    });
});

