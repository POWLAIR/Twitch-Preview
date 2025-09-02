# Twitch Preview

<div align="center">

[![Version](https://img.shields.io/badge/version-1.2.0-purple)](https://github.com/powlair/twitch-preview/releases)
[![Licence](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Firefox](https://img.shields.io/badge/Firefox-Manifest%20V3-orange?logo=firefox)](Version-Firefox/)
[![OAuth](https://img.shields.io/badge/OAuth-Handler-success?logo=vercel)](twitch-oauth-handler/)

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

### Fonctionnalités principales
- Prévisualisation instantanée des streams en direct
- Liste organisée de vos chaînes suivies avec statut en temps réel
- Système de favoris pour marquer vos streamers préférés
- Notifications push personnalisables pour les nouveaux streams
- Interface moderne avec thème sombre Twitch
- Actualisation automatique des données toutes les 30 secondes
- Design responsive adapté à tous les écrans
- Authentification OAuth 2.0 sécurisée via Twitch

### Nouvelles fonctionnalités v1.2.0
- Manifest V3 compatible avec les dernières versions de Firefox
- Service OAuth dédié pour une authentification optimisée
- Options redesignées avec statistiques d'utilisation
- Performance améliorée avec bundling optimisé
- Architecture nettoyée sans code mort

## Installation

<details>
<summary><b>Firefox (Recommandé)</b></summary>

### Installation manuelle
1. Téléchargez le dossier `Version-Firefox/`
2. Ouvrez Firefox et allez dans `about:debugging`
3. Cliquez sur "Ce Firefox" > "Charger un module temporaire"
4. Sélectionnez le fichier `manifest.json` dans `Version-Firefox/`

### Requirements Firefox
- Firefox 109+ (Manifest V3 support)
- Service Workers activés (par défaut depuis Firefox 115)

</details>

<details>
<summary><b> Installation pour développeurs</b></summary>

### 1. Cloner le projet
```bash
git clone https://github.com/powlair/twitch-preview.git
cd twitch-preview
```

### 2. Configuration API Twitch
- Créez une application sur [Twitch Developer Console](https://dev.twitch.tv/console)
- Dans `Version-Firefox/src/utils/env.js`, configurez :
  ```javascript
  export const CLIENT_ID = 'votre_client_id';
  export const CLIENT_SECRET = 'votre_client_secret';
  export const REDIRECT_URI = 'https://twitch-preview.vercel.app/api/auth/callback';
  ```

### 3. Déployer le service OAuth (optionnel)
```bash
cd twitch-oauth-handler
npm install
npm run build
# Déployer sur Vercel ou autre plateforme
```

### 4. Installer l'extension
- **Firefox** : `about:debugging` > "Ce Firefox" > "Charger un module temporaire"
- Sélectionner `Version-Firefox/manifest.json`

</details>

## Documentation

<details>
<summary><b>Architecture du projet</b></summary>

```
Twitch-Preview/
├── Version-Firefox/              # Extension Firefox (Manifest V3)
│   ├── manifest.json                # Configuration extension
│   └── src/
│       ├── assets/icons/           # Icônes extension
│       ├── auth/                   # Authentification OAuth
│       ├── background/             # Service Worker
│       │   └── background-firefox.js  # Script principal bundlé
│       ├── options/                # Page des options
│       │   ├── options.html        # Interface options
│       │   ├── options.css         # Styles modernes
│       │   └── options-firefox.js  # Script options bundlé
│       ├── popup/                  # Interface principale
│       │   ├── index.html          # Structure popup
│       │   ├── style.css           # Styles popup
│       │   └── popup-firefox.js    # Script popup bundlé
│       └── utils/
│           └── env.js              # Configuration API
│
├── twitch-oauth-handler/         # Service OAuth Next.js
│   ├── pages/
│   │   ├── index.tsx               # Page d'accueil service
│   │   ├── 404.tsx                 # Page erreur 404
│   │   └── api/auth/
│   │       └── callback.ts         # Handler OAuth callback
│   ├── next.config.ts              # Configuration Next.js
│   └── package.json                # Dépendances service
│
└── docs/                        # Documentation et images
```

### **Flux d'authentification**
1. **Extension** → Ouvre popup OAuth Twitch
2. **Twitch** → Utilisateur autorise l'application
3. **Service OAuth** → Traite le callback et valide
4. **Extension** → Reçoit le token et stocke sécurisé

</details>

<details>
<summary><b> Configuration et options</b></summary>

### **Options disponibles**
- **Notifications** : Activer/désactiver les alertes push
- **Favoris uniquement** : Limiter les notifications aux streamers favoris
- **Statistiques** : Visualiser les métriques d'utilisation
- **Actualisation auto** : Rafraîchissement toutes les 30 secondes
- **Gestion favoris** : Ajouter/supprimer des streamers favoris

### **Permissions requises (Manifest V3)**
- `storage` : Stockage sécurisé des préférences et tokens
- `notifications` : Affichage des alertes de nouveaux streams
- `action` : Badge et popup de l'extension
- `host_permissions` : Accès aux APIs Twitch et service OAuth

### **URLs autorisées**
- `https://api.twitch.tv/*` : API Helix Twitch
- `https://id.twitch.tv/*` : Service d'authentification Twitch
- `https://twitch-preview.vercel.app/*` : Service OAuth handler

</details>

## Sécurité

### **Mesures de sécurité**
- **OAuth 2.0** : Authentification sécurisée via Twitch
- **Stockage chiffré** : Tokens stockés de manière sécurisée
- **CSP stricte** : Content Security Policy renforcée
- **Aucune collecte** : Aucune donnée personnelle n'est collectée
- **HTTPS only** : Toutes les communications sont chiffrées
- **Validation state** : Protection CSRF avec validation du state
- **Headers sécurisés** : X-Frame-Options, X-Content-Type-Options, etc.

## Contribution

Les contributions sont les bienvenues ! Pour contribuer :

### **Processus de contribution**
1. **Fork** le projet
2. **Créez une branche** (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add: Amazing Feature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez une Pull Request**

### **Guidelines de développement**
- Respectez le style de code existant
- Documentez les nouvelles fonctionnalités
- Testez vos modifications sur Firefox
- Mettez à jour la documentation si nécessaire
- Vérifiez que la sécurité n'est pas compromise

### **Rapporter un bug**
- Utilisez les [GitHub Issues](https://github.com/powlair/twitch-preview/issues)
- Décrivez le problème avec des étapes de reproduction
- Incluez votre version de navigateur et d'OS

## Licence

Distribué sous la **MIT License**. Voir [`LICENSE`](LICENSE) pour plus d'informations.

## Statistiques du projet

- **Version actuelle** : 1.2.0
- **Compatible** : Firefox 109+
- **Manifest** : V3
- **OAuth** : Service dédié
- **Responsive** : Oui
- **Langue** : Français

---

<div align="center">
  <sub>🎮 Fait avec passion par <strong>PowlAIR</strong></br>
   • Pour la communauté Twitch</sub>
</div>

