# 🚀 Guide d'installation - Intégration Chatwoot Brevo Dashboard App

Ce guide vous explique comment configurer l'intégration Chatwoot pour afficher et gérer les contacts Brevo directement dans Chatwoot.

---

## 📋 Prérequis

- Instance Chatwoot self-hosted
- Compte Brevo avec accès API
- Accès aux variables d'environnement (fichier `.env` ou Coolify)
- Domaine configuré: `brevo.cheminneuf.community`

---

## 🔐 Étape 1 : Obtenir votre clé API Brevo

### 1.1 Récupérer votre clé API Brevo

1. Connectez-vous à votre compte [Brevo](https://app.brevo.com/)
2. Allez dans **Settings** → **API Keys** (ou **SMTP & API** → **API Keys**)
3. Créez une nouvelle clé API ou copiez une clé existante
4. **Important** : Gardez cette clé secrète !

### 1.2 Configurer dans Coolify

Dans Coolify, ajoutez ces variables d'environnement :

- **BREVO_API_KEY** : Votre clé API Brevo
- **PORT** : `3000` (généralement auto-détecté par Coolify)

---

## 🚀 Étape 2 : Déployer l'application

### Option A : Via Coolify (Recommandé)

1. **Connectez votre repository GitHub** à Coolify
2. **Créez une nouvelle application** dans Coolify
3. **Définissez le domaine** : `brevo.cheminneuf.community`
4. **Ajoutez les variables d'environnement** :
   - **BREVO_API_KEY** : Votre clé API Brevo
5. **Déployez** l'application

### Option B : Déploiement local

1. Clonez le repository
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` :
   ```bash
   BREVO_API_KEY=votre_cle_api_brevo
   PORT=3000
   ```
4. Démarrez le serveur :
   ```bash
   npm start
   ```

---

## 🔧 Étape 3 : Configurer Chatwoot Dashboard App

### 3.1 Accéder aux paramètres Dashboard Apps

1. Connectez-vous à votre instance Chatwoot
2. Allez dans **Settings** → **Integrations** → **Dashboard Apps**
3. Cliquez sur **"Add Dashboard App"** ou **"New Dashboard App"**

### 3.2 Configurer l'application

Remplissez les champs suivants :

- **Name** : `Brevo Integration` (ou le nom de votre choix)
- **URL** : `https://brevo.cheminneuf.community/chatwoot`

Sauvegardez la configuration.

---

## 🧪 Étape 4 : Tester l'intégration

### 4.1 Tester la page HTML

Ouvrez dans votre navigateur :
```
https://brevo.cheminneuf.community/chatwoot
```

Vous devriez voir l'interface avec un message "En attente des données du contact depuis Chatwoot...".

### 4.2 Tester l'API directement

```bash
# Remplacer YOUR_BREVO_API_KEY et email@example.com
curl -H "api-key: YOUR_BREVO_API_KEY" \
  "https://api.brevo.com/v3/contacts/email@example.com"
```

### 4.3 Tester dans Chatwoot

1. Ouvrez une conversation dans Chatwoot
2. L'onglet "Brevo Integration" devrait apparaître
3. Les détails du contact Brevo devraient s'afficher automatiquement

---

## 📖 Utilisation

### Afficher les détails d'un contact

1. Ouvrez une conversation dans Chatwoot
2. Cliquez sur l'onglet "Brevo Integration"
3. L'application affichera automatiquement :
   - Les informations du contact depuis Brevo
   - Les listes auxquelles il est inscrit
   - Ses attributs personnalisés

### Ajouter un contact à une liste

1. Dans l'onglet "Brevo Integration"
2. Sélectionnez une liste dans le menu déroulant
3. Cliquez sur **"S'abonner à la liste"**
4. Le contact sera ajouté à la liste sélectionnée dans Brevo

---

## 🔍 Dépannage

### L'onglet n'apparaît pas dans Chatwoot

- Vérifiez que l'URL est correcte dans les paramètres Dashboard Apps
- Vérifiez que l'application est accessible depuis Chatwoot (pas de CORS)
- Vérifiez les logs de Chatwoot pour les erreurs

### "Contact non trouvé dans Brevo"

- Le contact n'existe pas encore dans Brevo
- Vous pouvez quand même l'ajouter à une liste (il sera créé automatiquement)

### Les détails du contact ne se chargent pas

- Vérifiez que `BREVO_API_KEY` est correctement configuré
- Vérifiez que la clé API a les permissions nécessaires
- Vérifiez les logs serveur pour les erreurs API

### Les listes ne se chargent pas

- Assurez-vous que votre clé API Brevo a la permission de lire les listes
- Vérifiez que vous avez au moins une liste créée dans Brevo

### Erreur CORS

Si vous voyez des erreurs CORS :

1. Vérifiez que le serveur est en cours d'exécution
2. Vérifiez que le domaine est correctement configuré
3. Assurez-vous que HTTPS est utilisé en production

---

## 🔒 Sécurité

### Recommandations

1. **Toujours utiliser HTTPS** en production
2. **Ne jamais commiter** votre fichier `.env` ou vos clés API dans Git
3. **Gardez votre clé API Brevo secrète** - elle a un accès complet à votre compte Brevo
4. **Régénérez la clé API** si elle est compromise

---

## 📊 Format des données

### Réponse API `/api/brevo/contact/:email`

```json
{
  "email": "contact@example.com",
  "exists": true,
  "contact": {
    "id": 123,
    "email": "contact@example.com",
    "attributes": {
      "FIRSTNAME": "John",
      "LASTNAME": "Doe"
    },
    "listIds": [1, 2, 3],
    "emailBlacklisted": false,
    "smsBlacklisted": false
  }
}
```

### Réponse API `/api/brevo/lists`

```json
{
  "lists": [
    {
      "id": 1,
      "name": "Newsletter",
      "uniqueSubscribers": 100,
      "folderId": 2
    }
  ]
}
```

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs de l'application
2. Vérifiez les logs de Chatwoot
3. Testez l'API directement avec curl
4. Vérifiez la console du navigateur (F12)
5. Consultez la [documentation Brevo API](https://developers.brevo.com/reference/getting-started-1)

---

## 📝 Notes importantes

- L'intégration utilise l'API Brevo : `https://api.brevo.com/v3`
- Les contacts sont automatiquement créés s'ils n'existent pas lors de l'inscription à une liste
- L'application écoute les événements de Chatwoot pour récupérer automatiquement l'email du contact
- Les données sont affichées en temps réel depuis Brevo

---

**Bon déploiement ! 🚀**

