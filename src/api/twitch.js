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
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Erreur API Twitch: ${errorData.message || response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la requête API:', error);
        throw error;
    }
}

// Récupère l'utilisateur courant
export async function getCurrentUser(token) {
    const data = await twitchApiRequest('/users', 'GET', token);
    return data?.data?.[0];
}

// Récupère les détails des utilisateurs par leurs IDs
export async function getUsers(token, userIds) {
    if (!userIds || userIds.length === 0) {
        throw new Error('Au moins un ID utilisateur est requis');
    }

    // L'API accepte jusqu'à 100 IDs à la fois
    const params = new URLSearchParams();
    userIds.slice(0, 100).forEach(id => params.append('id', id));

    const data = await twitchApiRequest(`/users?${params}`, 'GET', token);
    return {
        users: data?.data?.map(user => ({
            id: user.id,
            login: user.login,
            display_name: user.display_name,
            profile_image_url: user.profile_image_url,
            offline_image_url: user.offline_image_url,
            broadcaster_type: user.broadcaster_type,
            description: user.description,
            created_at: user.created_at
        })) || []
    };
}

// Récupère la liste des chaînes suivies
export async function getFollowedChannels(token, userId, first = 100) {
    if (!userId) {
        throw new Error('ID utilisateur requis');
    }

    const params = new URLSearchParams({
        user_id: userId,
        first: first.toString()
    });

    const data = await twitchApiRequest(`/channels/followed?${params}`, 'GET', token);

    // Récupérer les détails des broadcasters
    const broadcasterIds = data?.data?.map(channel => channel.broadcaster_id) || [];
    const broadcastersDetails = broadcasterIds.length > 0
        ? await getUsers(token, broadcasterIds)
        : { users: [] };

    // Fusionner les informations
    const channels = data?.data?.map(channel => {
        const broadcasterDetails = broadcastersDetails.users.find(
            user => user.id === channel.broadcaster_id
        ) || {};

        return {
            broadcaster_id: channel.broadcaster_id,
            broadcaster_login: channel.broadcaster_login,
            broadcaster_name: channel.broadcaster_name,
            display_name: broadcasterDetails.display_name,
            profile_image_url: broadcasterDetails.profile_image_url,
            offline_image_url: broadcasterDetails.offline_image_url,
            broadcaster_type: broadcasterDetails.broadcaster_type,
            description: broadcasterDetails.description,
            followed_at: channel.followed_at
        };
    }) || [];

    return {
        total: data?.total || 0,
        channels: channels,
        pagination: data?.pagination || {}
    };
}

// Récupère la liste des streams en direct des chaînes suivies
export async function getFollowedStreams(token, userId, first = 100) {
    if (!userId) {
        throw new Error('ID utilisateur requis');
    }

    const params = new URLSearchParams({
        user_id: userId,
        first: first.toString()
    });

    const data = await twitchApiRequest(`/streams/followed?${params}`, 'GET', token);

    // Récupérer les détails des streamers
    const streamerIds = data?.data?.map(stream => stream.user_id) || [];
    const streamersDetails = streamerIds.length > 0
        ? await getUsers(token, streamerIds)
        : { users: [] };

    // Fusionner les informations
    const streams = data?.data?.map(stream => {
        const streamerDetails = streamersDetails.users.find(
            user => user.id === stream.user_id
        ) || {};

        return {
            id: stream.id,
            user_id: stream.user_id,
            user_login: stream.user_login,
            user_name: stream.user_name,
            display_name: streamerDetails.display_name,
            profile_image_url: streamerDetails.profile_image_url,
            offline_image_url: streamerDetails.offline_image_url,
            broadcaster_type: streamerDetails.broadcaster_type,
            description: streamerDetails.description,
            game_id: stream.game_id,
            game_name: stream.game_name,
            title: stream.title,
            viewer_count: stream.viewer_count,
            started_at: stream.started_at,
            language: stream.language,
            thumbnail_url: stream.thumbnail_url?.replace('{width}x{height}', '440x248'),
            tags: stream.tags || [],
            is_mature: stream.is_mature
        };
    }) || [];

    return { streams };
}

// Se désabonner d'une chaîne
export async function unfollowChannel(token, userId, broadcasterId) {
    if (!userId || !broadcasterId) {
        throw new Error('ID utilisateur et ID broadcaster requis');
    }

    const params = new URLSearchParams({
        user_id: userId,
        broadcaster_id: broadcasterId
    });

    await twitchApiRequest(`/users/follows?${params}`, 'DELETE', token);
    return { success: true };
} 