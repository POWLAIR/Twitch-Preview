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
            // Affiche l'erreur si présente
            showError(`Erreur d'authentification: ${error} - ${errorDescription}`);
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
            // Ferme la fenêtre après un court délai
            setTimeout(() => {
                window.close();
            }, 1500);
        } else {
            showError(response.error || "Erreur lors de l'enregistrement du token");
        }
    } catch (error) {
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