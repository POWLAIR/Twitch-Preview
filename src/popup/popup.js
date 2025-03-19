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
        const response = await browser.runtime.sendMessage({ type: 'GET_FOLLOWED_STREAMS' });
        if (response.success) {
            cachedStreams = response.streams;
            lastRefreshTime = Date.now();
            displayStreams(response.streams);
        } else {
            throw new Error(response.error || 'Impossible de charger les streams');
        }
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

    const avatar = streamItem.querySelector('.streamer-avatar');
    avatar.src = stream.user_profile_image;
    avatar.alt = `${stream.user_name} avatar`;

    streamItem.querySelector('.streamer-name').textContent = stream.user_name;
    streamItem.querySelector('.game-name').textContent = stream.game_name;
    streamItem.querySelector('.viewer-count .count').textContent = formatViewerCount(stream.viewer_count);
    streamItem.querySelector('.stream-duration .duration').textContent = formatStreamDuration(stream.started_at);

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