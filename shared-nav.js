

import { getApps, getApp, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
    getFirestore, collection, doc, getDoc, setDoc, query, where, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyBXDDwYx0FPnJBc6vkgLPzeIJk6hiEVMEw",
    authDomain: "code-share-2c4ea.firebaseapp.com",
    projectId: "code-share-2c4ea",
    storageBucket: "code-share-2c4ea.firebasestorage.app",
    messagingSenderId: "706094984093",
    appId: "1:706094984093:web:bd62bbed06c156bb5c1d74"
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


const currentPage = location.pathname.split("/").pop() || "index.html";
const PAGES_WITH_OWN_NOTIF_LOGIC = ["index.html", "community.html"];

onAuthStateChanged(auth, (user) => {
    if (!user) return; 

    if (!PAGES_WITH_OWN_NOTIF_LOGIC.includes(currentPage)) {
        watchNotificationBell(user.uid);
    }

    watchMessagesBadge(user.uid);
    watchCommunityBadge(user.uid);
    watchStatusBadge(user.uid);


    if (currentPage === "community.html") {
        setDoc(doc(db, "users", user.uid), { lastSeenCommunityAt: new Date() }, { merge: true }).catch(() => {});
    }
    if (currentPage === "status.html") {
        setDoc(doc(db, "users", user.uid), { lastSeenStatusAt: new Date() }, { merge: true }).catch(() => {});
    }
});


function watchNotificationBell(uid) {
    const bell = document.getElementById("notifBell");
    const badge = document.getElementById("notifCount");
    if (!bell && !badge) return; 

    const notifQuery = query(collection(db, "users", uid, "notifications"), where("read", "==", false));
    onSnapshot(notifQuery, (snap) => {
        if (!badge) return;
        if (snap.size > 0) {
            badge.textContent = snap.size > 9 ? "9+" : String(snap.size);
            badge.style.display = "flex";
        } else {
            badge.style.display = "none";
        }
    }, (err) => console.error("shared-nav: erreur badge notifications", err));
}


function watchMessagesBadge(uid) {
    const badge = document.getElementById("navBadgeMessages");
    if (!badge) return;

    const convQuery = query(collection(db, "conversations"), where("members", "array-contains", uid));
    onSnapshot(convQuery, (snap) => {
        let count = 0;
        snap.forEach((d) => {
            const unreadBy = d.data().unreadBy || [];
            if (unreadBy.includes(uid)) count++;
        });
        updateBadge(badge, count);
    }, (err) => console.error("shared-nav: erreur badge messages", err));
}


function watchCommunityBadge(uid) {
    const badge = document.getElementById("navBadgeCommunity");
    if (!badge) return;

    getLastSeen(uid, "lastSeenCommunityAt").then((lastSeen) => {
        onSnapshot(collection(db, "posts"), (snap) => {
            let count = 0;
            snap.forEach((d) => {
                const data = d.data();
                if (data.userId === uid) return; // pa konte pwòp pòs pa m
                const createdMs = data.createdAt?.toMillis ? data.createdAt.toMillis() : 0;
                if (createdMs > lastSeen) count++;
            });
            updateBadge(badge, count);
        }, (err) => console.error("shared-nav: erreur badge communauté", err));
    });
}


function watchStatusBadge(uid) {
    const badge = document.getElementById("navBadgeStatus");
    if (!badge) return;

    getLastSeen(uid, "lastSeenStatusAt").then((lastSeen) => {
        onSnapshot(collection(db, "statuses"), (snap) => {
            let count = 0;
            snap.forEach((d) => {
                const data = d.data();
                if (data.userId === uid) return;
                const createdMs = data.createdAt?.toMillis ? data.createdAt.toMillis() : 0;
                if (createdMs > lastSeen) count++;
            });
            updateBadge(badge, count);
        }, (err) => console.error("shared-nav: erreur badge statut", err));
    });
}


async function getLastSeen(uid, field) {
    try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists() && snap.data()[field]?.toMillis) {
            return snap.data()[field].toMillis();
        }
    } catch (e) { 
        
       
    }
    return 0;
}

function updateBadge(el, count) {
    if (count > 0) {
        el.textContent = count > 9 ? "9+" : String(count);
        el.style.display = "flex";
    } else {
        el.style.display = "none";
    }
}
