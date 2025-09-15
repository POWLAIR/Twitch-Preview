// Éléments DOM
const messageElement = document.getElementById('message');
const errorElement = document.getElementById('error');

// Fonction principale
async function handleAuth() {
    try {

        // Récupère le token depuis le hash de l'URL
        const hash = window.location.hash;

        // Vérifie si nous avons un hash
        if (!hash || hash.length < 2) {
            console.error('Firefox Auth - Aucun hash trouvé dans l\'URL');
            showError("Aucun paramètre d'authentification trouvé dans l'URL");
            return;
        }

        // Parse les paramètres du hash
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const error = params.get('error');
        const errorDescription = params.get('error_description');


        if (error) {
            console.error('Firefox Auth - Erreur OAuth:', error, errorDescription);
            showError(`Erreur d'authentification: ${error}${errorDescription ? ` - ${errorDescription}` : ''}`);
            return;
        }

        if (!accessToken) {
            console.error('Firefox Auth - Token manquant');
            showError("Aucun token d'accès reçu. Vérifiez que l'authentification s'est correctement déroulée.");
            return;
        }

        // Envoie le token au background script
        const response = await browser.runtime.sendMessage({
            type: 'SAVE_TOKEN',
            token: accessToken
        });

        if (response && response.success) {
            messageElement.textContent = 'Authentification réussie !';
            setTimeout(() => {
                window.close();
            }, 1500);
        } else {
            const errorMsg = response?.error || "Erreur lors de l'enregistrement du token";
            console.error('Firefox Auth - Erreur de sauvegarde:', errorMsg);
            throw new Error(errorMsg);
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