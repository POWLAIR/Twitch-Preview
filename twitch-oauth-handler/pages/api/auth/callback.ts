import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // OAuth2 avec response_type=token envoie les paramètres dans le fragment (#)
    // Le serveur ne peut pas les lire, donc on traite tout côté client
    
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Twitch Preview - Authentification OAuth</title>
    <style>
        body {
            background: linear-gradient(135deg, #0E0E10 0%, #18181B 100%);
            color: #EFEFF1;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            text-align: center;
        }

        .container {
            padding: 2.5rem;
            background: #18181B;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            width: 90%;
            max-width: 420px;
            border-top: 4px solid #9146FF;
        }

        .logo {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #9146FF 0%, #772CE8 100%);
            border-radius: 16px;
            margin: 0 auto 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: white;
        }

        .spinner {
            width: 48px;
            height: 48px;
            border: 3px solid rgba(145, 70, 255, 0.3);
            border-top: 3px solid #9146FF;
            border-radius: 50%;
            margin: 0 auto 1.5rem;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        h1 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(90deg, #9146FF 0%, #772CE8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        #message {
            font-size: 1rem;
            color: #ADADB8;
            margin-bottom: 1rem;
        }

        #error {
            color: #FF6B6B;
            background: rgba(255, 107, 107, 0.1);
            border: 1px solid rgba(255, 107, 107, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin-top: 1rem;
            display: none;
        }

        .success {
            color: #4ade80 !important;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">TP</div>
        <h1>Twitch Preview</h1>
        <div id="spinner" class="spinner"></div>
        <p id="message">Connexion en cours...</p>
        <div id="error"></div>
    </div>

    <script>
        function log(message) {
            console.log('[OAuth Callback]', message);
        }

        function showError(text) {
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('message').textContent = 'Erreur d\\'authentification';
            document.getElementById('error').style.display = 'block';
            document.getElementById('error').textContent = text;
            log('Erreur: ' + text);
        }

        function showSuccess(message = 'Connexion réussie !') {
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('message').textContent = message;
            document.getElementById('message').classList.add('success');
            log('Succès: ' + message);
        }

        function detectBrowser() {
            const ua = navigator.userAgent;
            if (ua.includes('Firefox') || ua.includes('Gecko')) {
                return 'firefox';
            }
            return 'chrome';
        }

        function handleOAuthCallback() {
            try {
                log('Démarrage du traitement OAuth');
                log('URL complète: ' + window.location.href);
                
                const hash = window.location.hash;
                log('Fragment hash: ' + hash);

                if (!hash || hash.length < 2) {
                    throw new Error('Aucun paramètre trouvé dans l\\'URL de callback');
                }

                // Parse les paramètres du fragment
                const params = new URLSearchParams(hash.substring(1));
                const token = params.get('access_token');
                const state = params.get('state');
                const error = params.get('error');
                const errorDescription = params.get('error_description');

                log('Paramètres extraits:');
                log('- Token: ' + (token ? 'Présent (' + token.length + ' caractères)' : 'Absent'));
                log('- State: ' + (state ? 'Présent' : 'Absent'));
                log('- Error: ' + (error || 'Aucune'));

                // Gestion des erreurs OAuth
                if (error) {
                    const errorMsg = errorDescription 
                        ? error + ': ' + errorDescription
                        : 'Erreur OAuth: ' + error;
                    throw new Error(errorMsg);
                }

                // Validation des paramètres requis
                if (!token) {
                    throw new Error('Token d\\'accès manquant dans la réponse OAuth');
                }

                if (!state) {
                    throw new Error('Paramètre state manquant dans la réponse OAuth');
                }

                // Décoder le state
                let stateObj;
                try {
                    stateObj = JSON.parse(atob(state));
                    log('State décodé: ' + JSON.stringify(stateObj));
                } catch (err) {
                    throw new Error('State invalide ou corrompu: ' + err.message);
                }

                if (!stateObj.extensionId) {
                    throw new Error('Extension ID manquant dans le state');
                }

                // Détection du navigateur et redirection
                const browser = detectBrowser();
                log('Navigateur détecté: ' + browser);

                if (browser === 'firefox') {
                    const redirectUrl = 'moz-extension://' + stateObj.extensionId + '/src/auth/auth.html#access_token=' + encodeURIComponent(token);
                    log('Redirection Firefox vers: ' + redirectUrl);
                    showSuccess('Redirection vers l\\'extension...');
                    
                    setTimeout(function() {
                        window.location.href = redirectUrl;
                    }, 1500);
                } else {
                    showSuccess('Connexion réussie ! Retournez sur l\\'extension.');
                    setTimeout(function() {
                        window.close();
                    }, 3000);
                }

            } catch (error) {
                log('Erreur lors du traitement: ' + error.message);
                showError(error.message);
            }
        }

        // Démarrer le traitement
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', handleOAuthCallback);
        } else {
            handleOAuthCallback();
        }
    </script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.status(200).send(html);
}