const TWITCH_API = {
    CLIENT_ID: 'YOUR_CLIENT_ID',
    CLIENT_SECRET: 'YOUR_CLIENT_SECRET',
    AUTH_URL: 'https://id.twitch.tv/oauth2/token',
    API_URL: 'https://api.twitch.tv/helix'
};

// Vérifie et rafraîchit le token si nécessaire
async function checkAndRefreshToken() {
    try {
        const storage = await browser.storage.local.get('twitchToken');
        const token = storage.twitchToken;

        if (!token || isTokenExpired(token)) {
            return await getNewToken();
        }

        return token.access_token;
    } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        return null;
    }
}

// Obtient un nouveau token d'accès
async function getNewToken() {
    try {
        const response = await fetch(TWITCH_API.AUTH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: TWITCH_API.CLIENT_ID,
                client_secret: TWITCH_API.CLIENT_SECRET,
                grant_type: 'client_credentials'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const tokenData = {
            access_token: data.access_token,
            expires_at: Date.now() + (data.expires_in * 1000)
        };

        await browser.storage.local.set({ twitchToken: tokenData });
        return data.access_token;
    } catch (error) {
        console.error('Erreur lors de l\'obtention du token:', error);
        return null;
    }
}

// Vérifie si le token est expiré
function isTokenExpired(token) {
    return Date.now() >= token.expires_at;
}

// Effectue une requête à l'API Twitch
async function twitchApiRequest(endpoint, method = 'GET') {
    try {
        const token = await checkAndRefreshToken();
        if (!token) throw new Error('Pas de token valide');

        const response = await fetch(`${TWITCH_API.API_URL}${endpoint}`, {
            method: method,
            headers: {
                'Client-ID': TWITCH_API.CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la requête API:', error);
        return null;
    }
}

// Récupère la liste des streams en direct
async function getLiveStreams(userIds) {
    if (!userIds || userIds.length === 0) return [];
    
    const queryString = userIds.map(id => `user_id=${id}`).join('&');
    return await twitchApiRequest(`/streams?${queryString}`);
}

// Écoute les messages du popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_LIVE_STREAMS') {
        getLiveStreams(request.userIds)
            .then(data => sendResponse(data))
            .catch(error => sendResponse({ error: error.message }));
        return true; // Indique que la réponse sera envoyée de manière asynchrone
    }
}); 