
import { getApps, getApp, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { translations } from "./translations.js";

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

const SUPPORTED = ["fr", "en", "ht"];
let currentLang = "fr";


export function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || translations.fr[key] || key;
}
window.t = t;

function applyTranslations(lang) {
    if (!SUPPORTED.includes(lang)) lang = "fr";
    currentLang = lang;
    document.documentElement.setAttribute("lang", lang === "ht" ? "ht" : lang);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        el.setAttribute("placeholder", t(key));
    });

    try { localStorage.setItem("lang", lang); } catch (e) {}

    document.querySelectorAll("[data-lang-option]").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-lang-option") === lang);
    });


    const themeLabel = document.getElementById("themeLabel");
    if (themeLabel) {
        const isLight = document.documentElement.getAttribute("data-theme") === "light";
        themeLabel.textContent = isLight ? t("settings.theme.light") : t("settings.theme.dark");
    }
}

window.setLanguage = function (lang) {
    applyTranslations(lang);
    if (auth.currentUser) {
        setDoc(doc(db, "users", auth.currentUser.uid), { langPref: lang }, { merge: true }).catch(() => {});
    }
};


let initialLang = "fr";
try { initialLang = localStorage.getItem("lang") || "fr"; } catch (e) {}
applyTranslations(initialLang);


onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const pref = snap.exists() ? snap.data().langPref : null;
        if (pref && SUPPORTED.includes(pref)) {
            applyTranslations(pref);
        }
    } catch (e) {}
});
