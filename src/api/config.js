import { ENV } from '../utils/env.js';

// IMPORTANT: Remplacez ces valeurs par vos identifiants Twitch
// Allez sur https://dev.twitch.tv/console/apps pour les obtenir
export const TWITCH_API = {
    // Remplacez par votre Client ID de Twitch
    CLIENT_ID: ENV.TWITCH_CLIENT_ID,
    
    // Remplacez par votre Client Secret de Twitch
    CLIENT_SECRET: ENV.TWITCH_CLIENT_SECRET,
    
    // URLs de l'API Twitch
    AUTH_URL: 'https://id.twitch.tv/oauth2/authorize',
    TOKEN_URL: 'https://id.twitch.tv/oauth2/token',
    VALIDATE_URL: 'https://id.twitch.tv/oauth2/validate',
    API_URL: 'https://api.twitch.tv/helix',
    
    // L'URL de redirection hébergée sur GitHub Pages
    // Remplacez par https://[votre-nom-utilisateur].github.io/[nom-du-repo]/oauth-redirect.html
    REDIRECT_URI: 'https://votre-nom.github.io/twitch-preview/oauth-redirect.html',
    
    // Les scopes nécessaires pour l'application
    SCOPES: [
        'user:read:follows',    // Pour obtenir les chaînes suivies
        'user:read:email'       // Pour obtenir les informations de l'utilisateur
    ]
};