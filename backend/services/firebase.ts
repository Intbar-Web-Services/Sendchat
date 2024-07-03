import path from "path";
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from "firebase-admin/messaging";

const __dirname = path.resolve();

export const app = initializeApp({
    credential: cert(path.resolve(__dirname, "key.json")),
});

export const messaging = getMessaging(app);
export const auth = getAuth(app);