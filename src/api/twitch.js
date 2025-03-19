import { TWITCH_API } from './config.js';

// Effectue une requête à l'API Twitch
export async function twitchApiRequest(endpoint, method = 'GET', token) {
    try {
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

// Récupère l'utilisateur courant
export async function getCurrentUser(token) {
    const data = await twitchApiRequest('/users', 'GET', token);
    return data?.data?.[0];
}

// Récupère la liste des chaînes suivies
export async function getFollowedChannels(userId, token) {
    const data = await twitchApiRequest(`/users/follows?from_id=${userId}`, 'GET', token);
    return data?.data || [];
}

// Récupère la liste des streams en direct
export async function getLiveStreams(userIds, token) {
    if (!userIds || userIds.length === 0) return [];
    
    const queryString = userIds.map(id => `user_id=${id}`).join('&');
    return await twitchApiRequest(`/streams?${queryString}`, 'GET', token);
} 