import { TWITCH_API } from '../api/config.js';

class NotificationManager {
    constructor() {
        this.lastNotifiedStreams = new Set();
        this.notificationPreferences = {
            enabled: true,
            favoritesOnly: false
        };
    }

    async initialize() {
        // Charger les préférences
        const storage = await browser.storage.local.get(['notificationPreferences', 'lastNotifiedStreams']);
        this.notificationPreferences = storage.notificationPreferences || this.notificationPreferences;
        this.lastNotifiedStreams = new Set(storage.lastNotifiedStreams || []);

        // Nettoyer les anciens streams notifiés (plus de 6 heures)
        this.cleanOldNotifications();
    }

    async checkNewStreams() {
        if (!this.notificationPreferences.enabled) return;

        try {
            // Récupérer les favoris et les streams en direct
            const { favorites } = await browser.storage.local.get('favorites');
            const response = await browser.runtime.sendMessage({
                type: 'GET_FOLLOWED_STREAMS',
                first: 100
            });

            if (!response.success) return;

            const currentStreams = response.streams;

            for (const stream of currentStreams) {
                const streamerId = stream.user_id;
                const streamKey = `${streamerId}_${stream.started_at}`;

                // Vérifier si on doit notifier ce stream
                if (this.shouldNotifyStream(streamerId, streamKey, favorites)) {
                    await this.createStreamNotification(stream);
                    this.lastNotifiedStreams.add(streamKey);
                }
            }

            // Sauvegarder les streams notifiés
            await browser.storage.local.set({
                lastNotifiedStreams: Array.from(this.lastNotifiedStreams)
            });

        } catch (error) {
            console.error('Error checking new streams:', error);
        }
    }

    shouldNotifyStream(streamerId, streamKey, favorites) {
        // Ne pas notifier si déjà notifié
        if (this.lastNotifiedStreams.has(streamKey)) return false;

        // Si mode "favoris uniquement" activé, vérifier si le streamer est un favori
        if (this.notificationPreferences.favoritesOnly) {
            return favorites.includes(streamerId);
        }

        return true;
    }

    async createStreamNotification(stream) {
        const notificationId = `stream_${stream.user_id}_${Date.now()}`;

        await browser.notifications.create(notificationId, {
            type: 'basic',
            iconUrl: stream.profile_image_url,
            title: `${stream.user_name} est en live !`,
            message: `Joue à ${stream.game_name}\n${stream.title}`,
            buttons: [
                { title: 'Regarder le stream' }
            ]
        });

        // Gérer le clic sur la notification
        browser.notifications.onClicked.addListener((clickedId) => {
            if (clickedId === notificationId) {
                browser.tabs.create({
                    url: `https://twitch.tv/${stream.user_login}`
                });
            }
        });

        // Gérer le clic sur le bouton
        browser.notifications.onButtonClicked.addListener((clickedId, buttonIndex) => {
            if (clickedId === notificationId && buttonIndex === 0) {
                browser.tabs.create({
                    url: `https://twitch.tv/${stream.user_login}`
                });
            }
        });
    }

    cleanOldNotifications() {
        const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
        this.lastNotifiedStreams = new Set(
            Array.from(this.lastNotifiedStreams).filter(streamKey => {
                const [, startedAt] = streamKey.split('_');
                return new Date(startedAt).getTime() > sixHoursAgo;
            })
        );
    }

    async updatePreferences(preferences) {
        this.notificationPreferences = {
            ...this.notificationPreferences,
            ...preferences
        };

        await browser.storage.local.set({
            notificationPreferences: this.notificationPreferences
        });
    }
}

export const notificationManager = new NotificationManager(); 