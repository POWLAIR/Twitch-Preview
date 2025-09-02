# 🔐 Twitch OAuth Handler

Service d'authentification OAuth pour l'extension **Twitch Preview**.

## 📋 Description

Ce projet Next.js gère le flux d'authentification OAuth de Twitch pour l'extension de navigateur. Il sert de pont entre l'API Twitch et l'extension, permettant aux utilisateurs de se connecter en toute sécurité.

## 🏗️ Architecture

```
pages/api/auth/
└── callback.js    # Handler principal OAuth
```

## 🚀 Fonctionnalités

- ✅ **Support multi-navigateurs** (Chrome, Firefox)
- ✅ **Gestion d'erreurs** robuste
- ✅ **Interface utilisateur** avec Twitch branding
- ✅ **Redirection automatique** vers l'extension
- ✅ **Validation du state** CSRF

## 🔄 Flux d'authentification

1. **Extension** → Ouvre la popup Twitch OAuth
2. **Twitch** → Redirige vers `/api/auth/callback`
3. **Handler** → Valide et extrait le token
4. **Redirection** → Renvoie vers l'extension avec le token

### Firefox
```
moz-extension://{extensionId}/src/auth/auth.html#access_token={token}
```

### Chrome/Autres
```
Fermeture automatique de la fenêtre après 3 secondes
```

## 🛠️ Développement

### Installation
```bash
npm install
```

### Développement local
```bash
npm run dev
```
Accessible sur http://localhost:3000

### Production
```bash
npm run build
npm start
```

## 🌐 Déploiement

### Vercel (Recommandé)
1. Connecter le repo GitHub à Vercel
2. Déploiement automatique sur push
3. URL : `https://twitch-preview.vercel.app`

### Variables d'environnement
Aucune variable d'environnement requise actuellement.

## 📝 API Endpoints

### `GET /api/auth/callback`

Handler principal pour le callback OAuth de Twitch.

**Paramètres (dans l'URL hash) :**
- `access_token` : Token d'accès Twitch
- `state` : State CSRF avec extensionId encodé

**Réponse :**
- Page HTML avec redirection automatique vers l'extension

## 🔒 Sécurité

- ✅ Validation du state CSRF
- ✅ Extraction sécurisée de l'extensionId
- ✅ Gestion d'erreurs sans exposition de données sensibles

## 🐛 Débogage

Les erreurs sont affichées dans l'interface utilisateur :
- Paramètres manquants
- State invalide
- Erreurs de parsing JSON

## 📚 Technologies

- **Next.js** - Framework React
- **TypeScript** - Typage statique
- **Vercel** - Hébergement et déploiement

## 🔗 Liens utiles

- [Extension Twitch Preview](../Version-Firefox/)
- [Documentation Twitch OAuth](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/)
- [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)

## 📄 License

Ce projet fait partie du projet Twitch Preview - Usage personnel et éducatif.