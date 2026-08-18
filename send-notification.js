// netlify/functions/send-notification.js
//
// Cette fonction tourne sur le SERVEUR de Netlify, jamais dans le
// navigateur du visiteur — c'est pour ça qu'on peut y mettre la clé
// secrète OneSignal (REST API Key) sans risque qu'elle soit visible
// par un visiteur qui inspecterait le code source.
//
// Le client (onesignal-config.js) l'appelle avec :
//   fetch('/.netlify/functions/send-notification', {
//     method: 'POST',
//     body: JSON.stringify({ receiverId, title, body, link })
//   })
//
// Elle transmet ça à l'API OneSignal, qui pousse la notification
// sur le téléphone de l'utilisateur ciblé (receiverId = le uid
// Firebase, utilisé comme "external_id" côté OneSignal grâce à
// OneSignal.login(userId) appelé dans initOneSignal()).

const ONESIGNAL_APP_ID = "598bd958-5b76-41b9-8d72-a84ffe1cf92b";

exports.handler = async function (event) {
    // On n'accepte que du POST — tout le reste (comme le test GET
    // que tu as fait dans le navigateur) reçoit une réponse claire
    // au lieu d'un 404 muet.
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Méthode non autorisée, utilise POST." })
        };
    }

    // La clé secrète NE DOIT JAMAIS être écrite ici en dur. Elle doit
    // être configurée dans Netlify : Site settings → Environment
    // variables → ajouter ONESIGNAL_REST_API_KEY (valeur trouvable
    // dans OneSignal : Settings → Keys & IDs → REST API Key).
    const REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
    if (!REST_API_KEY) {
        console.error("ONESIGNAL_REST_API_KEY manquante dans les variables d'environnement Netlify.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Configuration serveur incomplète (clé OneSignal manquante)." })
        };
    }

    let payload;
    try {
        payload = JSON.parse(event.body || "{}");
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Corps de requête JSON invalide." })
        };
    }

    const { receiverId, title, body, link } = payload;
    if (!receiverId || !body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "receiverId et body sont obligatoires." })
        };
    }

    try {
        // OneSignal a remplacé son ancien système de clé ("Legacy API Key",
        // en cours de désactivation) par un nouveau système de clés "rich".
        // Ça change DEUX choses : l'URL de l'API, et le format de
        // l'en-tête d'autorisation ("Key ..." au lieu de "Basic ...").
        const response = await fetch("https://api.onesignal.com/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Key " + REST_API_KEY
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
                // Cible l'utilisateur via son external_id (le uid Firebase,
                // rattaché côté client par OneSignal.login(userId)).
                include_aliases: { external_id: [String(receiverId)] },
                target_channel: "push",
                headings: { en: title || "Code-Share", fr: title || "Code-Share" },
                contents: { en: body, fr: body },
                web_url: link
                    ? (link.startsWith("http") ? link : "https://" + event.headers.host + link)
                    : undefined
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Erreur API OneSignal :", data);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "Échec de l'envoi OneSignal", details: data })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, result: data })
        };
    } catch (error) {
        console.error("Erreur lors de l'appel à OneSignal :", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Erreur serveur lors de l'envoi." })
        };
    }
};
