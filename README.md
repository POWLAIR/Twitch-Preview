# Twitch Preview

<div align="center">

[![Version](https://img.shields.io/badge/version-1.0.0-purple)](https://github.com/votre-username/twitch-preview/releases)
[![Licence](https://img.shields.io/badge/license-MPL--2.0-blue)](LICENSE)
[![Navigateurs](https://img.shields.io/badge/browsers-Firefox%20-green)](#installation)

**Prévisualisez vos streams Twitch préférés directement depuis votre navigateur**

[Installation](#installation) •
[Fonctionnalités](#fonctionnalités) •
[Documentation](#documentation) •
[Contribution](#contribution) •
[Support](#contact)

</div>

<div align="center">
  <table>
    <tr>
      <td align="center" width="33%">
        <img src="docs/images/login.png" alt="Page de connexion" width="250"/><br/>
        <b>Page de connexion</b><br/>
        <sub>Interface de connexion avec authentification Twitch</sub>
      </td>
      <td align="center" width="33%">
        <img src="docs/images/streams.png" alt="Streams en direct" width="250"/><br/>
        <b>Streams en direct</b><br/>
        <sub>Liste des streams en direct avec prévisualisation au survol</sub>
      </td>
      <td align="center" width="33%">
        <img src="docs/images/channels.png" alt="Chaînes suivies" width="250"/><br/>
        <b>Chaînes suivies</b><br/>
        <sub>Gestion des chaînes suivies et des favoris</sub>
      </td>
    </tr>
  </table>
</div>

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

<details>
<summary><b>Pour les utilisateurs</b></summary>

1. Téléchargez l'extension depuis :
   - [Firefox Add-ons](lien_firefox)

</details>

<details>
<summary><b>Pour les développeurs</b></summary>

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

</details>

## Documentation

<details>
<summary><b>Structure du projet</b></summary>

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

</details>

<details>
<summary><b>Configuration</b></summary>

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

</details>

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



## Remerciements

- [Twitch API](https://dev.twitch.tv/docs)
- La communauté des développeurs d'extensions
- Tous les testeurs et contributeurs


---

<div align="center">
  <sub>Fait avec passion par PowlAIR</sub>
</div>

