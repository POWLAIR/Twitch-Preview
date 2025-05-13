import { TWITCH_API } from '../api/config.js';

export class TwitchAuth {
    constructor() {
        this.token = null;
        this.loadTokenFromStorage();
    }

    static POPUP_CONFIG = {
        width: 800,
        height: 600,
        type: 'popup'
    };

    async loadTokenFromStorage() {
        const data = await chrome.storage.local.get('twitchToken');
        this.token = data.twitchToken || null;
    }

    async saveToken(token) {
        this.token = token;
        await chrome.storage.local.set({ twitchToken: token });
    }

    async clearToken() {
        this.token = null;
        await chrome.storage.local.remove('twitchToken');
    }

    isAuthenticated() {
        return !!this.token;
    }

    async initiateAuth() {
        const extensionUrl = chrome.runtime.getURL('');
        const extensionId = extensionUrl.split('/')[2];

        // Génère un CSRF token sécurisé
        const csrf = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2);

        // Encode le state (CSRF + extensionId)
        const state = btoa(JSON.stringify({ csrf, extensionId }));

        const params = new URLSearchParams({
            response_type: 'token',
            client_id: TWITCH_API.CLIENT_ID,
            redirect_uri: TWITCH_API.REDIRECT_URI,
            scope: TWITCH_API.SCOPES.join(' '),
            state,
            force_verify: 'true'
        });

        const authUrl = `${TWITCH_API.AUTH_URL}?${params.toString()}`;

        await chrome.windows.create({
            url: authUrl,
            type: TwitchAuth.POPUP_CONFIG.type,
            width: TwitchAuth.POPUP_CONFIG.width,
            height: TwitchAuth.POPUP_CONFIG.height
        });
    }

    async exchangeCode(code) {
        const response = await fetch(TWITCH_API.TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: TWITCH_API.CLIENT_ID,
                client_secret: TWITCH_API.CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: TWITCH_API.REDIRECT_URI
            })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l’échange du code d’autorisation');
        }

        const data = await response.json();
        await this.saveToken(data.access_token);
        return data;
    }

    async validateToken() {
        if (!this.token) return false;

        try {
            const response = await fetch(TWITCH_API.VALIDATE_URL, {
                headers: {
                    'Authorization': `OAuth ${this.token}`
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Erreur de validation du token:', error);
            return false;
        }
    }

    async getUserData() {
        if (!this.token) {
            throw new Error('Utilisateur non authentifié');
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

    async logout() {
        if (this.token) {
            try {
                await fetch('https://id.twitch.tv/oauth2/revoke', {
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
