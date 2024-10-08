/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyCeRhOUrvTT0YwFJW4ioBGDdl_yecJZFXU",
    authDomain: "iws-sendchat.firebaseapp.com",
    projectId: "iws-sendchat",
    storageBucket: "iws-sendchat.appspot.com",
    messagingSenderId: "751781330673",
    appId: "1:751781330673:web:b4e5ce560d3af0621ab350",
    measurementId: "G-05FJLCGL08",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging(firebaseApp);

messaging.onBackgroundMessage((payload) => {
    console.log('[IWS Notification Service] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.data.title;
    if (payload.data.isImage == "true" && payload.data.type == "chat")
        payload.data.body = "Sent an image";

    const notificationOptions = {
        body: payload.data.body,
        icon: payload.data.image,
    };

    self.registration.showNotification(notificationTitle,
        notificationOptions);
    const resolveNotification = (e) => {
        e.notification.close();
        self.removeEventListener('notificationclick', resolveNotification);

        e.waitUntil(new Promise((resolve) => {
            if (payload.data.type == "chat") {
                clients.openWindow(`https://app.sendchat.xyz/chat?conversation=${payload.data.username}`);
            } else if (payload.data.type == "post") {
                clients.openWindow(`https://app.sendchat.xyz/user/${payload.data.username}/post/${payload.data.conversationId}`);
            }
            resolve();
        }));
    }
    self.addEventListener('notificationclick', resolveNotification);
});