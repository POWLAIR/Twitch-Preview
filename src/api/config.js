import { ENV } from '../utils/env.js';

// IMPORTANT: Remplacez ces valeurs par vos identifiants Twitch
// Allez sur https://dev.twitch.tv/console/apps pour les obtenir
export const TWITCH_API = {
    // Identifiants de l'application Twitch (à configurer dans .env)
    CLIENT_ID: ENV.TWITCH_CLIENT_ID,
    
    // Remplacez par votre Client Secret de Twitch
    CLIENT_SECRET: ENV.TWITCH_CLIENT_SECRET,
    
    // Points d'accès de l'API Twitch
    AUTH_URL: 'https://id.twitch.tv/oauth2/authorize',
    TOKEN_URL: 'https://id.twitch.tv/oauth2/token',
    VALIDATE_URL: 'https://id.twitch.tv/oauth2/validate',
    API_URL: 'https://api.twitch.tv/helix',
    
    // URL de redirection pour l'authentification OAuth
    REDIRECT_URI: 'https://twitch-preview.vercel.app/oauth-redirect.html',
    
    // Permissions demandées à l'utilisateur
    SCOPES: [
        'user:read:follows',    // Pour obtenir les chaînes suivies
        'user:read:email'       // Pour obtenir les informations de l'utilisateur
    ],

    // Génère l'URL d'authentification complète pour le flux Implicit
    getAuthURL() {
        // Génère un état unique pour la sécurité CSRF
        const state = crypto.randomUUID();
        
        // Construit les paramètres de l'URL selon la spécification Twitch pour le flux Implicit
        const params = new URLSearchParams({
            response_type: 'token', // Important: 'token' pour le flux Implicit
            client_id: this.CLIENT_ID,
            redirect_uri: this.REDIRECT_URI,
            scope: this.SCOPES.join(' '),
            state: state,
            force_verify: 'false'
        });
        
        // L'ID de l'extension sera géré par la page de redirection
        return `${this.AUTH_URL}?${params.toString()}`;
    }
};