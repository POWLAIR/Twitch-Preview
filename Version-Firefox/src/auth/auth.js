// Éléments DOM
const messageElement = document.getElementById('message');
const errorElement = document.getElementById('error');

// Fonction principale
async function handleAuth() {
    try {
        // Récupère le token depuis le hash de l'URL
        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get('access_token');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
            showError(`Erreur d'authentification: ${error}${errorDescription ? ` - ${errorDescription}` : ''}`);
            return;
        }

        if (!accessToken) {
            showError("Aucun token d'accès reçu");
            return;
        }

        // Envoie le token au background script
        const response = await browser.runtime.sendMessage({
            type: 'SAVE_TOKEN',
            token: accessToken
        });

        if (response.success) {
            messageElement.textContent = 'Authentification réussie !';
            setTimeout(() => window.close(), 10);
        } else {
            throw new Error(response.error || "Erreur lors de l'enregistrement du token");
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError(error.message);
    }
}

// Affiche un message d'erreur
function showError(message) {
    messageElement.style.display = 'none';
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Lance le processus d'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', handleAuth);

// Écoute les messages de la page de redirection OAuth
window.addEventListener('message', async (event) => {
    // Vérifie que le message vient de la page de redirection Vercel
    if (!event.origin.startsWith('https://twitch-preview.vercel.app')) {
        console.error('Origine non autorisée:', event.origin);
        return;
    }

    // Vérifie le type de message
    if (event.data.type === 'TWITCH_AUTH_SUCCESS') {
        try {
            // Envoie le token au background script
            const response = await browser.runtime.sendMessage({
                type: 'SAVE_TOKEN',
                token: event.data.token
            });

            if (response.success) {
                // Ferme la fenêtre d'authentification
                window.close();
            } else {
                throw new Error(response.error || "Erreur lors de l'enregistrement du token");
            }
        } catch (error) {
            console.error('Erreur lors du traitement du token:', error);
        }
    }
}); 