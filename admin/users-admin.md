# Administration des utilisateurs

Ce document détaille comment gérer les utilisateurs de la plateforme Dev-thèque Afrique.

## Interface d'administration des utilisateurs

L'interface d'administration des utilisateurs est accessible à l'adresse `/admin/users`. Cette interface vous permet de:

1. Visualiser tous les utilisateurs
2. Rechercher des utilisateurs
3. Modifier les informations des utilisateurs
4. Gérer les rôles et permissions
5. Suspendre ou supprimer des comptes

## Gestion des rôles

La plateforme utilise trois rôles principaux:

| Rôle | Description | Permissions |
|------|-------------|------------|
| user | Utilisateur standard | Télécharger des documents, participer à la communauté |
| moderator | Modérateur | Valider le contenu communautaire, résoudre les signalements |
| admin | Administrateur | Accès complet à toutes les fonctionnalités |

### Attribuer un rôle à un utilisateur

1. Accédez à `/admin/users`
2. Recherchez l'utilisateur concerné
3. Cliquez sur "Modifier"
4. Sélectionnez le rôle approprié dans le menu déroulant
5. Cliquez sur "Enregistrer"

Alternativement, vous pouvez utiliser l'API directement:

```bash
curl -X PUT https://votre-domaine.com/api/admin/users/role \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "ID_UTILISATEUR", "role": "moderator"}'
```

## Gestion des points

Vous pouvez ajuster manuellement les points des utilisateurs:

1. Accédez à la page de l'utilisateur
2. Cliquez sur "Ajuster les points"
3. Entrez le montant à ajouter (ou à retirer avec un nombre négatif)
4. Ajoutez une justification pour l'historique
5. Cliquez sur "Appliquer"

## Surveillance des activités

Le panneau d'administration fournit un journal des activités de chaque utilisateur:

- Documents téléchargés
- Achats effectués
- Contributions à la communauté
- Connexions au système

Pour consulter ce journal:
1. Accédez à la page de l'utilisateur
2. Cliquez sur l'onglet "Activités"

## Suspension et suppression de comptes

### Suspendre un compte

La suspension empêche temporairement un utilisateur de se connecter sans supprimer ses données:

1. Accédez à la page de l'utilisateur
2. Cliquez sur "Suspendre le compte"
3. Indiquez la raison et la durée de la suspension
4. Cliquez sur "Confirmer"

### Supprimer un compte

La suppression est définitive et retire toutes les données associées à l'utilisateur:

1. Accédez à la page de l'utilisateur
2. Cliquez sur "Supprimer le compte"
3. Confirmez que vous souhaitez supprimer définitivement ce compte
4. Entrez votre mot de passe administrateur pour confirmer

## Script d'import/export d'utilisateurs

Pour importer des utilisateurs en masse:

```bash
node admin/scripts/import-users.js chemin/vers/fichier.csv
```

Le fichier CSV doit suivre ce format: 