const messageElement = document.getElementById('message');
const spinnerElement = document.getElementById('spinner');

// Configuration de la fenêtre popup
const POPUP_CONFIG = {
    width: 600,
    height: 400,
    left: window.screen.width / 2 - 300,
    top: window.screen.height / 2 - 200
};

function updateUI(message, type = 'info') {
    spinnerElement.classList.toggle('hidden', type !== 'info');
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
}

function openPopup(url) {
    const features = [
        `width=${POPUP_CONFIG.width}`,
        `height=${POPUP_CONFIG.height}`,
        `left=${POPUP_CONFIG.left}`,
        `top=${POPUP_CONFIG.top}`,
        'resizable=yes',
        'scrollbars=yes',
        'status=yes'
    ].join(',');

    return window.open(url, 'twitch_preview_auth', features);
}

function showPopupError() {
    spinnerElement.classList.add('hidden');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const popupHelp = document.getElementById('popup-help');

    errorContainer.classList.remove('hidden');
    errorMessage.textContent = 'Erreur : impossible d\'ouvrir l\'extension. Veuillez autoriser les popups.';
    popupHelp.classList.remove('hidden');
}

async function handleAuth() {
    try {
        // Récupère les paramètres depuis le hash de l'URL
        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get('access_token');
        const error = params.get('error');
        const errorDescription = params.get('error_description');
        const state = params.get('state');

        if (error) {
            updateUI(`Erreur d'authentification: ${error}${errorDescription ? ` - ${errorDescription}` : ''}`, 'error');
            return;
        }

        if (!accessToken) {
            updateUI('Aucun token d\'accès reçu', 'error');
            return;
        }

        if (!state) {
            updateUI('Paramètre state manquant', 'error');
            return;
        }

        // Décode le state pour obtenir l'UUID de l'extension et le CSRF
        let stateObj;
        try {
            stateObj = JSON.parse(atob(state));
        } catch (e) {
            updateUI('Format du state invalide', 'error');
            return;
        }

        if (!stateObj.extensionId) {
            updateUI('UUID de l\'extension manquant dans le state', 'error');
            return;
        }

        // Redirige vers l'extension avec le token
        updateUI('Authentification réussie ! Redirection...', 'success');

        // Crée l'URL de l'extension
        const extensionUrl = `moz-extension://${stateObj.extensionId}/src/auth/auth.html#access_token=${accessToken}`;

        // Ouvre l'URL dans une popup
        const popup = openPopup(extensionUrl);

        if (!popup) {
            showPopupError();
            return;
        }

        // Ferme cette fenêtre après un court délai
        setTimeout(() => {
            window.close();
        }, 2000);

    } catch (error) {
        console.error('Erreur:', error);
        updateUI('Une erreur est survenue lors de l\'authentification', 'error');
    }
}

// Ajouter la gestion du bouton de réessai
document.getElementById('retryButton')?.addEventListener('click', () => {
    // Réinitialiser l'UI
    const errorContainer = document.getElementById('error-container');
    errorContainer.classList.add('hidden');
    spinnerElement.classList.remove('hidden');
    messageElement.textContent = 'Traitement de l\'authentification...';

    // Relancer l'authentification
    handleAuth();
});

document.addEventListener('DOMContentLoaded', handleAuth); 