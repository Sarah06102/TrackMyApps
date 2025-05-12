console.log("✅ Content script loaded");

let jobTitle = null;
let companyName = null;
let hasCaptured = false;
let lastUrl = location.href;

//Detect job changes by monitoring URL (LinkedIn is an SPA)
setInterval(() => {
    if (location.href !== lastUrl) {
      console.log("Job URL changed");
      lastUrl = location.href;
  
      // Reset previously captured job data
      jobTitle = null;
      companyName = null;
      hasCaptured = false;

    }
  }, 500);

// Start observing for job content
const observer = new MutationObserver(() => {
    // Check if the job title and company name are already captured
    if (hasCaptured) return;
    // Try sidebar view first
    jobTitle = document.querySelector("h1.t-24.t-bold.inline a")?.innerText || 'Not found';;
    companyName = document.querySelector(".job-details-jobs-unified-top-card__company-name a")?.innerText || 'Not found';

    // If not found, try full job view layout
    if (jobTitle === 'Not found' || companyName === 'Not found') {
        jobTitle = document.querySelector("h1.t-24.t-bold.inline")?.innerText || jobTitle;
        companyName = document.querySelector(".job-details-jobs-unified-top-card__company-name")?.innerText || companyName;
    }
    // If both are found, log them and disconnect the observer
    if (jobTitle && companyName && jobTitle !== 'Not found' && companyName !== 'Not found') {
        hasCaptured = true;
        console.log("Job captured.");
        console.log("Job Title:", jobTitle);
        console.log("Company:", companyName);
    }
});

observer.observe(document.body, { childList: true, subtree: true, characterData: true });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "getJobInfo") {
       
        // If data is already ready, respond immediately
        if (jobTitle && companyName && jobTitle !== 'Not found' && companyName !== 'Not found') {
            console.log("✅ Sending job info immediately.");
            sendResponse({ jobTitle, companyName });
        } else {
            console.log("⏳ Job info not ready, retrying after 300ms...");
            
            // Retry after slight delay
            setTimeout(() => {
                sendResponse({ jobTitle, companyName });
            }, 300);
        }
        return true;
    }
});