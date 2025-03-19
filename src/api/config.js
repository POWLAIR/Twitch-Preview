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
    // L'ID de l'extension est automatiquement ajouté pour permettre
    // à la page de redirection de renvoyer le token à la bonne extension
    REDIRECT_URI: `https://twitch-preview.vercel.app/oauth-redirect.html?extension_id=${browser.runtime.id}`,
    
    // Permissions demandées à l'utilisateur
    SCOPES: [
        'user:read:follows',    // Pour obtenir les chaînes suivies
        'user:read:email'       // Pour obtenir les informations de l'utilisateur
    ]
};