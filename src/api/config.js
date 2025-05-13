import { ENV } from '../utils/env.js';

export const TWITCH_API = {
    CLIENT_ID: ENV.TWITCH_CLIENT_ID,

    AUTH_URL: 'https://id.twitch.tv/oauth2/authorize',
    TOKEN_URL: 'https://id.twitch.tv/oauth2/token',
    VALIDATE_URL: 'https://id.twitch.tv/oauth2/validate',
    API_URL: 'https://api.twitch.tv/helix',

    REDIRECT_URI: 'https://twitch-oauth-handler.vercel.app/auth/callback',

    SCOPES: [
        'user:read:follows',
        'user:read:email'
    ],

    getAuthURL(extensionId) {
        if (!extensionId) throw new Error('L\'ID de l\'extension est requis');

        const stateObj = {
            csrf: crypto.randomUUID(),
            extensionId: extensionId,
            timestamp: Date.now()
        };
        const state = btoa(JSON.stringify(stateObj));

        const params = new URLSearchParams({
            response_type: 'token',
            client_id: this.CLIENT_ID,
            redirect_uri: this.REDIRECT_URI,
            scope: this.SCOPES.join(' '),
            state: state,
            force_verify: 'true'
        });

        return `${this.AUTH_URL}?${params.toString()}`;
    }
};

