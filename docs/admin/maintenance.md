# Maintenance du système

## Maintenance régulière

### Vérification des liens externes

Le système de plateformes centralise tous les liens externes, mais il est important de vérifier régulièrement leur validité:

1. Exécutez l'outil de vérification de liens (inclus dans les outils d'administration):
   ```bash
   node admin/tools/check-links.js
   ```

2. Passez en revue le rapport généré et mettez à jour les liens non fonctionnels dans `config/platforms.txt`

3. Pour les liens critiques (paiement, authentification), effectuez des tests manuels pour confirmer leur bon fonctionnement

### Mise à jour des plateformes

Lorsque vous changez de fournisseur de service ou modifiez des URLs de plateforme:

1. Mettez à jour le fichier `config/platforms.txt`
2. Testez le site dans l'environnement de développement
3. Déployez la mise à jour sur l'environnement de production
4. Vérifiez que tous les liens fonctionnent correctement

## Procédure de sauvegarde

Incluez le fichier `config/platforms.txt` dans votre stratégie de sauvegarde:

```bash
# Exemple de script de sauvegarde
backup_dir="/path/to/backups/$(date +%Y-%m-%d)"
mkdir -p "$backup_dir"
cp config/platforms.txt "$backup_dir/"
```

## Audit de sécurité

Lors des audits de sécurité, assurez-vous que:

1. Le fichier `platforms.txt` ne contient pas d'informations sensibles
2. Tous les liens utilisent HTTPS si possible
3. Les redirections sont sécurisées pour éviter les attaques de type open redirect 