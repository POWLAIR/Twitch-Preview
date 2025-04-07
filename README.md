# Twitch Preview

Une extension de navigateur pour améliorer votre expérience Twitch en prévisualisant les streams en direct de vos chaînes suivies.

![Version](https://img.shields.io/badge/version-1.0.0-purple)
![Licence](https://img.shields.io/badge/license-MPL--2.0-blue)
![Navigateurs](https://img.shields.io/badge/browsers-Firefox%20-green)

## Fonctionnalités

- Prévisualisation instantanée des streams en direct
- Liste organisée de vos chaînes suivies
- Système de favoris pour marquer vos streamers préférés
- Notifications personnalisables pour les nouveaux streams
- Interface sombre moderne
- Actualisation automatique des données
- Design responsive
- Authentification sécurisée via Twitch

## Installation

### Pour les utilisateurs
1. Téléchargez l'extension depuis :
   - [Firefox Add-ons](lien_firefox)
   - [Chrome Web Store](lien_chrome)
   - [Edge Add-ons](lien_edge)

### Pour les développeurs
1. Clonez le dépôt :
```bash
git clone https://github.com/votre-username/twitch-preview.git
cd twitch-preview
```

2. Configuration de l'API Twitch :
   - Créez une application sur [Twitch Developer Console](https://dev.twitch.tv/console)
   - Copiez `src/utils/env.example.js` vers `src/utils/env.js`
   - Remplissez vos identifiants Twitch dans `env.js`

3. Installation dans le navigateur :
   - Firefox : Ouvrez `about:debugging` > "Ce Firefox" > "Charger un module temporaire"
   - Chrome : Ouvrez `chrome://extensions` > "Mode développeur" > "Charger l'extension non empaquetée"
   - Edge : Ouvrez `edge://extensions` > "Mode développeur" > "Charger l'extension non empaquetée"

## Structure du projet

```
twitch-preview/
├── manifest.json           # Configuration de l'extension
├── src/
│   ├── api/               # Intégration API Twitch
│   ├── assets/           # Images et icônes
│   ├── auth/             # Authentification
│   ├── background/       # Scripts d'arrière-plan
│   ├── options/         # Page des options
│   ├── popup/           # Interface principale
│   ├── utils/           # Utilitaires
│   └── vendor/          # Dépendances externes
└── docs/                # Documentation
```

## Configuration

### Options disponibles
- Activer/désactiver les notifications
- Notifications uniquement pour les favoris
- Intervalle de rafraîchissement
- Gestion des favoris

### Permissions requises
- `storage` : Stockage des préférences
- `notifications` : Alertes de streams
- `tabs` : Ouverture des streams
- `https://api.twitch.tv/*` : API Twitch

## Sécurité

- Authentification OAuth 2.0 avec Twitch
- Stockage sécurisé des tokens
- CSP stricte
- Aucune donnée personnelle collectée

## Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add: Amazing Feature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Guidelines
- Respectez le style de code existant
- Documentez les nouvelles fonctionnalités
- Testez vos modifications
- Mettez à jour la documentation si nécessaire

## Licence

Distribué sous la licence Mozilla Public License 2.0. Voir `LICENSE` pour plus d'informations.

## Contact

Votre Nom - [@votre_twitter](https://twitter.com/votre_twitter)

Lien du projet : [https://github.com/votre-username/twitch-preview](https://github.com/votre-username/twitch-preview)

## Remerciements

- [Twitch API](https://dev.twitch.tv/docs)
- La communauté des développeurs d'extensions
- Tous les testeurs et contributeurs

## Statistiques

- Stars : [nombre]
- Forks : [nombre]
- Téléchargements : [nombre]
- Contributeurs : [nombre]

---
Fait avec passion par PowlAIR

