function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return "";
    let formatted = phoneNumber.toString().trim();
    if (!formatted.startsWith("+")) {
        formatted = "+91" + formatted.replace(/^0/, "");
    }
    return formatted;
}

async function sendSMS(phoneNumber, messageText) {
    if (!phoneNumber) return { success: false, message: "No phone number provided" };

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const username = process.env.SMSGATE_USERNAME;
    const password = process.env.SMSGATE_PASSWORD;

    if (!username || !password) {
        console.log(`[SMS-MOCK] To: ${formattedPhone} | Message: ${messageText}`);
        return { success: true, mock: true };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const credentials = Buffer.from(`${username}:${password}`).toString("base64");

        const response = await fetch("https://api.sms-gate.app/3rdparty/v1/message", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${credentials}`,
            },
            body: JSON.stringify({
                textMessage: { text: messageText },
                phoneNumbers: [formattedPhone],
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const status = response.status;
            // Handle HTML error pages gracefully without dumping full HTML
            if (status === 520 || status === 502 || status === 503 || status === 504) {
                console.warn(`[SMS Gate Unavailable] Server returned status ${status}. Skipping SMS delivery.`);
            } else {
                const errText = await response.text();
                console.warn(`[SMS Warning] Failed with status ${status}:`, errText.slice(0, 150));
            }
            return { success: false, status };
        }

        const data = await response.json();
        return { success: true, data };
    } 
    
    catch (e) {
        clearTimeout(timeoutId);
        if (e.name === "AbortError") {
            console.warn(`[SMS Timeout] SMS Gateway took longer than 5 seconds. Request aborted.`);
        } else {
            console.warn(`[SMS Error] Failed to trigger SMS: ${e.message}`);
        }
        return { success: false, error: e.message };
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1)); // e.g. 2.4 km
}

module.exports = { sendSMS, calculateDistance, formatPhoneNumber };