import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Authentification Twitch</title>
        <script>
            (function() {
                // Récupère les paramètres du hash ou du query string
                function getParam(name) {
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    const queryParams = new URLSearchParams(window.location.search.substring(1));
                    return hashParams.get(name) || queryParams.get(name);
                }
                const token = getParam("access_token");
                const state = getParam("state");

                if (!token || !state) {
                    document.body.innerText = "Erreur : paramètre manquant dans l'URL";
                    return;
                }

                let extensionId = "";
                try {
                    const stateObj = JSON.parse(atob(state));
                    extensionId = stateObj.extensionId;
                } catch {
                    document.body.innerText = "Erreur : extensionId manquant ou state invalide";
                    return;
                }

                if (!extensionId) {
                    document.body.innerText = "Erreur : extensionId manquant dans le state";
                    return;
                }

                const redirectUrl = \`moz-extension://${extensionId}/src/auth/auth.html#access_token=${token}\`;
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
