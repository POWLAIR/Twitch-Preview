import type { NextApiRequest, NextApiResponse } from 'next';

interface StateObject {
    csrf: string;
    extensionId: string;
    timestamp?: number;
}

interface OAuthParams {
    access_token?: string;
    state?: string;
    error?: string;
    error_description?: string;
}

/**
 * Handler OAuth pour l'authentification Twitch
 * Gère le callback après autorisation utilisateur
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // Définir les headers de sécurité
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Twitch Preview - Authentification OAuth</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background: linear-gradient(135deg, #0E0E10 0%, #18181B 100%);
            color: #EFEFF1;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
            line-height: 1.6;
        }

        .container {
            padding: 2.5rem;
            background: #18181B;
            border-radius: 12px;
            box-shadow: 
                0 10px 30px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(145, 70, 255, 0.1);
            width: 90%;
            max-width: 420px;
            position: relative;
            overflow: hidden;
        }

        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #9146FF 0%, #772CE8 100%);
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
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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
            font-weight: 600;
            margin-bottom: 0.5rem;
            background: linear-gradient(90deg, #9146FF 0%, #772CE8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        #message {
            font-size: 1rem;
            color: #ADADB8;
            margin-bottom: 0.5rem;
        }

        #error {
            color: #FF6B6B;
            background: rgba(255, 107, 107, 0.1);
            border: 1px solid rgba(255, 107, 107, 0.3);
            border-radius: 8px;
            padding: 1rem;
            margin-top: 1rem;
            display: none;
            font-size: 0.9rem;
        }

        .success {
            color: #4ade80 !important;
        }

        .progress-bar {
            width: 100%;
            height: 4px;
            background: rgba(145, 70, 255, 0.2);
            border-radius: 2px;
            margin-top: 1.5rem;
            overflow: hidden;
            display: none;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #9146FF 0%, #772CE8 100%);
            width: 0%;
            border-radius: 2px;
            transition: width 0.3s ease;
        }

        /* Animation d'entrée */
        .container {
            animation: slideIn 0.4s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Responsive */
        @media (max-width: 480px) {
            .container {
                padding: 2rem 1.5rem;
                margin: 1rem;
            }
            
            h1 {
                font-size: 1.3rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">TP</div>
        <h1>Twitch Preview</h1>
        <div id="spinner" class="spinner"></div>
        <p id="message">Connexion en cours...</p>
        <div class="progress-bar" id="progressBar">
            <div class="progress-fill" id="progressFill"></div>
        </div>
        <div id="error"></div>
    </div>

    <script>
        (function() {
            'use strict';
            
            const elements = {
                spinner: document.getElementById('spinner'),
                message: document.getElementById('message'),
                error: document.getElementById('error'),
                progressBar: document.getElementById('progressBar'),
                progressFill: document.getElementById('progressFill')
            };

            // Logging sécurisé
            const log = {
                info: (msg) => console.log(\`[OAuth] \${msg}\`),
                error: (msg) => console.error(\`[OAuth Error] \${msg}\`),
                warn: (msg) => console.warn(\`[OAuth Warning] \${msg}\`)
            };

            function showError(text) {
                elements.spinner.style.display = 'none';
                elements.message.textContent = 'Erreur d'authentification';
                elements.error.style.display = 'block';
                elements.error.textContent = text;
                log.error(text);
            }

            function showSuccess(message = 'Connexion réussie !') {
                elements.spinner.style.display = 'none';
                elements.message.textContent = message;
                elements.message.classList.add('success');
                log.info('Authentification réussie');
            }

            function showProgress(percentage, message) {
                elements.progressBar.style.display = 'block';
                elements.progressFill.style.width = percentage + '%';
                if (message) {
                    elements.message.textContent = message;
                }
            }

            function detectBrowser() {
                const ua = navigator.userAgent;
                if (ua.includes('Firefox') || ua.includes('Gecko')) {
                    return 'firefox';
                } else if (ua.includes('Chrome') || ua.includes('Chromium')) {
                    return 'chrome';
                } else if (ua.includes('Safari')) {
                    return 'safari';
                } else if (ua.includes('Edge')) {
                    return 'edge';
                }
                return 'unknown';
            }

            function validateState(stateParam) {
                try {
                    const stateObj = JSON.parse(atob(stateParam));
                    
                    if (!stateObj.extensionId) {
                        throw new Error('ExtensionId manquant dans le state');
                    }

                    // Validation optionnelle du timestamp (si présent)
                    if (stateObj.timestamp) {
                        const now = Date.now();
                        const stateTime = stateObj.timestamp;
                        const maxAge = 10 * 60 * 1000; // 10 minutes
                        
                        if (now - stateTime > maxAge) {
                            log.warn('State expiré mais continuation du processus');
                        }
                    }

                    return stateObj;
                } catch (err) {
                    throw new Error('State invalide ou corrompu: ' + err.message);
                }
            }

            function handleFirefoxRedirect(token, extensionId) {
                showProgress(25, 'Préparation de la redirection...');
                
                setTimeout(() => {
                    showProgress(50, 'Redirection vers l\'extension...');
                    
                    const redirectUrl = \`moz-extension://\${extensionId}/src/auth/auth.html#access_token=\${token}\`;
                    
                    setTimeout(() => {
                        showProgress(75, 'Ouverture de l\'extension...');
                        window.location.href = redirectUrl;
                        
                        setTimeout(() => {
                            showProgress(100, 'Fermeture en cours...');
                            window.close();
                        }, 2000);
                    }, 800);
                }, 500);
            }

            function handleChromeRedirect() {
                showProgress(33, 'Finalisation...');
                
                setTimeout(() => {
                    showProgress(66, 'Connexion établie...');
                    showSuccess('Connexion réussie ! Retournez sur l\'extension.');
                    
                    setTimeout(() => {
                        showProgress(100, 'Fermeture automatique...');
                        setTimeout(() => {
                            window.close();
                        }, 1000);
                    }, 2000);
                }, 800);
            }

            // Point d'entrée principal
            function handleOAuthCallback() {
                try {
                    const hash = window.location.hash;
                    
                    if (!hash || hash.length < 2) {
                        throw new Error('Aucun paramètre trouvé dans l\'URL');
                    }

                    const params = new URLSearchParams(hash.substring(1));
                    const token = params.get('access_token');
                    const state = params.get('state');
                    const error = params.get('error');
                    const errorDescription = params.get('error_description');

                    // Gestion des erreurs OAuth
                    if (error) {
                        const errorMsg = errorDescription 
                            ? \`\${error}: \${errorDescription}\`
                            : \`Erreur OAuth: \${error}\`;
                        throw new Error(errorMsg);
                    }

                    // Validation des paramètres requis
                    if (!token) {
                        throw new Error('Token d\'accès manquant');
                    }

                    if (!state) {
                        throw new Error('Paramètre state manquant');
                    }

                    // Validation et décodage du state
                    const stateObj = validateState(state);
                    
                    // Détection du navigateur et redirection appropriée
                    const browser = detectBrowser();
                    log.info(\`Navigateur détecté: \${browser}\`);

                    if (browser === 'firefox') {
                        handleFirefoxRedirect(token, stateObj.extensionId);
                    } else {
                        handleChromeRedirect();
                    }

                } catch (error) {
                    showError(error.message);
                }
            }

            // Initialisation sécurisée
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', handleOAuthCallback);
            } else {
                handleOAuthCallback();
            }

        })();
    </script>
</body>
</html>
    `;

    res.status(200).send(html);
}
