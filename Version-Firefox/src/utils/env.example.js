/**
 * Exemple de configuration
 * Copiez ce fichier vers env.js et remplacez les valeurs par les vôtres
 */
export const ENV = {
    // Twitch API - Remplacez par vos identifiants
    TWITCH_CLIENT_ID: 'votre_client_id_ici',
    TWITCH_CLIENT_SECRET: 'votre_client_secret_ici',

    // Cache (en millisecondes)
    CACHE_REFRESH_INTERVAL: 2 * 60 * 1000, // 2 minutes
    CACHE_MAX_AGE: 5 * 60 * 1000, // 5 minutes

    // Animations (en millisecondes)
    ANIMATION_FADE_DURATION: 300,
    ANIMATION_SLIDE_DURATION: 400
}; 