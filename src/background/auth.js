import { TWITCH_API } from '../api/config.js';

export class TwitchAuth {
    constructor() {
        this.token = null;
        this.loadTokenFromStorage();
    }

    // Charge le token depuis le stockage local
    async loadTokenFromStorage() {
        const data = await browser.storage.local.get('twitchToken');
        this.token = data.twitchToken || null;
    }

    // Sauvegarde le token dans le stockage local
    async saveToken(token) {
        this.token = token;
        await browser.storage.local.set({ twitchToken: token });
    }

    // Supprime le token
    async clearToken() {
        this.token = null;
        await browser.storage.local.remove('twitchToken');
    }

    // Vérifie si l'utilisateur est authentifié
    isAuthenticated() {
        return !!this.token;
    }

    // Initialise le processus d'authentification
    async initiateAuth() {
        // Génère l'URL d'authentification Twitch
        const authUrl = new URL(TWITCH_API.AUTH_URL);
        authUrl.searchParams.append('client_id', TWITCH_API.CLIENT_ID);
        authUrl.searchParams.append('redirect_uri', TWITCH_API.REDIRECT_URI);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('scope', TWITCH_API.SCOPES.join(' '));
        
        // Ouvre la fenêtre d'authentification Twitch
        await browser.tabs.create({ url: authUrl.toString() });
    }

    // Échange le code d'autorisation contre un token d'accès
    async exchangeCode(code) {
        const response = await fetch(TWITCH_API.TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: TWITCH_API.CLIENT_ID,
                client_secret: TWITCH_API.CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: TWITCH_API.REDIRECT_URI
            })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'échange du code d\'autorisation');
        }

        const data = await response.json();
        await this.saveToken(data.access_token);
        return data;
    }

    // Valide le token actuel
    async validateToken() {
        if (!this.token) {
            return false;
        }

        try {
            const response = await fetch(TWITCH_API.VALIDATE_URL, {
                headers: {
                    'Authorization': `OAuth ${this.token}`
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Erreur lors de la validation du token:', error);
            return false;
        }
    }

    // Récupère les informations de l'utilisateur
    async getUserData() {
        if (!this.token) {
            throw new Error('Non authentifié');
        }

        const response = await fetch(`${TWITCH_API.API_URL}/users`, {
            headers: {
                'Client-ID': TWITCH_API.CLIENT_ID,
                'Authorization': `Bearer ${this.token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données utilisateur');
        }

        const data = await response.json();
        return data.data[0];
    }

    // Déconnexion
    async logout() {
        if (this.token) {
            try {
                await fetch(`https://id.twitch.tv/oauth2/revoke`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        client_id: TWITCH_API.CLIENT_ID,
                        token: this.token
                    })
                });
            } catch (error) {
                console.error('Erreur lors de la révocation du token:', error);
            }
        }
        
        await this.clearToken();
    }
} 