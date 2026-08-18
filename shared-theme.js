//zoulou ak joker selman 
//nou gen kek modifikasyon pou feh sou page sa pou byen jere terme lan 

import { getApps, getApp, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

function applyTheme(theme) {
    if (theme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
    } else {
        document.documentElement.removeAttribute("data-theme");
    }
    try { localStorage.setItem("theme", theme); } catch (e) {}

    const toggle = document.getElementById("themeToggle");
    if (toggle) toggle.checked = (theme === "light");
    const label = document.getElementById("themeLabel");
    if (label) label.textContent = (theme === "light") ? "Clair" : "Sombre";
}


window.toggleTheme = function () {
    const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    if (auth.currentUser) {
        setDoc(doc(db, "users", auth.currentUser.uid), { themePref: next }, { merge: true }).catch(() => {});
    }
};


onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const pref = snap.exists() ? snap.data().themePref : null;
        if (pref === "light" || pref === "dark") {
            applyTheme(pref);
        }
    } catch (e) {}
});
