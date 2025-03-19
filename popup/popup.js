document.addEventListener('DOMContentLoaded', () => {
    const streamsContainer = document.getElementById('streams-container');
    const errorMessage = document.getElementById('error-message');
    const refreshButton = document.getElementById('refresh-btn');
    const streamTemplate = document.getElementById('stream-template');

    // Charge les streams au chargement de la popup
    loadStreams();

    // Ajoute l'événement de rafraîchissement
    refreshButton.addEventListener('click', loadStreams);

    async function loadStreams() {
        try {
            showLoading();
            hideError();

            // TODO: Remplacer par la vraie liste des IDs des streamers suivis
            const userIds = ['123456789', '987654321']; // À remplacer par les vrais IDs
            
            const response = await browser.runtime.sendMessage({
                type: 'GET_LIVE_STREAMS',
                userIds: userIds
            });

            if (response.error) {
                throw new Error(response.error);
            }

            displayStreams(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des streams:', error);
            showError();
        }
    }

    function displayStreams(streams) {
        streamsContainer.innerHTML = '';

        if (!streams || streams.length === 0) {
            streamsContainer.innerHTML = '<div class="loading">Aucun stream en direct</div>';
            return;
        }

        streams.forEach(stream => {
            const streamElement = createStreamElement(stream);
            streamsContainer.appendChild(streamElement);
        });
    }

    function createStreamElement(stream) {
        const clone = streamTemplate.content.cloneNode(true);
        
        const streamItem = clone.querySelector('.stream-item');
        const avatar = clone.querySelector('.streamer-avatar');
        const name = clone.querySelector('.streamer-name');
        const game = clone.querySelector('.game-name');
        const viewers = clone.querySelector('.viewer-count');

        avatar.src = stream.user_avatar || 'default-avatar.png';
        avatar.alt = stream.user_name;
        name.textContent = stream.user_name;
        game.textContent = stream.game_name;
        viewers.textContent = `${formatViewerCount(stream.viewer_count)} spectateurs`;

        streamItem.addEventListener('click', () => {
            openTwitchStream(stream.user_login);
        });

        return clone;
    }

    function formatViewerCount(count) {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        }
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    }

    function openTwitchStream(username) {
        browser.tabs.create({
            url: `https://twitch.tv/${username}`
        });
    }

    function showLoading() {
        streamsContainer.innerHTML = '<div class="loading">Chargement des streams...</div>';
    }

    function showError() {
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }
}); 