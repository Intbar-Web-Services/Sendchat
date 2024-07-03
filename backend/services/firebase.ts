import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from "firebase-admin/messaging";

export const app = initializeApp({
    projectId: "iws-sendchat",
    credential: cert("./key.json"),
});

export const messaging = getMessaging(app);
export const auth = getAuth(app);