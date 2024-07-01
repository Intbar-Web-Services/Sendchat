import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export let currentFirebaseUser;

export default function getCurrentUserId() {
    return new Promise((resolve) => {
        async function Run() {
            resolve(await currentFirebaseUser.getIdToken());
        }

        if (!currentFirebaseUser) {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    currentFirebaseUser = user;
                    resolve(await currentFirebaseUser.getIdToken());
                }
            });
        } else {
            Run();
        }
    });
}
getCurrentUserId();
