# Gestion du contenu

Ce document détaille les procédures pour gérer les documents, formations et autres contenus de Dev-thèque Afrique.

## Documents de la bibliothèque

### Ajout de nouveaux documents

1. Accédez à `/admin/documents/create`
2. Remplissez le formulaire avec:
   - Titre du document
   - Description
   - Catégorie et sous-catégorie
   - Tags pertinents
   - Coût en points
   - Fichier à télécharger
   - Image d'aperçu

Les documents supportent divers formats:
- PDF (recommandé pour la compatibilité)
- DOCX, DOC (documents Word)
- PPTX, PPT (présentations PowerPoint)
- ZIP, RAR (archives)
- MD, TXT (fichiers texte)

### Modification de documents existants

1. Accédez à `/admin/documents`
2. Recherchez le document à modifier
3. Cliquez sur "Modifier"
4. Mettez à jour les informations nécessaires
5. Cliquez sur "Enregistrer"

### Organisation des catégories

La plateforme utilise un système de catégories à deux niveaux:

1. **Catégories principales**: représentent les domaines généraux (ex: Programmation, Design, Infrastructure)
2. **Sous-catégories**: représentent des sujets spécifiques (ex: JavaScript, Python, React)

Pour gérer ces catégories:
1. Accédez à `/admin/categories`
2. Vous pouvez ajouter, modifier ou supprimer des catégories
3. Pour chaque catégorie, vous pouvez gérer ses sous-catégories

## Formations

### Création de formations

1. Accédez à `/admin/courses/create`
2. Remplissez les informations générales:
   - Titre de la formation
   - Description
   - Catégorie
   - Niveau (Débutant, Intermédiaire, Avancé)
   - Coût en points
   - Image de couverture
3. Ajoutez les modules et leçons:
   - Chaque formation est composée de modules
   - Chaque module contient des leçons
   - Les leçons peuvent être de type: Vidéo, Texte, Quiz

### Structure de données des formations

Les formations suivent cette structure dans MongoDB:

```javascript
{
  title: String,
  description: String,
  category: String,
  level: String,  // "beginner", "intermediate", "advanced"
  points: Number,
  coverImage: String,
  durationMinutes: Number,
  modules: [
    {
      title: String,
      description: String,
      lessons: [
        {
          title: String,
          type: String,  // "video", "text", "quiz"
          content: String,  // URL pour vidéo, HTML pour texte
          duration: Number,  // en minutes
          quiz: [  // uniquement pour type "quiz"
            {
              question: String,
              options: [String],
              correctAnswer: Number
            }
          ]
        }
      ]
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## Contenu de la communauté

### Modération des contributions

Toutes les contributions des utilisateurs (fichiers, questions) doivent être modérées:

1. Accédez à `/admin/community/moderation`
2. Vous verrez une liste des contributions en attente de modération
3. Pour chaque élément, vous pouvez:
   - Approuver: le contenu sera publié
   - Rejeter: le contenu sera refusé avec un message explicatif
   - Modifier: vous pouvez ajuster certains éléments avant approbation

### Règles de modération

Appliquez ces règles lors de la modération:

1. **Qualité**: Le contenu doit être de bonne qualité et pertinent
2. **Originalité**: Vérifiez que le contenu n'est pas plagié
3. **Légalité**: Assurez-vous que le contenu ne viole pas de droits d'auteur
4. **Pertinence**: Le contenu doit correspondre à la catégorie indiquée
5. **Coût en points**: Vérifiez que le coût demandé est raisonnable par rapport à la valeur

## Importation en masse

Pour importer plusieurs documents à la fois:

1. Préparez un fichier CSV avec la structure suivante:
   ```
   title,description,category,subcategory,tags,points,file_url
   ```

2. Exécutez le script d'importation:
   ```bash
   node admin/scripts/import-documents.js chemin/vers/fichier.csv
   ```

## Sauvegarde du contenu

Effectuez des sauvegardes régulières du contenu:

1. Exportez les métadonnées depuis MongoDB:
   ```bash
   mongodump --uri="votre_uri_mongodb" --collection=documents --out=backup
   mongodump --uri="votre_uri_mongodb" --collection=courses --out=backup
   ```

2. Sauvegardez les fichiers depuis Cloudinary:
   Utilisez l'API Cloudinary ou la console d'administration pour télécharger une archive de vos fichiers. 