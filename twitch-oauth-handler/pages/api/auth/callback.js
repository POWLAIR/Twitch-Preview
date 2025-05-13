export default function handler(req, res) {
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Authentification Twitch</title>
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
        .error {
            color: #FF6B6B;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="spinner" class="spinner"></div>
        <p id="message">Authentification en cours...</p>
        <p id="error" class="error" style="display: none;"></p>
    </div>

    <script>
        (function () {
            const hash = window.location.hash;
            const params = new URLSearchParams(hash.substring(1));
            const token = params.get("access_token");
            const state = params.get("state");
            const errorEl = document.getElementById("error");

            function showError(message) {
                document.getElementById("spinner").style.display = "none";
                document.getElementById("message").textContent = "Erreur";
                errorEl.style.display = "block";
                errorEl.textContent = message;
            }

            try {
                if (!token || !state) {
                    return showError("Paramètre manquant dans l'URL.");
                }

                const stateObj = JSON.parse(atob(state));
                const extensionId = stateObj.extensionId;

                if (!extensionId) {
                    return showError("extensionId manquant dans le state.");
                }

                const redirectUrl = \`moz-extension://\${extensionId}/src/auth/auth.html#access_token=\${token}\`;
                window.location.href = redirectUrl;
            } catch (err) {
                showError("Erreur lors du traitement : " + err.message);
            }
        })();
    </script>
</body>
</html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
}
