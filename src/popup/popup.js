import { TWITCH_API } from '../api/config.js';
import { CACHE } from '../utils/constants.js';
import { formatViewerCount, formatStreamDuration } from '../utils/formatters.js';

let cachedStreams = null;
let cachedUserData = null;
let lastRefreshTime = 0;

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
    streamItemTemplate: document.getElementById('streamItemTemplate')
};

// Event Listeners
elements.refreshButton.addEventListener('click', () => {
    refreshStreams(true);
});

elements.loginButton.addEventListener('click', () => {
    browser.runtime.sendMessage({ type: 'INITIATE_AUTH' });
});

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

        // Trier par date de suivi (les plus récents en premier)
        streams.sort((a, b) => {
            if (!a.followed_at || !b.followed_at) return 0;
            return new Date(b.followed_at) - new Date(a.followed_at);
        });

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
    
    if (!streams || streams.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'Aucun stream en direct pour le moment';
        elements.streamList.appendChild(emptyMessage);
        return;
    }

    streams.forEach((stream, index) => {
        const streamElement = createStreamElement(stream);
        streamElement.style.animationDelay = `${index * 50}ms`;
        elements.streamList.appendChild(streamElement);
    });
}

// Create stream element
function createStreamElement(stream) {
    const template = elements.streamItemTemplate.content.cloneNode(true);
    const streamItem = template.querySelector('.stream-item');

    // Mise à jour de la miniature avec la bonne taille
    const thumbnail = streamItem.querySelector('.stream-thumbnail');
    if (thumbnail) {
        thumbnail.src = stream.thumbnail_url;
        thumbnail.alt = `${stream.title} thumbnail`;
    }

    // Informations du streamer
    const streamerInfo = streamItem.querySelector('.streamer-info');
    if (streamerInfo) {
        streamerInfo.querySelector('.streamer-name').textContent = stream.user_name;
        streamerInfo.querySelector('.stream-title').textContent = stream.title;
        streamerInfo.querySelector('.game-name').textContent = stream.game_name || 'Pas de jeu';
    }

    // Statistiques du stream
    const streamStats = streamItem.querySelector('.stream-stats');
    if (streamStats) {
        streamStats.querySelector('.viewer-count').textContent = formatViewerCount(stream.viewer_count);
        streamStats.querySelector('.stream-duration').textContent = formatStreamDuration(stream.started_at);
    }

    // Tags du stream
    const tagsContainer = streamItem.querySelector('.stream-tags');
    if (tagsContainer && stream.tags && stream.tags.length > 0) {
        stream.tags.slice(0, 3).forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });
    }

    // Ajout du lien vers le stream
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

// Initialize the popup when the document is loaded
document.addEventListener('DOMContentLoaded', initializePopup); 