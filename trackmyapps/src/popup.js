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
      loadJobPreview();
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

// Job read from the current tab when the popup opens
let currentJob = null;
let currentTab = null;

// Read the job on the current tab and show it in the popup before saving
function loadJobPreview() {
    const preview = document.getElementById('job-preview');
    currentJob = null;
    saveBtn.disabled = true;
    preview.textContent = 'Reading job…';

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      currentTab = tabs[0];
      if (!currentTab?.id) {
        preview.textContent = 'No job detected on this page.';
        return;
      }

      requestJobInfo(currentTab.id, (response) => {
        if (response?.jobTitle && response?.companyName) {
          currentJob = response;
          saveBtn.disabled = false;
          preview.innerHTML = '';
          const title = document.createElement('strong');
          title.textContent = response.jobTitle;
          const company = document.createElement('span');
          company.textContent = response.companyName;
          preview.append(title, company);
        } else {
          preview.textContent = 'No job detected on this page. Open a job posting and try again.';
        }
      });
    });
}

// Save Job to Firestore
saveBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user || !currentJob || saveBtn.disabled) return;
    statusText.innerText = '';

    // Prevent double clicks from saving the job twice
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    const jobData = {
      jobTitle: currentJob.jobTitle,
      companyName: currentJob.companyName,
      jobDesc: currentJob.jobDesc || "",
      status: "Saved",
      dateSaved: new Date().toISOString(),
      url: currentTab.url
    };

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
      statusText.innerText = "Couldn't save the job. Please try again.";
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Job';
    }
});
  
