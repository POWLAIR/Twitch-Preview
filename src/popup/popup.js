import { TWITCH_API } from '../api/config.js';
import { CACHE } from '../utils/constants.js';
import { formatViewerCount, formatStreamDuration } from '../utils/formatters.js';

let cachedStreams = null;
let cachedUserData = null;
let lastRefreshTime = 0;
let cachedFavorites = null;

// DOM Elements
const elements = {
    userInfo: document.getElementById('userInfo'),
    userAvatar: document.getElementById('userAvatar'),
    userName: document.getElementById('userName'),
    loginPrompt: document.getElementById('loginPrompt'),
    loginButton: document.getElementById('loginButton'),
    refreshButton: document.getElementById('refreshButton'),
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('errorMessage'),
    streamList: document.getElementById('streamList'),
    streamItemTemplate: document.getElementById('streamItemTemplate'),
    liveTab: document.getElementById('liveTab'),
    channelsTab: document.getElementById('channelsTab'),
    liveContent: document.getElementById('liveContent'),
    channelsContent: document.getElementById('channelsContent'),
    channelsList: document.getElementById('channelsList')
};

// Event Listeners
elements.refreshButton.addEventListener('click', () => {
    refreshStreams(true);
});

elements.loginButton.addEventListener('click', () => {
    browser.runtime.sendMessage({ type: 'INITIATE_AUTH' });
});

// Ajouter les gestionnaires d'événements pour les onglets
elements.liveTab.addEventListener('click', () => switchTab('live'));
elements.channelsTab.addEventListener('click', () => switchTab('channels'));

// Initialize popup
async function initializePopup() {
    showLoading();
    try {
        const isAuthenticated = await checkAuthentication();
        if (!isAuthenticated) {
            showLoginPrompt();
            return;
        }
        await loadUserData();
        await refreshStreams();
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Authentication check
async function checkAuthentication() {
    try {
        const response = await browser.runtime.sendMessage({ type: 'CHECK_AUTH' });
        return response.isAuthenticated;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

// Load user data
async function loadUserData() {
    if (cachedUserData && Date.now() - cachedUserData.timestamp < CACHE.USER_DATA_REFRESH_INTERVAL) {
        updateUserInfo(cachedUserData.data);
        return;
    }

    try {
        const response = await browser.runtime.sendMessage({ type: 'GET_USER_DATA' });
        if (response.success) {
            cachedUserData = {
                data: response.userData,
                timestamp: Date.now()
            };
            updateUserInfo(response.userData);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        throw new Error('Impossible de charger les données utilisateur');
    }
}

// Refresh streams
async function refreshStreams(forceRefresh = false) {
    if (!forceRefresh && cachedStreams && Date.now() - lastRefreshTime < CACHE.STREAMS_REFRESH_INTERVAL) {
        displayStreams(cachedStreams);
        return;
    }

    showLoading();
    hideError();

    try {
        // D'abord, récupérer les chaînes suivies
        const channelsResponse = await browser.runtime.sendMessage({ 
            type: 'GET_FOLLOWED_CHANNELS',
            first: 100
        });

        if (!channelsResponse.success) {
            throw new Error(channelsResponse.error || 'Impossible de charger les chaînes suivies');
        }

        // Ensuite, récupérer les streams en direct
        const streamsResponse = await browser.runtime.sendMessage({ 
            type: 'GET_FOLLOWED_STREAMS',
            first: 100
        });

        if (!streamsResponse.success) {
            throw new Error(streamsResponse.error || 'Impossible de charger les streams');
        }

        // Fusionner les informations des chaînes et des streams
        const streams = streamsResponse.streams.map(stream => {
            const channel = channelsResponse.channels.find(
                c => c.broadcaster_id === stream.user_id
            );
            return {
                ...stream,
                followed_at: channel?.followed_at
            };
        });

        // Trier par nombre de viewers (ordre décroissant)
        streams.sort((a, b) => b.viewer_count - a.viewer_count);

        cachedStreams = streams;
        lastRefreshTime = Date.now();
        displayStreams(streams);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Display streams
function displayStreams(streams) {
    elements.streamList.innerHTML = '';
    
    // Mettre à jour le badge avec le nombre de streams
    updateBadgeCount(streams?.length || 0);
    
    if (!streams || streams.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Aucun stream en direct pour le moment';
        elements.streamList.appendChild(emptyMessage);
        return;
    }

    const sortedStreams = sortWithFavorites(streams);
    sortedStreams.forEach((stream, index) => {
        const streamElement = createStreamElement(stream);
        streamElement.style.animationDelay = `${index * 50}ms`;
        elements.streamList.appendChild(streamElement);
    });
}

// Create stream element
function createStreamElement(stream) {
    const template = elements.streamItemTemplate.content.cloneNode(true);
    const streamItem = template.querySelector('.stream-item');

    // Ajouter le bouton favori
    const favoriteButton = document.createElement('button');
    favoriteButton.className = `favorite-button ${cachedFavorites.has(stream.user_id) ? 'active' : ''}`;
    favoriteButton.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
    `;
    favoriteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(stream.user_id, stream.user_name);
    });
    streamItem.appendChild(favoriteButton);

    // Ajouter l'avatar du streamer
    const streamerAvatar = streamItem.querySelector('.streamer-avatar');
    if (streamerAvatar) {
        streamerAvatar.src = stream.profile_image_url || 'path/to/default/avatar.png';
        streamerAvatar.alt = `${stream.user_name} avatar`;
    }

    // Informations du stream
    const streamInfo = streamItem.querySelector('.stream-info');
    if (streamInfo) {
        const streamerName = streamInfo.querySelector('.streamer-name');
        if (streamerName) {
            streamerName.textContent = stream.user_name;
            // Ajouter un badge partenaire si applicable
            if (stream.broadcaster_type === 'partner') {
                const partnerBadge = document.createElement('span');
                partnerBadge.className = 'partner-badge';
                partnerBadge.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8.5 3.5l1.5 1.5v2h2l1.5 1.5L12 10h-2v2L8.5 13.5 7 12v-2H5L3.5 8.5 5 7h2V5l1.5-1.5z"/>
                    </svg>
                `;
                streamerName.appendChild(partnerBadge);
            }
        }

        const gameName = streamInfo.querySelector('.game-name');
        if (gameName) {
            gameName.textContent = stream.game_name || 'Pas de jeu';
        }
    }

    // Statistiques du stream
    const streamStats = streamItem.querySelector('.stream-stats');
    if (streamStats) {
        const viewerCount = streamStats.querySelector('.viewer-count');
        const streamDuration = streamStats.querySelector('.stream-duration');
        
        if (viewerCount) {
            viewerCount.querySelector('.count').textContent = formatViewerCount(stream.viewer_count);
        }
        
        if (streamDuration) {
            streamDuration.querySelector('.duration').textContent = formatStreamDuration(stream.started_at);
        }
    }

    // Ajouter le lien vers le stream
    streamItem.addEventListener('click', () => {
        window.open(`https://twitch.tv/${stream.user_login}`, '_blank');
    });

    return streamItem;
}

// UI Helper functions
function updateUserInfo(userData) {
    elements.userAvatar.src = userData.profile_image_url;
    elements.userName.textContent = userData.display_name;
    elements.userInfo.classList.remove('hidden');
    elements.loginPrompt.classList.add('hidden');
    elements.refreshButton.classList.remove('hidden');
}

function showLoginPrompt() {
    elements.loginPrompt.classList.remove('hidden');
    elements.userInfo.classList.add('hidden');
    elements.refreshButton.classList.add('hidden');
}

function showLoading() {
    elements.loading.classList.remove('hidden');
}

function hideLoading() {
    elements.loading.classList.add('hidden');
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.remove('hidden');
}

function hideError() {
    elements.errorMessage.classList.add('hidden');
}

// Modifier la fonction updateBadgeCount
async function updateBadgeCount(count) {
    try {
        if (count > 0) {
            await browser.browserAction.setBadgeText({ text: count.toString() });
            await browser.browserAction.setBadgeBackgroundColor({ color: '#9146FF' }); // Couleur Twitch
        } else {
            await browser.browserAction.setBadgeText({ text: '' }); // Enlève le badge si pas de streams
        }
    } catch (error) {
        console.error('Error updating badge:', error);
    }
}

// Ajouter cette fonction pour gérer la déconnexion
async function handleLogout() {
    showLoading();
    try {
        const response = await browser.runtime.sendMessage({ type: 'LOGOUT' });
        if (response.success) {
            // Réinitialiser les caches locaux
            cachedStreams = null;
            cachedUserData = null;
            lastRefreshTime = 0;
            
            // Réinitialiser le badge
            await updateBadgeCount(0);
            
            // Recharger la popup pour revenir à l'état initial
            window.location.reload();
        } else {
            throw new Error(response.error || 'Erreur inconnue lors de la déconnexion');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Ajouter cette fonction
async function checkExistingAuth() {
    showLoading();
    try {
        const storage = await browser.storage.local.get(['accessToken']);
        if (storage.accessToken) {
            // Vérifie si le token est toujours valide
            const response = await fetch('https://api.twitch.tv/helix/users', {
                headers: {
                    'Authorization': `Bearer ${storage.accessToken}`,
                    'Client-Id': 'YOUR_CLIENT_ID'
                }
            });

            if (response.ok) {
                // Token valide, recharge les données
                await initializePopup();
                return true;
            }
        }
        showError('La session n\'est pas valide. Veuillez vous reconnecter.');
        return false;
    } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        showError('Erreur lors de la vérification de la connexion');
        return false;
    } finally {
        hideLoading();
    }
}

// Fonction pour changer d'onglet
function switchTab(tabName) {
    // Mettre à jour les classes active des boutons
    elements.liveTab.classList.toggle('active', tabName === 'live');
    elements.channelsTab.classList.toggle('active', tabName === 'channels');
    
    // Mettre à jour le contenu visible
    elements.liveContent.classList.toggle('active', tabName === 'live');
    elements.channelsContent.classList.toggle('active', tabName === 'channels');

    // Charger le contenu approprié
    if (tabName === 'channels') {
        loadFollowedChannels();
    } else {
        refreshStreams(true);
    }
}

// Fonction pour charger les chaînes suivies
async function loadFollowedChannels() {
    showLoading();
    try {
        const response = await browser.runtime.sendMessage({ 
            type: 'GET_FOLLOWED_CHANNELS',
            first: 100
        });

        if (!response.success) {
            throw new Error(response.error || 'Impossible de charger les chaînes suivies');
        }

        // Trier les chaînes par ordre alphabétique (en ignorant la casse)
        const sortedChannels = response.channels.sort((a, b) => 
            a.display_name.toLowerCase().localeCompare(b.display_name.toLowerCase())
        );

        displayChannels(sortedChannels);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Fonction pour afficher les chaînes
function displayChannels(channels) {
    elements.channelsList.innerHTML = '';
    
    if (!channels || channels.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Aucune chaîne suivie';
        elements.channelsList.appendChild(emptyMessage);
        return;
    }

    const sortedChannels = sortWithFavorites(channels);
    sortedChannels.forEach((channel, index) => {
        const channelElement = createChannelElement(channel);
        channelElement.style.animationDelay = `${index * 50}ms`;
        elements.channelsList.appendChild(channelElement);
    });
}

// Fonction pour créer un élément de chaîne
function createChannelElement(channel) {
    const channelItem = document.createElement('div');
    channelItem.className = 'channel-item';
    
    // Ajouter le bouton favori
    const favoriteButton = document.createElement('button');
    favoriteButton.className = `favorite-button ${cachedFavorites.has(channel.broadcaster_id) ? 'active' : ''}`;
    favoriteButton.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
    `;
    
    channelItem.innerHTML = `
        <img class="streamer-avatar" src="${channel.profile_image_url}" alt="${channel.display_name}">
        <div class="streamer-name">${channel.display_name}</div>
    `;
    
    channelItem.appendChild(favoriteButton);

    // Gérer les clics séparément
    channelItem.addEventListener('click', () => {
        window.open(`https://twitch.tv/${channel.broadcaster_login}`, '_blank');
    });
    
    favoriteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(channel.broadcaster_id, channel.display_name);
    });

    return channelItem;
}

// Fonction pour gérer les favoris
async function toggleFavorite(channelId, channelName) {
    try {
        if (cachedFavorites.has(channelId)) {
            cachedFavorites.delete(channelId);
        } else {
            cachedFavorites.add(channelId);
        }
        
        await browser.storage.local.set({
            favorites: Array.from(cachedFavorites)
        });
        
        // Rafraîchir l'affichage selon l'onglet actif
        if (elements.liveContent.classList.contains('active')) {
            displayStreams(cachedStreams);
        } else {
            loadFollowedChannels();
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
}

// Modifier les fonctions d'affichage pour trier les favoris en premier
function sortWithFavorites(items) {
    return items.sort((a, b) => {
        const aIsFavorite = cachedFavorites.has(a.user_id || a.broadcaster_id);
        const bIsFavorite = cachedFavorites.has(b.user_id || b.broadcaster_id);
        
        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        return 0;
    });
}

// Ajouter après les imports et avant les variables globales
async function loadFavorites() {
    try {
        const storage = await browser.storage.local.get('favorites');
        cachedFavorites = new Set(storage.favorites || []);
    } catch (error) {
        console.error('Error loading favorites:', error);
        cachedFavorites = new Set();
    }
}

// Initialize the popup when the document is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadFavorites(); // Charger les favoris avant d'initialiser
    initializePopup();
    
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
    document.getElementById('checkAuthButton').addEventListener('click', checkExistingAuth);
}); 