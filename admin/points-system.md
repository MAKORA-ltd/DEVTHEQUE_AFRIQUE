# Système de points

Ce document explique le fonctionnement du système de points de Dev-thèque Afrique et comment l'administrer.

## Principe général

Le système de points est la monnaie virtuelle de la plateforme qui permet:
- D'accéder à des documents et formations
- De récompenser les contributions à la communauté
- D'encourager l'engagement des utilisateurs

## Sources de points

### 1. Points initiaux

- Chaque nouvel utilisateur reçoit **500 points** à l'inscription

### 2. Tâches sociales

Les utilisateurs peuvent gagner des points en effectuant des actions sociales:
- Suivre la page sur Twitter: **100 points**
- S'abonner à la chaîne YouTube: **100 points**
- Rejoindre le groupe Telegram: **75 points**
- Partager la plateforme sur WhatsApp: **50 points**
- Suivre sur Instagram: **75 points**

### 3. Contributions communautaires

- Partager un document approuvé: **50-200 points** (selon la qualité)
- Recevoir un téléchargement sur un document partagé: **80% des points dépensés**
- Répondre à une question: **10 points**
- Avoir sa réponse marquée comme solution: **50 points**

### 4. Bonus d'activité

- Connexion quotidienne: **5 points/jour**
- Connexion 7 jours consécutifs: **25 points bonus**
- Connexion 30 jours consécutifs: **150 points bonus**

## Configuration du système de points

Pour modifier les barèmes de points, accédez à `/admin/points-config`:

1. Modifiez les valeurs pour chaque action
2. Ajustez les seuils et multiplicateurs si nécessaire
3. Cliquez sur "Enregistrer la configuration"

Les modifications prennent effet immédiatement pour les nouvelles actions.

## Historique des points

Chaque transaction de points est enregistrée dans la base de données:

```javascript
{
  user: ObjectId,
  amount: Number,  // Positif pour gain, négatif pour dépense
  reason: String,  // Description de la transaction
  relatedEntity: {  // Facultatif, référence à l'entité concernée
    type: String,  // "document", "course", "answer", etc.
    id: ObjectId
  },
  date: Date
}
```

Pour consulter l'historique:
1. Accédez à `/admin/users/USER_ID/points-history`
2. Filtrez par date ou type de transaction
3. Exportez les données si nécessaire

## Ajustements manuels

En tant qu'administrateur, vous pouvez ajuster manuellement les points:

1. Accédez à la page de l'utilisateur concerné
2. Cliquez sur "Ajuster les points"
3. Entrez le montant (positif pour ajouter, négatif pour retirer)
4. Fournissez une justification détaillée
5. Cliquez sur "Appliquer"

Toutes les modifications manuelles sont enregistrées avec l'identifiant de l'administrateur.

## Économie des points

Pour maintenir une économie de points saine:

1. **Surveiller la distribution**: Utilisez le tableau de bord `/admin/points-economy` pour visualiser la circulation des points
2. **Éviter l'inflation**: Assurez-vous que l'attribution de points reste équilibrée par rapport aux dépenses
3. **Ajuster les coûts**: Révisez périodiquement le coût des documents et formations

## Détection de fraude

Le système inclut des mécanismes pour détecter les abus:

1. **Limites quotidiennes**: Maximum de points pouvant être gagnés par jour
2. **Détection de schémas suspects**: Alertes sur les comportements anormaux
3. **Vérification des tâches sociales**: Validation que les actions ont réellement été effectuées

Pour consulter les alertes de fraude:
1. Accédez à `/admin/points-alerts`
2. Examinez chaque cas suspect
3. Prenez les mesures appropriées

## Script d'audit

Pour effectuer un audit complet du système de points:

```bash
node admin/scripts/points-audit.js --start=YYYY-MM-DD --end=YYYY-MM-DD
```

Ce script génère un rapport détaillé sur:
- Total des points distribués/dépensés
- Répartition par type d'action
- Utilisateurs ayant le plus gagné/dépensé
- Anomalies potentielles 