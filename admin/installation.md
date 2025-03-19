# Installation et déploiement

Ce document détaille les étapes pour installer et déployer Dev-thèque Afrique sur un serveur.

## Prérequis

- Node.js (v14.x ou supérieur)
- MongoDB (v4.4 ou supérieur)
- Compte Cloudinary pour le stockage des fichiers
- Serveur avec au moins 2GB de RAM et 10GB d'espace disque

## Installation locale (développement)

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/votre-organisation/dev-theque-afrique.git
   cd dev-theque-afrique
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   # Modifier le fichier .env avec vos propres valeurs
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

## Déploiement en production

### Option 1: Déploiement sur VPS (Ubuntu 20.04+)

1. **Installer les dépendances système**
   ```bash
   apt update
   apt install -y nodejs npm mongodb nginx certbot python3-certbot-nginx
   ```

2. **Cloner le dépôt et installer les dépendances**
   ```bash
   git clone https://github.com/votre-organisation/dev-theque-afrique.git /var/www/dev-theque
   cd /var/www/dev-theque
   npm install --production
   ```

3. **Configuration**
   ```bash
   cp .env.example .env
   # Modifier le fichier .env pour la production
   # Important: définir NODE_ENV=production
   ```

4. **Configurer le service systemd**
   Créer un fichier `/etc/systemd/system/dev-theque.service`:
   ```
   [Unit]
   Description=Dev-theque Afrique
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/dev-theque
   ExecStart=/usr/bin/npm start
   Restart=on-failure
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

5. **Configurer Nginx**
   Créer un fichier `/etc/nginx/sites-available/dev-theque`:
   ```
   server {
     listen 80;
     server_name votre-domaine.com;

     location / {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

6. **Activer le site et configurer SSL**
   ```bash
   ln -s /etc/nginx/sites-available/dev-theque /etc/nginx/sites-enabled/
   certbot --nginx -d votre-domaine.com
   systemctl enable dev-theque
   systemctl start dev-theque
   systemctl restart nginx
   ```

### Option 2: Déploiement sur Heroku

1. **Créer une application Heroku**
   ```bash
   heroku create dev-theque-afrique
   ```

2. **Ajouter une base de données MongoDB**
   ```bash
   heroku addons:create mongodb:standard
   ```

3. **Configurer les variables d'environnement**
   ```bash
   heroku config:set JWT_SECRET=votre_secret_jwt
   heroku config:set CLOUDINARY_CLOUD_NAME=votre_cloud_name
   heroku config:set CLOUDINARY_API_KEY=votre_api_key
   heroku config:set CLOUDINARY_API_SECRET=votre_api_secret
   # Ajouter toutes les autres variables nécessaires
   ```

4. **Déployer l'application**
   ```bash
   git push heroku main
   ```

## Mise à jour du site

1. **Sauvegarde préalable**
   ```bash
   # Sauvegarde de la base de données
   mongodump --uri="votre_uri_mongodb" --out=backup_$(date +%Y%m%d)
   ```

2. **Mise à jour du code**
   ```bash
   cd /var/www/dev-theque
   git pull origin main
   npm install --production
   ```

3. **Redémarrage du service**
   ```bash
   systemctl restart dev-theque
   ``` 