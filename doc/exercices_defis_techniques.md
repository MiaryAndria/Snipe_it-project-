# Défis Techniques & Exercices : Stock, Chiffre d'Affaires et Filtrage

Voici une série de défis pratiques classés par niveau de difficulté pour tester et renforcer vos compétences en **React**, **JavaScript Moderne (ES6+)**, et **intégration d'API (Axios)**. Ces exercices sont conçus pour s'intégrer parfaitement à l'architecture existante de votre projet.

---

## 📊 Thème 1 : Chiffre d'Affaires & Statistiques

### 🔴 Défi 1 : Le Tableau de Bord "Bilan Financier" (Difficulté : Moyen)
**Objectif** : Créer une page ou un onglet dans l'admin qui calcule et affiche des indicateurs financiers en temps réel.
* **Fonctionnalités demandées** :
  1. **Chiffre d'Affaires Réel** : Récupérer toutes les commandes via l'API, filtrer celles qui ont le statut `completed` (ou `processing`), et calculer la somme totale payée par les clients.
  2. **Valeur du Stock (CA Potentiel)** : Parcourir la liste de tous les produits et calculer la valeur totale du stock invendu (formule : $\sum (\text{prix} \times \text{stock actuel})$).
  3. **Taux de Promotion** : Afficher le pourcentage de produits actuellement en promotion (`special_price !== null`) par rapport au catalogue global.
* **Compétences testées** :
  * Utilisation de `.reduce()` et `.filter()` pour agréger des données.
  * Gestion d'API asynchrones avec `api_admin` et états de chargement (`loading`).

> [!TIP]
> **Indice** : Utilisez `parseFloat()` pour les prix et `parseInt()` pour les stocks afin de ne pas avoir de mauvaises surprises avec le type `string` renvoyé par certaines bases de données.

---

## 📦 Thème 2 : Gestion de Stock Avancée

### 🔴 Défi 2 : Alerte de Stock Critique & Réapprovisionnement Rapide (Difficulté : Moyen)
**Objectif** : Identifier en un coup d'œil les produits en rupture de stock et permettre un réapprovisionnement automatique.
* **Fonctionnalités demandées** :
  1. **Badge Dynamique** : Sur la liste des produits, si le stock est égal à `0`, afficher un badge rouge **"Rupture"**. Si le stock est compris entre `1` et `5`, afficher un badge orange **"Stock Critique ({qty})"**. Sinon, afficher un badge vert.
  2. **Filtre "Urgence"** : Ajouter une case à cocher en haut de page *"Afficher uniquement les urgences de réapprovisionnement"* (qui combine les stocks critiques et ruptures).
  3. **Réapprovisionnement Global en 1 clic** : Ajouter un bouton qui sélectionne automatiquement tous les produits en rupture et augmente leur stock pour le ramener à `10` via des appels API en lot.
* **Compétences testées** :
  * Affichage conditionnel de classes CSS (`className`).
  * Combinaison de filtres multiples.
  * Exécution séquentielle ou parallèle de requêtes de mise à jour (`Promise.all` ou boucle `for...of`).

---

## 🔍 Thème 3 : Filtrage & Expérience Utilisateur (UX)

### 🔴 Défi 3 : Filtrage par Date de Création (Difficulté : Difficile)
**Objectif** : Pouvoir filtrer les produits ou les commandes selon leur date d'ajout dans le catalogue.
* **Fonctionnalités demandées** :
  1. Deux champs de saisie de type date : `Date Début` et `Date Fin`.
  2. Un filtre rapide par bouton : "Aujourd'hui", "7 derniers jours", "Mois en cours".
  3. La liste doit se mettre à jour instantanément pour n'afficher que les éléments créés dans la plage sélectionnée (en comparant avec le champ `created_at` des produits).
* **Compétences testées** :
  * Manipulation de l'objet `Date` en JavaScript.
  * Comparaison de chaînes ISO de dates (`2026-05-25T...`).
  * Gestion d'états dérivés complexes.

---

## 🧠 Thème 4 : Algorithmie & Logique Produit

### 🔴 Défi 4 : Simulateur de Panier avec TVA et Promotion (Difficulté : Difficile)
**Objectif** : Créer un "bac à sable" (Sandbox) pour les administrateurs pour simuler des ventes directement sur la page catalogue.
* **Fonctionnalités demandées** :
  1. À côté de chaque produit, ajouter un bouton `[ + Ajouter à la simulation ]`.
  2. En bas de page, afficher un récapitulatif du panier contenant :
     * Le sous-total HT (sans promo).
     * Les économies réalisées grâce aux promotions (`price - special_price`).
     * Le montant total de la TVA (calculé à 20% sur le prix final).
     * Le total TTC final à payer.
  3. **Contrainte importante** : Si on ajoute un produit au panier fictif, le stock disponible affiché à l'écran doit diminuer virtuellement sans que l'on ait fait d'appel API.
* **Compétences testées** :
  * Gestion d'un état complexe (`cart` sous forme de tableau d'objets avec ID et quantité).
  * Immutabilité des states React (mise à jour d'états imbriqués).
  * Calculs mathématiques de précision en JS (éviter les bugs de type `0.1 + 0.2 = 0.30000000004` en utilisant `.toFixed(2)`).

---

## 🚀 Thème 5 : Tri Double-Critère (Difficulté : Ninja 🥷)

### 🔴 Défi 5 : Le Tri Prioritaire Combiné
**Objectif** : Actuellement, vous pouvez trier par Prix OR par Nom OR par Quantité. Le défi est d'implémenter un tri **Multi-Niveaux**.
* **Exemple** : On veut trier en priorité par **Catégorie** (ordre alphabétique), et si deux produits ont la même catégorie, on veut les trier par **Prix** (du moins cher au plus cher).
* **Compétences testées** :
  * Approfondissement de l'algorithme de tri JavaScript `.sort((a, b) => { ... })`.
  * Enchaînement de conditions dans la fonction de rappel de tri.
