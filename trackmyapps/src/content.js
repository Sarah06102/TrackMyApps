console.log("✅ Content script loaded");

let jobTitle = null;
let companyName = null;
let jobDesc = null;
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
    jobDesc = document.querySelector(".job-details-about-the-job-module__description")?.innerText || 'Not found';
    jobDesc = jobDesc.replace(/…\s*show more/gi, "").trim();

    // If not found, try full job view layout
    if (jobTitle === 'Not found' || companyName === 'Not found') {
        jobTitle = document.querySelector("h1.t-24.t-bold.inline")?.innerText || jobTitle;
        companyName = document.querySelector(".job-details-jobs-unified-top-card__company-name")?.innerText || companyName;
        jobDesc = document.querySelector(".job-details-about-the-job-module__description")?.innerText || 'Not found';
        jobDesc = jobDesc.replace(/…\s*show more/gi, "").trim();
    }
    // If both are found, log them and disconnect the observer
    if (jobTitle && companyName && jobDesc && jobTitle !== 'Not found' && companyName !== 'Not found' && jobDesc !== 'Not found') {
        hasCaptured = true;
        console.log("Job captured.");
        console.log("Job Title:", jobTitle);
        console.log("Company:", companyName);
        console.log("Job Description:", jobDesc);
    }
});

observer.observe(document.body, { childList: true, subtree: true, characterData: true });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "getJobInfo") {
       
        // If data is already ready, respond immediately
        if (jobTitle && companyName && jobDesc && jobTitle !== 'Not found' && companyName !== 'Not found' && jobDesc !== 'Not found') {
            hasCaptured = true;
            console.log("Sending job info immediately.");
            sendResponse({ jobTitle, companyName, jobDesc });
        } else {
            console.log("Job info not ready, retrying after 300ms...");
            
            // Retry after slight delay
            setTimeout(() => {
                jobDesc = document.querySelector(".job-details-about-the-job-module__description")?.innerText || jobDesc;
                jobDesc = jobDesc.replace(/…\s*show more/gi, "").trim();
                sendResponse({ jobTitle, companyName, jobDesc });
            }, 300);
        }
        return true;
    }
});