import { TwitchAuth } from './auth.js';

// Initialisation de l'authentification
const auth = new TwitchAuth();

// Gestion des messages
browser.runtime.onMessage.addListener(async (message, sender) => {
    try {
        switch (message.type) {
            case 'INITIATE_AUTH':
                return await auth.initiateAuth();

            case 'SAVE_TOKEN':
                await auth.saveToken(message.token);
                return { success: true };

            case 'CHECK_AUTH':
                const isValid = await auth.validateToken();
                return { isAuthenticated: isValid };

            case 'GET_USER_DATA':
                const userData = await auth.getUserData();
                return { success: true, userData };

            case 'LOGOUT':
                await auth.logout();
                return { success: true };

            default:
                throw new Error('Type de message non reconnu');
        }
    } catch (error) {
        console.error('Erreur dans le background script:', error);
        return { success: false, error: error.message };
    }
}); 