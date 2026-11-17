import { auth, db } from './firebase-extension.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';

const loginBtn = document.getElementById('login-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const statusText = document.getElementById('status');
const loginContainer = document.getElementById('login-container');
const jobActions = document.getElementById('job-actions');
const logoutBtn = document.getElementById('logout-btn');
const emailStatus = document.getElementById('logged-in-email');
const saveBtn = document.getElementById('saveJobButton');

loginBtn.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    emailStatus.textContent = `Logged in as ${auth.currentUser.email}`;
    // Hide login UI
    loginContainer.style.display = 'none';
    statusText.innerText = '';

    // Show job actions
    jobActions.style.display = 'block';

  } catch (err) {
    console.error('Login error:', err);
    statusText.innerText = 'Login failed. Check credentials.';
  }
});

logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      emailStatus.textContent = '';
      loginContainer.style.display = 'block';
      jobActions.style.display = 'none';
    } catch (error) {
      console.error('Logout failed:', error);
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
      loginContainer.style.display = 'none';
      jobActions.style.display = 'block';
      emailStatus.innerText = `Logged in as ${user.email}`;
      statusText.innerText = ''; 
    } else {
      loginContainer.style.display = 'block';
      jobActions.style.display = 'none';
      emailStatus.innerText = '';
      statusText.innerText = '';
    }
  });
  
// Ask the content script for job info. If it isn't in the tab yet (tab was
// open before the extension loaded/reloaded), inject it and ask again.
function requestJobInfo(tabId, callback, retried = false) {
    chrome.tabs.sendMessage(tabId, { action: "getJobInfo" }, (response) => {
      if (chrome.runtime.lastError && !retried) {
        chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] }, () => {
          if (chrome.runtime.lastError) {
            console.error("Could not inject content script:", chrome.runtime.lastError.message);
            callback(undefined);
            return;
          }
          requestJobInfo(tabId, callback, true);
        });
        return;
      }
      callback(response);
    });
}

// Save Job to Firestore
saveBtn.addEventListener('click', () => {
    const user = auth.currentUser;
    if (!user) return;
    statusText.innerText = '';

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;

      requestJobInfo(tabs[0].id, async (response) => {
        console.log("Response from content script:", response);
  
        if (!response || !response.jobTitle || !response.companyName) {
          console.error("Job info not found or incomplete.", response);
          statusText.innerText = "Couldn't read job details from this page. Open a job posting and try again.";
          return;
        }

        const jobData = {
          jobTitle: response.jobTitle,
          companyName: response.companyName,
          jobDesc: response.jobDesc || "",
          status: "Saved",
          dateSaved: new Date().toISOString(),
          url: tabs[0].url
        };
  
        console.log("Final jobData to save:", jobData);
  
        try {
          await addDoc(collection(db, `users/${user.uid}/jobs`), jobData);
  
          // Show success message
          document.getElementById('job-actions').style.display = 'none';
          const successMsg = document.getElementById('success-msg');
          successMsg.style.display = 'flex';
          successMsg.classList.add('fade-in');
  
          setTimeout(() => {
            successMsg.classList.remove('fade-in');
            successMsg.classList.add('fade-out');
          }, 2500);
  
          setTimeout(() => window.close(), 3000);
  
        } catch (e) {
          console.error("Error saving job:", e);
        }
      });
    });
  });
  
