
const ONESIGNAL_APP_ID = "598bd958-5b76-41b9-8d72-a84ffe1cf92b";

function initOneSignal(userId) {
    if (!('Notification' in window)) {
        console.log("Ce navigateur ne supporte pas les notifications.");
        return;
    }

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal) {
        try {

            await OneSignal.login(userId);


            const hasPermission = await OneSignal.Notifications.permission;
            if (!hasPermission) {
                await OneSignal.Notifications.requestPermission();
            }
        } catch (error) {
            console.error("Erreur initOneSignal :", error);
        }
    });
}


async function sendOneSignalNotification(receiverId, title, body, link = '/') {
    try {
        const response = await fetch('/.netlify/functions/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiverId, title, body, link })
        });
        const data = await response.json();
        if (!response.ok) {
            console.error("Erreur envoi notification :", data);
        }
    } catch (error) {
        console.error("Erreur lors de l'envoi de la notification :", error);
    }
}

window.initOneSignal = initOneSignal;
window.sendOneSignalNotification = sendOneSignalNotification;