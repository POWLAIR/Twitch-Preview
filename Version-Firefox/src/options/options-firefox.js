// Options script pour Firefox - Version compatible sans modules ES6

// Gestionnaire de notifications simplifié pour les options
class OptionsNotificationManager {
    async updatePreferences(preferences) {
        // Récupérer les préférences actuelles
        const storage = await browser.storage.local.get('notificationPreferences');
        const currentPrefs = storage.notificationPreferences || {
            enabled: true,
            favoritesOnly: false
        };

        // Fusionner avec les nouvelles préférences
        const updatedPrefs = {
            ...currentPrefs,
            ...preferences
        };

        // Sauvegarder
        await browser.storage.local.set({
            notificationPreferences: updatedPrefs
        });

        return updatedPrefs;
    }
}

const optionsNotificationManager = new OptionsNotificationManager();

// Fonction pour afficher un message de confirmation avec animation
function showSaveMessage() {
    // Supprimer tout message existant
    const existingMessage = document.querySelector('.save-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const message = document.createElement('div');
    message.className = 'save-message';
    message.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
        </svg>
        Préférences sauvegardées
    `;
    document.body.appendChild(message);

    // Retirer le message après 2 secondes
    setTimeout(() => {
        message.style.opacity = '0';
        message.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 300);
    }, 2000);
}

// Fonction pour ajouter des animations aux checkboxes
function addCheckboxAnimation(checkbox) {
    checkbox.addEventListener('change', () => {
        checkbox.style.transform = 'scale(0.9)';
        setTimeout(() => {
            checkbox.style.transform = 'scale(1)';
        }, 150);
    });

    // Animation au survol
    checkbox.addEventListener('mouseenter', () => {
        if (!checkbox.checked) {
            checkbox.style.borderColor = 'var(--twitch-purple)';
        }
    });

    checkbox.addEventListener('mouseleave', () => {
        if (!checkbox.checked) {
            checkbox.style.borderColor = 'var(--text-color-secondary)';
        }
    });
}

// Fonction pour initialiser les paramètres de notification
async function initializeNotificationSettings() {
    const enableNotifications = document.getElementById('enableNotifications');
    const favoritesOnlyNotifications = document.getElementById('favoritesOnlyNotifications');

    if (!enableNotifications || !favoritesOnlyNotifications) {
        console.error('Éléments de notification non trouvés');
        return;
    }

    // Ajouter des animations
    addCheckboxAnimation(enableNotifications);
    addCheckboxAnimation(favoritesOnlyNotifications);

    try {
        // Charger les préférences existantes
        const { notificationPreferences } = await browser.storage.local.get('notificationPreferences');

        if (notificationPreferences) {
            enableNotifications.checked = notificationPreferences.enabled !== false; // Par défaut true
            favoritesOnlyNotifications.checked = notificationPreferences.favoritesOnly || false;
        } else {
            // Valeurs par défaut
            enableNotifications.checked = true;
            favoritesOnlyNotifications.checked = false;
        }

        // Gérer l'état d'activation/désactivation
        function updateFavoritesState() {
            const favoritesSetting = favoritesOnlyNotifications.closest('.setting-item');
            if (enableNotifications.checked) {
                favoritesSetting.style.opacity = '1';
                favoritesSetting.style.pointerEvents = 'auto';
                favoritesOnlyNotifications.disabled = false;
            } else {
                favoritesSetting.style.opacity = '0.5';
                favoritesSetting.style.pointerEvents = 'none';
                favoritesOnlyNotifications.disabled = true;
            }
        }

        // État initial
        updateFavoritesState();

        // Gérer les changements pour les notifications générales
        enableNotifications.addEventListener('change', async (e) => {
            try {
                await optionsNotificationManager.updatePreferences({
                    enabled: e.target.checked
                });
                updateFavoritesState();
                showSaveMessage();
            } catch (error) {
                console.error('Erreur lors de la sauvegarde des notifications:', error);
                showErrorMessage('Erreur lors de la sauvegarde');
            }
        });

        // Gérer les changements pour les notifications de favoris uniquement
        favoritesOnlyNotifications.addEventListener('change', async (e) => {
            try {
                await optionsNotificationManager.updatePreferences({
                    favoritesOnly: e.target.checked
                });
                showSaveMessage();
            } catch (error) {
                console.error('Erreur lors de la sauvegarde des favoris:', error);
                showErrorMessage('Erreur lors de la sauvegarde');
            }
        });

    } catch (error) {
        console.error('Erreur lors de l\'initialisation des paramètres:', error);
        showErrorMessage('Erreur lors du chargement des paramètres');
    }
}

// Fonction pour afficher un message d'erreur
function showErrorMessage(message) {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'save-message error-message';
    errorMsg.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        ${message}
    `;
    errorMsg.style.backgroundColor = 'var(--error-color)';
    document.body.appendChild(errorMsg);

    setTimeout(() => {
        errorMsg.style.opacity = '0';
        setTimeout(() => {
            if (errorMsg.parentNode) {
                errorMsg.remove();
            }
        }, 300);
    }, 3000);
}

// Fonction pour initialiser les tooltips personnalisés
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');

    tooltipElements.forEach(element => {
        let tooltip;

        element.addEventListener('mouseenter', (e) => {
            // Créer le tooltip
            tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = element.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: var(--background-light);
                color: var(--text-color);
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 1000;
                border: 1px solid var(--border-color);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
            `;

            document.body.appendChild(tooltip);

            // Positionner le tooltip
            const rect = element.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';

            // Afficher avec animation
            requestAnimationFrame(() => {
                tooltip.style.opacity = '1';
            });
        });

        element.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (tooltip && tooltip.parentNode) {
                        tooltip.remove();
                    }
                }, 200);
            }
        });
    });
}

// Fonction pour ajouter des effets visuels améliorés
function initializeVisualEffects() {
    // Effet de parallaxe subtil sur les sections
    const sections = document.querySelectorAll('.settings-section');

    sections.forEach((section, index) => {
        section.style.animationDelay = `${index * 0.1}s`;
        section.classList.add('animate-in');
    });

    // Effet de hover amélioré sur les éléments de paramètres
    const settingItems = document.querySelectorAll('.setting-item');
    settingItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(8px)';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
        });
    });

    // Effet de focus amélioré sur les checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('focus', () => {
            checkbox.style.boxShadow = '0 0 0 3px rgba(145, 70, 255, 0.3)';
        });

        checkbox.addEventListener('blur', () => {
            checkbox.style.boxShadow = 'none';
        });
    });
}

// Fonction pour initialiser le thème responsive
function initializeResponsiveFeatures() {
    // Ajuster le layout pour les petits écrans
    function adjustLayout() {
        const body = document.body;
        if (window.innerWidth < 600) {
            body.style.padding = '16px';
            body.style.maxWidth = '100%';
        } else {
            body.style.padding = '24px';
            body.style.maxWidth = '800px';
        }
    }

    // Ajuster au chargement
    adjustLayout();

    // Ajuster lors du redimensionnement
    window.addEventListener('resize', adjustLayout);
}

// Fonction pour créer une animation d'entrée en douceur
function createEntranceAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: slideInUp 0.6s ease-out forwards;
            opacity: 0;
            transform: translateY(20px);
        }

        @keyframes slideInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .setting-item {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .save-message {
            animation: slideInRight 0.3s ease-out, slideOutRight 0.3s ease-in 2s forwards;
        }

        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }

        .error-message {
            background-color: var(--error-color) !important;
        }

        /* Amélioration des effets de hover */
        .settings-section:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(145, 70, 255, 0.15);
        }

        /* État désactivé amélioré */
        input[type="checkbox"]:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .setting-item:has(input[type="checkbox"]:disabled) {
            opacity: 0.6;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
}

// Initialisation principale
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initialisation des options Twitch Preview Firefox...');

    try {
        // Créer les animations CSS
        createEntranceAnimation();

        // Initialiser toutes les fonctionnalités
        await initializeNotificationSettings();
        initializeTooltips();
        initializeVisualEffects();
        initializeResponsiveFeatures();

        console.log('Options initialisées avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des options:', error);
        showErrorMessage('Erreur lors de l\'initialisation');
    }
});
