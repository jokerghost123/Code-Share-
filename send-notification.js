
const ONESIGNAL_APP_ID = "598bd958-5b76-41b9-8d72-a84ffe1cf92b";

exports.handler = async function (event) {

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Méthode non autorisée, utilise POST." })
        };
    }

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
        
        const response = await fetch("https://api.onesignal.com/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Key " + REST_API_KEY
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
        
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
