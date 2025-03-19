import { ENV } from '../utils/env.js';
import { TWITCH_API } from '../api/config.js';

// Elements DOM
const elements = {
    authStatus: document.getElementById('auth-status'),
    statusIndicator: document.querySelector('.status-indicator'),
    statusText: document.getElementById('status-text'),
    userInfo: document.getElementById('user-info'),
    userAvatar: document.getElementById('user-avatar'),
    userName: document.getElementById('user-name'),
    loginSection: document.getElementById('login-section'),
    loginButton: document.getElementById('login-btn'),
    logoutButton: document.getElementById('logout-btn'),
    redirectUrl: document.getElementById('redirect-url'),
    copyUrlButton: document.getElementById('copy-url'),
    enableNotifications: document.getElementById('enable-notifications'),
    openPopup: document.getElementById('open-popup'),
    saveButton: document.getElementById('save-btn'),
    saveStatus: document.getElementById('save-status')
};

// Configuration initiale
function init() {
    // Afficher l'URL de redirection
    const redirectUrl = browser.runtime.getURL('src/auth/auth.html');
    elements.redirectUrl.value = redirectUrl;

    // Charger les paramètres sauvegardés
    loadSettings();

    // Vérifier l'état de l'authentification
    checkAuthStatus();

    // Ajouter les écouteurs d'événements
    setupEventListeners();
}

// Charger les paramètres
async function loadSettings() {
    const settings = await browser.storage.local.get({
        enableNotifications: true,
        openPopup: true
    });

    elements.enableNotifications.checked = settings.enableNotifications;
    elements.openPopup.checked = settings.openPopup;
}

// Sauvegarder les paramètres
async function saveSettings() {
    const settings = {
        enableNotifications: elements.enableNotifications.checked,
        openPopup: elements.openPopup.checked
    };

    await browser.storage.local.set(settings);
    showSaveStatus();
}

// Vérifier l'état de l'authentification
async function checkAuthStatus() {
    try {
        const response = await browser.runtime.sendMessage({ type: 'CHECK_AUTH' });
        
        if (response.isAuthenticated) {
            const userData = await browser.runtime.sendMessage({ type: 'GET_USER_DATA' });
            showAuthenticatedState(userData);
        } else {
            showUnauthenticatedState();
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        showError();
    }
}

// Afficher l'état authentifié
function showAuthenticatedState(userData) {
    elements.statusIndicator.classList.add('connected');
    elements.statusText.textContent = 'Connecté à Twitch';
    elements.userInfo.classList.remove('hidden');
    elements.loginSection.classList.add('hidden');

    elements.userAvatar.src = userData.profile_image_url;
    elements.userName.textContent = userData.display_name;
}

// Afficher l'état non authentifié
function showUnauthenticatedState() {
    elements.statusIndicator.classList.add('disconnected');
    elements.statusText.textContent = 'Non connecté';
    elements.userInfo.classList.add('hidden');
    elements.loginSection.classList.remove('hidden');
}

// Afficher une erreur
function showError() {
    elements.statusIndicator.classList.add('disconnected');
    elements.statusText.textContent = 'Erreur de connexion';
    elements.userInfo.classList.add('hidden');
    elements.loginSection.classList.remove('hidden');
}

// Initialiser l'authentification
function initiateAuth() {
    browser.runtime.sendMessage({ type: 'INITIATE_AUTH' });
}

// Se déconnecter
async function logout() {
    try {
        await browser.runtime.sendMessage({ type: 'LOGOUT' });
        showUnauthenticatedState();
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    }
}

// Copier l'URL de redirection
async function copyRedirectUrl() {
    try {
        await navigator.clipboard.writeText(elements.redirectUrl.value);
        elements.copyUrlButton.textContent = 'Copié !';
        setTimeout(() => {
            elements.copyUrlButton.textContent = 'Copier l\'URL';
        }, 2000);
    } catch (error) {
        console.error('Erreur lors de la copie:', error);
    }
}

// Afficher le statut de sauvegarde
function showSaveStatus() {
    elements.saveStatus.classList.remove('hidden');
    setTimeout(() => {
        elements.saveStatus.classList.add('hidden');
    }, 2000);
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    elements.loginButton.addEventListener('click', initiateAuth);
    elements.logoutButton.addEventListener('click', logout);
    elements.copyUrlButton.addEventListener('click', copyRedirectUrl);
    elements.saveButton.addEventListener('click', saveSettings);
}

// Initialiser la page
document.addEventListener('DOMContentLoaded', init); 