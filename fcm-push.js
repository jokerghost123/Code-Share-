
import {
    getApps,
    getApp,
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getMessaging,
    getToken,
    onMessage
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";
import {
    getFirestore,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBXDDwYx0FPnJBc6vkgLPzeIJk6hiEVMEw",
    authDomain: "code-share-2c4ea.firebaseapp.com",
    projectId: "code-share-2c4ea",
    storageBucket: "code-share-2c4ea.firebasestorage.app",
    messagingSenderId: "706094984093",
    appId: "1:706094984093:web:bd62bbed06c156bb5c1d74"
};


const app = getApps().length ? getApp(): initializeApp(firebaseConfig);
const db = getFirestore(app);

const VAPID_KEY = "BC73u4g7aRE1tuzxi6NTXvjXbjdEDDX-nn-c9CcQbE2oWO5QXehumYfjA2y-ysbwHfnwmyBv6eBzxXrW5VxFI9w";

/**
* connexion de l'utilisateur.
* @param {string} userId - L'UID de l'utilisateur connecté.
*/
export async function initFCM(userId) {

    if (!('Notification' in window)) {
        console.log("Ce navigateur ne supporte pas les notifications.");
        return;
    }

    .
    if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log("Permission de notification refusée.");
            return;
        }
    }

    if (Notification.permission !== 'granted') {
        console.log("Permission de notification non accordée.");
        return;
    }

    
    try {
        const messaging = getMessaging(app);


        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY
        });
        if (token) {

            await setDoc(doc(db, "users", userId, "tokens", token), {
                token: token,
                createdAt: new Date().toISOString(),
                userAgent: navigator.userAgent
            }, {
                merge: true
            });
            console.log("Token FCM enregistré :", token);
        } else {
            console.log("Aucun token reçu.");
        }

        onMessage(messaging, (payload) => {
            console.log("Message reçu (au premier plan) :", payload);
            if (payload.notification) {
                const title = payload.notification.title || "Code-Share";
                const body = payload.notification.body || "";
                if (window.showToast) showToast(`${title} : ${body}`, "info");
            }
        });
    } catch (err) {
        console.error("Erreur FCM :",
            err);
    }
}

window.initFCM = initFCM;