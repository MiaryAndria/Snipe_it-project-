# Documentation de l'API Tickets

Cette documentation détaille toutes les routes disponibles pour la gestion des tickets sur le serveur Node.js (SQLite). 

L'URL de base supposée est : `http://localhost:3001`

---

## 1. Routes Principales (CRUD)

### 1.1. Récupérer tous les tickets
- **Route :** `GET /tickets`
- **Description :** Retourne la liste complète de tous les tickets triés par numéro de ticket.
- **Exemple de requête :**
  ```http
  GET /tickets HTTP/1.1
  Host: localhost:3001
  ```
- **Réponse de succès :**
  ```json
  {
      "success": true,
      "data": [ ... ],
      "total": 10
  }
  ```

### 1.2. Créer un nouveau ticket
- **Route :** `POST /tickets`
- **Description :** Crée un nouveau ticket dans la base de données.
- **Remarque :** Cette méthode est destinée à la création individuelle de tickets depuis l'application et fonctionne de façon totalement indépendante du système d'importation CSV.
- **Corps de la requête (JSON) :**
  - `num_ticket` (Requis, Number) : Le numéro unique du ticket.
  - `titre` (Requis, String) : Le titre du ticket.
  - `date` (Optionnel, String) : La date (par défaut, la date du jour).
  - `heure` (Optionnel, String) : L'heure (par défaut, l'heure actuelle).
  - `description` (Optionnel, String) : La description détaillée.
  - `status` (Optionnel, String) : Le statut (par défaut "New").
  - `priority` (Optionnel, String) : La priorité (par défaut "Medium").
  - `items` (Optionnel, Array) : Liste des équipements liés, sous forme d'objets (ex: `[{"id":2649,"asset_tag":"PC-001","name":"Poste Direction"}]`).
- **Exemple de requête :**
  ```http
  POST /tickets HTTP/1.1
  Host: localhost:3001
  Content-Type: application/json

  {
      "num_ticket": 101,
      "titre": "Problème d'imprimante",
      "description": "L'imprimante du bureau A ne s'allume plus.",
      "priority": "High",
      "items": [
          {"id": 2649, "asset_tag": "Imprimante-01", "name": "Imprimante HP"}
      ]
  }
  ```
- **Réponse de succès :**
  ```json
  {
      "success": true,
      "data": {
          "id": 5,
          "num_ticket": 101,
          "date": "06/06/2026",
          "heure": "12:00",
          "titre": "Problème d'imprimante",
          "description": "L'imprimante du bureau A ne s'allume plus.",
          "status": "New",
          "priority": "High",
          "items": [
          {"id": 2649, "asset_tag": "Imprimante-01", "name": "Imprimante HP"}
      ]
      }
  }
  ```

### 1.3. Récupérer un ticket spécifique
- **Route :** `GET /tickets/:id`
- **Description :** Récupère les détails d'un ticket en utilisant son ID interne (celui auto-incrémenté par la base de données).
- **Exemple de requête :**
  ```http
  GET /tickets/5 HTTP/1.1
  Host: localhost:3001
  ```
- **Réponse de succès :**
  ```json
  {
      "success": true,
      "data": {
          "id": 5,
          "num_ticket": 101,
          "date": "06/06/2026",
          "heure": "12:00",
          "titre": "Problème d'imprimante",
          "description": "L'imprimante du bureau A ne s'allume plus.",
          "status": "New",
          "priority": "High",
          "items": [
          {"id": 2649, "asset_tag": "Imprimante-01", "name": "Imprimante HP"}
      ]
      }
  }
  ```

### 1.4. Mettre à jour complètement un ticket
- **Route :** `PUT /tickets/:id`
- **Description :** Met à jour plusieurs informations d'un ticket existant. Fonctionne pour tous les champs et indépendamment de l'import.
- **Exemple de requête :**
  ```http
  PUT /tickets/5 HTTP/1.1
  Host: localhost:3001
  Content-Type: application/json

  {
      "status": "In Progress",
      "priority": "High",
      "items": [
          {"id": 2650, "asset_tag": "PC-002", "name": "Poste Marie Curie"}
      ]
  }
  ```
- **Réponse de succès :**
  ```json
  {
      "success": true,
      "data": {
          "id": 5,
          "num_ticket": 101,
          "date": "06/06/2026",
          "heure": "12:00",
          "titre": "Problème d'imprimante",
          "description": "L'imprimante du bureau A ne s'allume plus.",
          "status": "In Progress",
          "priority": "High",
          "items": [
          {"id": 2650, "asset_tag": "PC-002", "name": "Poste Marie Curie"}
      ]
      }
  }
  ```

### 1.5. Supprimer un ticket
- **Route :** `DELETE /tickets/:id`
- **Description :** Supprime définitivement le ticket ayant cet ID.
- **Exemple de requête :**
  ```http
  DELETE /tickets/5 HTTP/1.1
  Host: localhost:3001
  ```
- **Réponse de succès :**
  ```json
  {
      "success": true,
      "message": "Ticket 5 supprimé"
  }
  ```

---

## 2. Routes Utilitaires Avancées

### 2.1. Supprimer TOUS les tickets
- **Route :** `DELETE /tickets`
- **Description :** Vide complètement la table des tickets et remet le compteur d'auto-incrémentation à zéro. **Attention : action irréversible.**
- **Exemple de requête :**
  ```http
  DELETE /tickets HTTP/1.1
  Host: localhost:3001
  ```
- **Réponse de succès :**
  ```json
  {
      "success": true,
      "message": "Tous les tickets ont été supprimés",
      "changes": 10
  }
  ```

### 2.2. Changer le statut d'un ticket
- **Route :** `PATCH /tickets/:id/status`
- **Description :** Permet de modifier uniquement le statut d'un ticket (ex: passer de "New" à "In Progress").
- **Exemple de requête :**
  ```http
  PATCH /tickets/5/status HTTP/1.1
  Host: localhost:3001
  Content-Type: application/json

  {
      "status": "Resolved"
  }
  ```
- **Réponse de succès :**
  ```json
  {
      "success": true,
      "data": {
          "id": 5,
          "num_ticket": 101,
          "date": "06/06/2026",
          "heure": "12:00",
          "titre": "Problème d'imprimante",
          "description": "L'imprimante du bureau A ne s'allume plus.",
          "status": "Resolved",
          "priority": "High",
          "items": [
          {"id": 2650, "asset_tag": "PC-002", "name": "Poste Marie Curie"}
      ]
      }
  }
  ```

### 2.3. Changer la priorité d'un ticket
- **Route :** `PATCH /tickets/:id/priority`
- **Description :** Permet de modifier uniquement la priorité d'un ticket.
- **Exemple de requête :**
  ```http
  PATCH /tickets/5/priority HTTP/1.1
  Host: localhost:3001
  Content-Type: application/json

  {
      "priority": "Critical"
  }
  ```
- **Réponse de succès :**
  ```json
  {
      "success": true,
      "data": {
          "id": 5,
          "num_ticket": 101,
          "date": "06/06/2026",
          "heure": "12:00",
          "titre": "Problème d'imprimante",
          "description": "L'imprimante du bureau A ne s'allume plus.",
          "status": "Resolved",
          "priority": "Critical",
          "items": [
          {"id": 2650, "asset_tag": "PC-002", "name": "Poste Marie Curie"}
      ]
      }
  }
  ```

### 2.4. Filtrer les tickets par statut
- **Route :** `GET /tickets/status/:status`
- **Description :** Récupère tous les tickets ayant le statut spécifié.
- **Exemple de requête :**
  ```http
  GET /tickets/status/New HTTP/1.1
  Host: localhost:3001
  ```
- **Réponse de succès :**
  ```json
  {
      "success": true,
      "data": [ ... ],
      "total": 5
  }
  ```

### 2.5. Filtrer les tickets par priorité
- **Route :** `GET /tickets/priority/:priority`
- **Description :** Récupère tous les tickets ayant la priorité spécifiée.
- **Exemple de requête :**
  ```http
  GET /tickets/priority/High HTTP/1.1
  Host: localhost:3001
  ```
- **Réponse de succès :**
  ```json
  {
      "success": true,
      "data": [ ... ],
      "total": 3
  }
  ```

### 2.6. Rechercher dans les tickets
- **Route :** `GET /tickets/search/:query`
- **Description :** Effectue une recherche textuelle dans le titre ou la description.
- **Exemple de requête :**
  ```http
  GET /tickets/search/imprimante HTTP/1.1
  Host: localhost:3001
  ```
- **Réponse de succès :**
  ```json
  {
      "success": true,
      "data": [ ... ],
      "total": 2
  }
  ```

---

## 3. Importation (CSV / Masse)

### 3.1. Importer des tickets en masse
- **Route :** `POST /import/tickets`
- **Description :** Importe un tableau de tickets. Gère automatiquement la liaison entre les éléments ("items") et les "assets" MySQL.
- **Exemple de requête :**
  ```http
  POST /import/tickets HTTP/1.1
  Host: localhost:3001
  Content-Type: application/json

  {
      "tickets": [
          {
              "Num_Ticket": "102",
              "Titre": "Panne réseau",
              "Description": "Plus d'internet au 2ème étage",
              "Status": "New",
              "Priority": "Critical",
              "Items": "[\"SW-01\", \"Admin\"]"
          }
      ]
  }
  ```
- **Réponse de succès :**
  ```json
  {
      "success": true,
      "message": "1 ticket(s) importé(s) dans SQLite (avec assets liés)",
      "count": 1
  }
  ```
