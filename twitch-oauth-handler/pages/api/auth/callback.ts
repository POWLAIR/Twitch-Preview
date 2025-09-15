import type { NextApiRequest, NextApiResponse } from 'next';

interface StateObject {
    csrf: string;
    extensionId: string;
    timestamp?: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { access_token, state, error, error_description } = req.query;

        // Gestion des erreurs OAuth
        if (error) {
            return res.status(400).json({
                success: false,
                error: error as string,
                description: error_description as string
            });
        }

        // Validation des paramètres requis
        if (!access_token || !state) {
            return res.status(400).json({
                success: false,
                error: 'missing_params',
                description: 'Token ou state manquant'
            });
        }

        // Décoder et valider le state
        let stateObj: StateObject;
        try {
            stateObj = JSON.parse(Buffer.from(state as string, 'base64').toString());
        } catch (err) {
            return res.status(400).json({
                success: false,
                error: 'invalid_state',
                description: 'State corrompu ou invalide'
            });
        }

        if (!stateObj.extensionId) {
            return res.status(400).json({
                success: false,
                error: 'missing_extension_id',
                description: 'Extension ID manquant dans le state'
            });
        }

        // Détection du navigateur
        const userAgent = req.headers['user-agent'] || '';
        const isFirefox = userAgent.includes('Firefox') || userAgent.includes('Gecko');

        // Page de redirection minimale
        const redirectUrl = isFirefox 
            ? `moz-extension://${stateObj.extensionId}/src/auth/auth.html#access_token=${encodeURIComponent(access_token as string)}`
            : '#'; // Pour Chrome, on peut juste fermer ou afficher un message

        const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authentification réussie</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .success { color: #4ade80; font-size: 1.2em; margin-bottom: 1rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success">✅ Authentification réussie !</div>
        <p id="message">Redirection en cours...</p>
    </div>
    <script>
        const isFirefox = navigator.userAgent.includes('Firefox');
        
        if (isFirefox) {
            setTimeout(() => {
                window.location.href = '${redirectUrl}';
            }, 1000);
        } else {
            document.getElementById('message').textContent = 'Vous pouvez fermer cette fenêtre et retourner sur l\\'extension.';
            setTimeout(() => window.close(), 3000);
        }
    </script>
</body>
</html>`;

        res.setHeader('Content-Type', 'text/html');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.status(200).send(html);

    } catch (error) {
        console.error('Erreur callback OAuth:', error);
        res.status(500).json({
            success: false,
            error: 'server_error',
            description: 'Erreur interne du serveur'
        });
    }
}
