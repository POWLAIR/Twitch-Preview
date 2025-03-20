# Extension Twitch pour navigateur

Une extension de navigateur pour suivre vos streamers Twitch préférés et accéder rapidement à leurs streams en direct.

## Fonctionnalités

- 🔴 Voir les streams en direct des chaînes que vous suivez
- 👥 Consulter la liste de vos chaînes suivies
- ⭐ Système de favoris pour marquer vos streamers préférés
- 🖼️ Prévisualisation des streams au survol
- 🔔 Badge de notification indiquant le nombre de streams en direct
- 🌙 Interface sombre adaptée à Twitch
- 🔄 Actualisation automatique des données
- 🔒 Authentification sécurisée via Twitch

## Installation

1. Clonez ce dépôt
2. Ouvrez votre navigateur et accédez à la page des extensions
3. Activez le mode développeur
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier du projet

## Utilisation

1. Cliquez sur l'icône de l'extension dans votre barre d'outils
2. Connectez-vous avec votre compte Twitch
3. Naviguez entre les onglets "Streams en direct" et "Chaînes suivies"
4. Marquez vos streamers favoris en cliquant sur l'étoile
5. Survolez un stream pour voir une prévisualisation
6. Cliquez sur un stream pour l'ouvrir sur Twitch

## Configuration requise

- Un navigateur compatible avec les WebExtensions (Chrome, Firefox, Edge)
- Un compte Twitch
- Une connexion Internet

## Développement

### Structure du projet

```sh
twitch-preview/
├── manifest.json # Configuration de l'extension
├── api/
│ ├── config.js # Configuration de l'API
│ └── twitch.js # Intégration API Twitch
├── assets/icons/
│ ├── icon-16.png
│ ├── icon-48.png
│ ├── icon-128.png
│ └── icon.png # Icône principale
├── auth/
│ ├── auth.css # Styles de la page d'authentification
│ ├── auth.html # Page d'authentification
│ └── auth.js # Logique d'authentification
├── background/
│ ├── background.html # Page de fond
│ └── background.js # Script de fond
├── options/
│ ├── options.css # Styles des options
│ ├── options.html # Page des options
│ └── options.js # Logique des options
├── popup/
│ ├── index.html # Interface principale
│ ├── popup.js # Logique de la popup
│ └── style.css # Styles de la popup
├── preview/
│ ├── constants.js # Constantes
│ ├── utils.js # Fonctions utilitaires
│ ├── env.example.js # Template de configuration
│ └── formatters.js # Fonctions de formatage
├── .gitignore # Configuration Git
├── LICENSE # Licence du projet
├── oauth-redirect.html # Page redirection
└── README.md # Documentation du projet
```

## Développement

### Prérequis

- Firefox Developer Edition ou Firefox
- Un compte développeur Twitch
- Node.js et npm (pour le développement futur)

### Installation pour le développement

1. Suivez les étapes d'installation ci-dessus
2. Pour recharger l'extension après des modifications :
   - Dans `about:debugging`
   - Trouvez l'extension
   - Cliquez sur "Recharger"

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

MIT License - voir le fichier LICENSE pour plus de détails.

## À venir

- [ ] Mode sombre/clair
- [ ] Configuration des préférences utilisateur 