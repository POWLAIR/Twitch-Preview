# Twitch Preview

Une extension Firefox qui permet de voir en temps réel les chaînes Twitch que vous suivez et qui sont en direct.

## Fonctionnalités

- 🔴 Affichage des streams en direct
- 👥 Liste des streamers suivis
- 🔄 Rafraîchissement manuel des données
- 🎮 Informations sur le jeu en cours
- 👁️ Nombre de spectateurs en temps réel

## Installation

1. Clonez ce dépôt :
```bash
git clone https://github.com/votre-username/twitch-preview.git
cd twitch-preview
```

2. Créez une application sur la [Console Développeur Twitch](https://dev.twitch.tv/console/apps)
   - Cliquez sur "Register Your Application"
   - Remplissez le formulaire
   - Notez votre Client ID et générez un Client Secret

3. Configurez l'extension :
   - Ouvrez `src/background.js`
   - Remplacez `YOUR_CLIENT_ID` et `YOUR_CLIENT_SECRET` par vos identifiants Twitch

4. Installez l'extension dans Firefox :
   - Ouvrez Firefox
   - Allez à `about:debugging`
   - Cliquez sur "Ce Firefox"
   - Cliquez sur "Charger un module temporaire"
   - Sélectionnez le fichier `manifest.json` du projet

## Structure du projet

```
twitch-preview/
├── manifest.json           # Configuration de l'extension
├── src/
│   └── background.js      # Script de fond (authentification, API)
├── popup/
│   ├── index.html         # Interface de la popup
│   ├── style.css         # Styles de la popup
│   └── popup.js          # Logique de la popup
└── icons/                # Icônes de l'extension
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

- [ ] Aperçu vidéo au survol (hover preview)
- [ ] Notifications pour les streams qui démarrent
- [ ] Filtres par catégorie/jeu
- [ ] Mode sombre/clair
- [ ] Configuration des préférences utilisateur 