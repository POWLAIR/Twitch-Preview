/**
 * Configuration de l'environnement
 * Pour des raisons de sécurité, remplacez ces valeurs par vos propres identifiants
 * dans un fichier local qui ne sera pas commité
 */
export const ENV = {
    // Twitch API - À remplacer avec vos identifiants
    TWITCH_CLIENT_ID: 's5cljtoy5dr0udoy0jmvh62u5979kf',
    TWITCH_CLIENT_SECRET: 'p5fk7tvo2q7qkndjec04e0b3kx3wss',
    REDIRECT_URI: 'https://twitch-preview.vercel.app/api/auth/callback',

    // Cache (en millisecondes)
    CACHE_REFRESH_INTERVAL: 2 * 60 * 1000, // 2 minutes
    CACHE_MAX_AGE: 5 * 60 * 1000, // 5 minutes

    // Animations (en millisecondes)
    ANIMATION_FADE_DURATION: 300,
    ANIMATION_SLIDE_DURATION: 400
};

/**
 * Vérifie que les variables requises sont définies
 * @throws {Error} Si une variable requise est manquante
 */
function validateEnv() {
    const requiredVars = [
        'TWITCH_CLIENT_ID',
        'TWITCH_CLIENT_SECRET'
    ];

    const missingVars = requiredVars.filter(varName => !ENV[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Variables d'environnement manquantes : ${missingVars.join(', ')}`);
    }
}

// Vérifie les variables au chargement
validateEnv(); 