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
const userEmailText = document.getElementById('user-email');
const emailStatus = document.getElementById('logged-in-email');
const saveBtn = document.getElementById('saveJobButton');

loginBtn.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    userEmailText.textContent = `Logged in as ${auth.currentUser.email}`;
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
      userEmailText.textContent = '';
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
  
// Save Job to Firestore
saveBtn.addEventListener('click', () => {
    const user = auth.currentUser;
    if (!user) return;
  
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;
  
      chrome.tabs.sendMessage(tabs[0].id, { action: "getJobInfo" }, async (response) => {
        console.log("Response from content script:", response);
  
        if (!response || !response.jobTitle || !response.companyName || !response.jobDesc) {
          console.error("Job info not found or incomplete.");
          return;
        }
  
        const jobData = {
          jobTitle: response.jobTitle,
          companyName: response.companyName,
          jobDesc: response.jobDesc,
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
  
