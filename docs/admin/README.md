# Guide de l'Administrateur - Dev-thèque Afrique

Ce guide contient toutes les informations nécessaires pour administrer la plateforme Dev-thèque Afrique.

## Sommaire

1. [Installation et déploiement](#installation-et-déploiement)
2. [Configuration](#configuration)
3. [Gestion des utilisateurs](#gestion-des-utilisateurs)
4. [Gestion du contenu](#gestion-du-contenu)
5. [Gestion des plateformes externes](#gestion-des-plateformes-externes)
6. [Modération de la communauté](#modération-de-la-communauté)
7. [Système de points](#système-de-points)
8. [Surveillance et maintenance](#surveillance-et-maintenance)
9. [Résolution des problèmes](#résolution-des-problèmes)

## Gestion des plateformes externes

La plateforme utilise un système centralisé pour gérer tous les liens vers des services externes (réseaux sociaux, API, etc.). Cette approche facilite la maintenance et permet de mettre à jour rapidement tous les liens à travers le site.

### Fichier de configuration des plateformes

Le fichier principal est `config/platforms.txt`. Ce fichier contient tous les liens externes utilisés par le site dans un format clé-valeur simple: 