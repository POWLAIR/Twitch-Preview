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
export async function getFollowedChannels(token, first = 100) {
    const data = await twitchApiRequest(`/channels/followed?first=${first}`, 'GET', token);
    return {
        total: data?.total || data?.data?.length || 0,
        channels: data?.data?.map(channel => ({
            broadcaster_id: channel.broadcaster_id,
            broadcaster_login: channel.broadcaster_login,
            broadcaster_name: channel.broadcaster_name,
            game_id: channel.game_id,
            game_name: channel.game_name,
            title: channel.title,
            tags: channel.tags || []
        })) || []
    };
}

// Récupère la liste des streams en direct des chaînes suivies
export async function getFollowedStreams(token, first = 100) {
    const data = await twitchApiRequest(`/streams/followed?first=${first}`, 'GET', token);
    return {
        streams: data?.data?.map(stream => ({
            id: stream.id,
            user_id: stream.user_id,
            user_login: stream.user_login,
            user_name: stream.user_name,
            game_id: stream.game_id,
            game_name: stream.game_name,
            title: stream.title,
            viewer_count: stream.viewer_count,
            started_at: stream.started_at,
            language: stream.language,
            thumbnail_url: stream.thumbnail_url?.replace('{width}x{height}', '440x248'),
            tags: stream.tags || [],
            is_mature: stream.is_mature
        })) || []
    };
} 