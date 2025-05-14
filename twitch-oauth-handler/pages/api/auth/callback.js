export default function handler(req, res) {
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Twitch Preview - Redirection OAuth</title>
    <style>
        body {
            background-color: #0E0E10;
            color: #EFEFF1;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            text-align: center;
        }

        .container {
            padding: 2rem;
            background-color: #18181B;
            border-radius: 8px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
            width: 90%;
            max-width: 400px;
        }

        .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #9146FF;
            border-top: 4px solid transparent;
            border-radius: 50%;
            margin: 0 auto 1rem;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        #message {
            margin-bottom: 0.5rem;
        }

        #error {
            color: #FF6B6B;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="spinner" class="spinner"></div>
        <p id="message">Authentification en cours...</p>
        <p id="error"></p>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const spinner = document.getElementById('spinner');
            const message = document.getElementById('message');
            const errorBox = document.getElementById('error');

            function showError(text) {
                spinner.style.display = 'none';
                message.textContent = 'Erreur lors de l’authentification';
                errorBox.style.display = 'block';
                errorBox.textContent = text;
            }

            function showSuccess() {
                spinner.style.display = 'none';
                message.textContent = 'Connexion réussie. Fermeture...';
                message.style.color = '#4ade80';
            }

            try {
                const hash = window.location.hash;
                const params = new URLSearchParams(hash.substring(1));
                const token = params.get('access_token');
                const state = params.get('state');

                if (!token || !state) {
                    return showError('Paramètres manquants dans l’URL.');
                }

                const stateObj = JSON.parse(atob(state));
                const extensionId = stateObj.extensionId;

                if (!extensionId) {
                    return showError('extensionId manquant dans le state.');
                }

                const isFirefox = navigator.userAgent.includes('Firefox') || navigator.userAgent.includes('Gecko');
                console.log(isFirefox);
                console.log(navigator.userAgent);
                if (isFirefox) {
                    // Redirection vers l'extension Firefox
                    var extensionScheme = 'moz-extension';
                    var redirectUrl = extensionScheme + '://' + extensionId + '/src/auth/auth.html#access_token=' + token;
                    showSuccess();
                    setTimeout(function() {
                        window.location.href = redirectUrl;
                        setTimeout(function() {
                            window.close();
                        }, 2000);
                    }, 1500);
                } else {
                    // Chrome : on affiche juste un message
                    showSuccess();
                    message.textContent = "Connexion réussie. Vous pouvez fermer cette fenêtre et retourner sur l'extension.";
                    setTimeout(function() {
                        window.close();
                    }, 3000);
                }
            } catch (err) {
                showError('Erreur de traitement : ' + err.message);
            }
        });
    </script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
}