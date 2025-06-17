console.log("Background service worker started");
chrome.runtime.onConnect.addListener(function (port) {
    console.log("Persistent connection established");
    port.onDisconnect.addListener(() => {
        console.log("Persistent connection disconnected");
    });
});

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed.");
  });
  
  chrome.runtime.onStartup.addListener(() => {
    console.log("Extension started.");
  });

let firebaseUser = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background received:", message);
    if (message.type === "SAVE_USER" && message.payload?.uid && message.payload?.email) {
        firebaseUser = message.payload;
        console.log("User saved in background:", firebaseUser);
        sendResponse({ status: "stored" });
        return true;
    }

    if (message.type === "GET_USER") {
        console.log("Sending user from background:", firebaseUser);
        sendResponse({ user: firebaseUser });
        return true;
    }

    return false;
});
