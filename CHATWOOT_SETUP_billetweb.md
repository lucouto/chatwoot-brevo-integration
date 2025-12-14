# 🚀 Guide d'installation - Intégration Chatwoot Dashboard App

Ce guide vous explique comment configurer l'intégration Chatwoot pour afficher les événements Billetweb directement dans Chatwoot.

---

## 📋 Prérequis

- Application Billetweb Manager déployée et fonctionnelle
- Instance Chatwoot self-hosted
- Accès aux variables d'environnement (fichier `.env` ou Coolify)

---

## 🔐 Étape 1 : Configurer l'Access Token Chatwoot

L'intégration utilise l'API Chatwoot pour récupérer automatiquement l'email du contact depuis la conversation.

### 1.1 Récupérer votre Access Token Chatwoot

1. Connectez-vous à votre instance Chatwoot
2. Allez dans **Settings** → **Applications** → **Access Tokens**
3. Créez un nouveau token ou copiez un token existant
4. **Important** : Gardez ce token secret !

### 1.2 Configurer dans Coolify

Dans Coolify, ajoutez ces variables d'environnement :

- **CHATWOOT_URL** : URL de votre instance Chatwoot (ex: `https://chatwoot.votre-domaine.com`)
- **CHATWOOT_API_KEY** ou **CHATWOOT_ACCESS_TOKEN** : Votre Access Token Chatwoot
- **CHATWOOT_ACCOUNT_ID** : ID de votre compte Chatwoot (par défaut: `1`)

---

## 🔐 Étape 2 : Générer le token API pour protéger notre API

Ce token protège notre API `/api/chatwoot/*` (différent de l'Access Token Chatwoot).

### Option A : Via npm script (recommandé)

```bash
npm run generate-chatwoot-token
```

### Option B : Via Node.js directement

```bash
node generate-chatwoot-token.js
```

### Option C : Via commande shell

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Important** : Copiez le token généré, vous en aurez besoin pour les étapes suivantes.

---

## ⚙️ Étape 3 : Configurer le token dans Coolify

### Si vous utilisez un fichier `.env` local :

Ajoutez ces lignes dans votre fichier `.env` :

```bash
# Configuration Chatwoot API (pour récupérer l'email du contact)
CHATWOOT_URL=https://votre-chatwoot.com
CHATWOOT_API_KEY=votre_access_token_chatwoot
CHATWOOT_ACCOUNT_ID=1

# Token pour protéger notre API
CHATWOOT_API_TOKEN=votre_token_genere_ici
```

### Si vous utilisez Coolify :

1. Allez dans votre application sur Coolify
2. Ouvrez l'onglet **"Variables"** ou **"Environment"**
3. Ajoutez les variables suivantes :
   - **CHATWOOT_URL** : URL de votre instance Chatwoot
   - **CHATWOOT_API_KEY** : Votre Access Token Chatwoot
   - **CHATWOOT_ACCOUNT_ID** : `1` (ou votre ID de compte)
   - **CHATWOOT_API_TOKEN** : Le token généré pour protéger notre API
4. Redémarrez l'application

---

## 🔧 Étape 4 : Configurer Chatwoot Dashboard App

### 4.1 Accéder aux paramètres Dashboard Apps

1. Connectez-vous à votre instance Chatwoot
2. Allez dans **Settings** → **Integrations** → **Dashboard Apps**
3. Cliquez sur **"Add Dashboard App"** ou **"New Dashboard App"**

### 4.2 Configurer l'application

Remplissez les champs suivants :

- **Name** : `Billetweb Events` (ou le nom de votre choix)
- **URL** : `https://votre-domaine.com/chatwoot`
  - Remplacez `votre-domaine.com` par votre domaine réel
  - Exemple : `https://billetweb.cheminneuf.community/chatwoot`

### 4.3 Note sur l'authentification

Si vous avez configuré `CHATWOOT_API_TOKEN`, vous devez configurer Chatwoot pour envoyer ce token dans les requêtes.

**Note** : 
- La page HTML (`/chatwoot`) est accessible sans token
- L'API utilise maintenant l'Access Token Chatwoot pour récupérer l'email du contact
- Le `CHATWOOT_API_TOKEN` protège notre API (optionnel en développement)

**Pour le développement/test** : Si `CHATWOOT_API_TOKEN` n'est pas configuré, l'API autorise l'accès sans token (avec un avertissement dans les logs). Mais `CHATWOOT_API_KEY` est **requis** pour que l'intégration fonctionne.

---

## 🧪 Étape 5 : Tester l'intégration

### 5.1 Tester l'API directement

```bash
# Remplacez YOUR_TOKEN et email@example.com
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://votre-domaine.com/api/chatwoot/attendees?email=email@example.com"
```

Vous devriez recevoir une réponse JSON avec les événements.

### 5.2 Tester la page HTML

Ouvrez dans votre navigateur :
```
https://votre-domaine.com/chatwoot
```

Vous devriez voir l'interface avec un message "En attente des données du contact depuis Chatwoot...".

### 5.3 Tester dans Chatwoot

1. Ouvrez une conversation dans Chatwoot
2. L'onglet "Billetweb Events" devrait apparaître
3. Les événements du contact devraient s'afficher automatiquement

---

## 🔍 Dépannage

### L'onglet n'apparaît pas dans Chatwoot

- Vérifiez que l'URL est correcte dans les paramètres Dashboard Apps
- Vérifiez que l'application est accessible depuis Chatwoot (pas de CORS)
- Vérifiez les logs de Chatwoot pour les erreurs

### "Token d'authentification invalide"

- Vérifiez que `CHATWOOT_API_TOKEN` est bien configuré
- Vérifiez que le token dans Chatwoot correspond à celui dans `.env`
- Vérifiez les logs de l'application pour les erreurs d'authentification

### "Aucun événement trouvé"

- Vérifiez que l'email du contact est correct
- Testez l'API Billetweb directement avec cet email
- Vérifiez les logs de l'application pour les erreurs API

### Les événements ne se chargent pas

- Ouvrez la console du navigateur (F12) pour voir les erreurs JavaScript
- Vérifiez que Chatwoot envoie bien les données du contact
- Vérifiez les logs serveur pour les erreurs API

### Erreur CORS

Si vous voyez des erreurs CORS :

1. Vérifiez que `cors()` est bien configuré dans `server.js` (déjà fait)
2. Vérifiez que Chatwoot peut accéder à votre domaine
3. Vérifiez les headers CORS dans la réponse

---

## 📊 Format des données

### Réponse API `/api/chatwoot/attendees`

```json
{
  "email": "contact@example.com",
  "events": [
    {
      "event_id": "1270054",
      "event_name": "Événement 2024",
      "ticket": "Pass complet",
      "status": "paid",
      "date": "2024-01-15",
      "price": "50.00",
      "used": false
    }
  ],
  "past_events": [...],
  "upcoming_events": [...],
  "total_events": 5,
  "total_paid": 3,
  "total_unpaid": 2,
  "stats": {
    "past_count": 2,
    "upcoming_count": 3,
    "paid_count": 3,
    "unpaid_count": 2
  }
}
```

---

## 🔒 Sécurité

### Recommandations

1. **Toujours utiliser HTTPS** en production
2. **Générer un token fort** (32 bytes minimum)
3. **Ne pas commiter le token** dans Git
4. **Régénérer le token** si compromis
5. **Limiter l'accès** à l'API si possible (whitelist IP)

### En développement

En développement, si `CHATWOOT_API_TOKEN` n'est pas configuré, l'API autorise l'accès sans token (avec un avertissement). **Ne faites pas cela en production !**

---

## 📝 Notes importantes

- L'intégration utilise l'API Billetweb : `/api/attendees?email=...`
- Les données sont mises en cache par le système de cache existant
- Le rate limiting s'applique aussi à cette route
- Les événements sont séparés entre "passés" et "à venir"
- Le statut de paiement est affiché pour chaque événement

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs de l'application
2. Vérifiez les logs de Chatwoot
3. Testez l'API directement avec curl
4. Vérifiez la console du navigateur (F12)

---

**Bon déploiement ! 🚀**

