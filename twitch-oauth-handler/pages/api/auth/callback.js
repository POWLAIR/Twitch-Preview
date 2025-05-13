export default function handler(req, res) {
    const html = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Authentification Twitch</title>
            <script>
                (function() {
                    const hash = window.location.hash;
                    const params = new URLSearchParams(hash.substring(1));
                    const token = params.get("access_token");
                    const state = params.get("state");

                    if (!token || !state) {
                        document.body.innerText = "Erreur : paramètre manquant dans l'URL";
                        return;
                    }

                    const stateObj = JSON.parse(atob(state));
                    const extensionId = stateObj.extensionId;

                    if (!extensionId) {
                        document.body.innerText = "Erreur : extensionId manquant dans le state";
                        return;
                    }

                    const redirectUrl = \`moz-extension://\${extensionId}/src/auth/auth.html#access_token=\${token}\`;
                    window.location.href = redirectUrl;
                })();
            </script>
        </head>
        <body>
            <p>Redirection en cours...</p>
        </body>
        </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
}
