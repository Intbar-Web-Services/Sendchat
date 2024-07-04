import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAuth } from "firebase/auth";
import getCurrentUserId from "./user";

const firebaseConfig = {
    apiKey: "AIzaSyCeRhOUrvTT0YwFJW4ioBGDdl_yecJZFXU",
    authDomain: "iws-sendchat.firebaseapp.com",
    projectId: "iws-sendchat",
    storageBucket: "iws-sendchat.appspot.com",
    messagingSenderId: "751781330673",
    appId: "1:751781330673:web:b4e5ce560d3af0621ab350",
    measurementId: "G-05FJLCGL08",
};
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export const auth = getAuth(app);

export const generateToken = async () => {
    const permission = await Notification.requestPermission();
    console.log(permission);
    if (permission === "granted") {
        /* what's going on here?
        The token from Firebase Cloud Messaging can be retrieved with messaging.token.
        But, the Firebase devs did not include it in the TypeScript types
        So it causes an error
        Nothing to be worried about 😀 */

        // @ts-expect-error
        const oldToken = messaging.token;
        const token = await getToken(messaging, {
            vapidKey:
                "BCE__zmwje5W2p5m4q2lI9dG7YfLqO8k8FyvVjIlEYuE5yW2lhRg7hDuU2iJ-YGjGPetn2ML1TEvn44U0C4K33E",
        });

        try {
            const res = await fetch("/api/messages/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${await getCurrentUserId()}`,
                },
                body: JSON.stringify({
                    token,
                    oldToken,
                }),
            });

            const data: { success?: string | boolean, error?: string } = await res.json();

            if (data.error) {
                return;
            }
        } catch (error) {
        }

        console.log(token);
    } else {
    }
};