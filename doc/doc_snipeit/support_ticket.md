# Documentation de l'API Tickets

Cette documentation détaille toutes les routes disponibles pour la gestion des tickets sur le serveur Node.js (SQLite). 

L'URL de base supposée est : `http://localhost:3001`

---

## 1. Routes Principales (CRUD Tickets)

### 1.1. Récupérer tous les tickets
- **Route :** `GET /tickets`
- **Description :** Retourne la liste complète de tous les tickets triés par numéro de ticket.
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
- **Corps de la requête (JSON) :**
  - `num_ticket` (Requis, Number) : Le numéro unique du ticket.
  - `titre` (Requis, String) : Le titre du ticket.
  - `date` (Optionnel, String) : La date (par défaut, la date du jour).
  - `heure` (Optionnel, String) : L'heure (par défaut, l'heure actuelle).
  - `description` (Optionnel, String) : La description détaillée.
  - `status_id` (Optionnel, Integer) : L'ID du statut (par défaut 1).
  - `priority_id` (Optionnel, Integer) : L'ID de la priorité (par défaut 2).
  - `items` (Optionnel, Array) : Liste des équipements liés, sous forme de tableau d'objets (ex: `[{"id":2649,"asset_tag":"PC-001","name":"Poste Direction"}]`).

### 1.3. Récupérer un ticket spécifique
- **Route :** `GET /tickets/:id`
- **Description :** Récupère les détails d'un ticket en utilisant son ID interne.

### 1.4. Mettre à jour un ticket (Complète ou Partielle)
- **Route :** `PUT /tickets/:id`
- **Description :** Met à jour les informations d'un ticket existant. L'endpoint `PUT` est conçu pour accepter des mises à jour complètes ou partielles.
- **Corps de la requête (JSON) :** Tout champ modifiable (`titre`, `description`, `status_id`, `priority_id`, `items`, etc.).

### 1.5. Supprimer un ticket
- **Route :** `DELETE /tickets/:id`
- **Description :** Supprime définitivement le ticket ayant cet ID.

---

## 2. Routes Utilitaires Avancées

### 2.1. Supprimer TOUS les tickets
- **Route :** `DELETE /tickets`
- **Description :** Vide complètement la table des tickets et remet le compteur d'auto-incrémentation à zéro. **Attention : action irréversible.**

### 2.2. Filtrer les tickets par statut
- **Route :** `GET /tickets/status/:status_id`
- **Description :** Récupère tous les tickets ayant le statut spécifié.

### 2.3. Filtrer les tickets par priorité
- **Route :** `GET /tickets/priority/:priority_id`
- **Description :** Récupère tous les tickets ayant la priorité spécifiée.

### 2.4. Rechercher dans les tickets
- **Route :** `GET /tickets/search/:query`
- **Description :** Effectue une recherche textuelle dans le titre ou la description.

---

## 3. Gestion des Statuts et Priorités

L'API offre désormais des tables dédiées pour gérer indépendamment la liste des statuts et des priorités disponibles dans votre application.

### 3.1. Priorités (`/priorities`)
- **GET /priorities** : Liste toutes les priorités. Retourne un tableau d'objets : `[{ "id": 1, "name": "Low" }, ...]`.
- **POST /priorities** : Crée une nouvelle priorité.
  - **Body :** `{ "name": "Critique" }`
- **PUT /priorities/:id** : Met à jour le nom d'une priorité existante.
  - **Body :** `{ "name": "Urgence Max" }`
- **DELETE /priorities/:id** : Supprime une priorité.

### 3.2. Statuts (`/statuses`)
- **GET /statuses** : Liste tous les statuts. Retourne un tableau d'objets : `[{ "id": 1, "name": "New" }, ...]`.
- **POST /statuses** : Crée un nouveau statut.
  - **Body :** `{ "name": "En Attente" }`
- **PUT /statuses/:id** : Met à jour le nom d'un statut existant.
  - **Body :** `{ "name": "Bloqué" }`
- **DELETE /statuses/:id** : Supprime un statut.

---

## 4. Importation (CSV / Masse)

### 4.1. Importer des tickets en masse
- **Route :** `POST /import/tickets`
- **Description :** Importe un tableau de tickets depuis un fichier CSV. Gère automatiquement la liaison entre les tags `string` et les assets de MySQL.

---

## 5. Exemples d'Intégration Frontend (React)

Voici des exemples simples de requêtes Axios (`api_node`) à copier-coller dans votre composant, utilisant directement vos variables d'état (ex: `title`, `descri`, `selectedPriority`, etc.).

### 5.1. Créer un ticket (`POST /tickets`)
```javascript
const createTicket = async () => {
    setLoading(true)
    try {
        await api_node.post('/tickets', {
            num_ticket: Date.now() % 100000,
            titre: title,
            description: descri,
            priority_id: selectedPriority,
            // Format attendu : Un tableau d'objets (id, asset_tag, name)
            items: [
                {
                    id: itemDetail.id,
                    asset_tag: itemDetail.asset_tag,
                    name: itemDetail.name
                }
            ]
        })
        setMessage('Ticket créé avec succès !')
    } catch (e) {
        console.log(e)
        setMessage('Erreur lors de la création du ticket')
    } finally {
        setLoading(false)
    }
}
```

### 5.2. Mettre à jour un ticket (`PUT /tickets/:id`)
L'API utilise `PUT` pour toutes les mises à jour. Vous pouvez envoyer tout le ticket ou juste un champ (comme le statut).

```javascript
// Exemple de mise à jour complète (ou partielle)
const updateTicket = async () => {
    setLoading(true)
    try {
        await api_node.put(`/tickets/${ticketId}`, {
            titre: title,
            description: descri,
            status_id: selectedStatus,
            priority_id: selectedPriority,
            items: [
                {
                    id: itemDetail.id,
                    asset_tag: itemDetail.asset_tag,
                    name: itemDetail.name
                }
            ]
        })
        setMessage('Ticket mis à jour avec succès !')
    } catch (e) {
        console.log(e)
        setMessage('Erreur lors de la mise à jour du ticket')
    } finally {
        setLoading(false)
    }
}

// Exemple : Mettre à jour uniquement le statut (avec PUT)
const updateTicketStatusOnly = async () => {
    setLoading(true)
    try {
        await api_node.put(`/tickets/${ticketId}`, {
            status_id: selectedStatus
        })
        setMessage('Statut mis à jour !')
    } catch (e) {
        console.log(e)
        setMessage('Erreur lors de la mise à jour du statut')
    } finally {
        setLoading(false)
    }
}
```

### 5.3. Récupérer tous les tickets (`GET /tickets`)
```javascript
const getAllTickets = async () => {
    setLoading(true)
    try {
        const response = await api_node.get('/tickets')
        setTickets(response.data.data)
    } catch (e) {
        console.log(e)
        setMessage('Erreur lors de la récupération des tickets')
    } finally {
        setLoading(false)
    }
}
```

### 5.4. Récupérer un ticket spécifique (`GET /tickets/:id`)
```javascript
const getTicketById = async () => {
    setLoading(true)
    try {
        const response = await api_node.get(`/tickets/${ticketId}`)
        setTicketDetails(response.data.data)
    } catch (e) {
        console.log(e)
        setMessage('Erreur lors de la récupération du ticket')
    } finally {
        setLoading(false)
    }
}
```

### 5.5. Supprimer un ticket spécifique (`DELETE /tickets/:id`)
```javascript
const deleteTicket = async () => {
    setLoading(true)
    try {
        await api_node.delete(`/tickets/${ticketId}`)
        setMessage('Ticket supprimé avec succès !')
    } catch (e) {
        console.log(e)
        setMessage('Erreur lors de la suppression du ticket')
    } finally {
        setLoading(false)
    }
}
```

### 5.6. Supprimer TOUS les tickets (`DELETE /tickets`)
**Attention : Action destructrice**
```javascript
const deleteAllTickets = async () => {
    setLoading(true)
    try {
        await api_node.delete('/tickets')
        setMessage('Tous les tickets ont été supprimés !')
        setTickets([])
    } catch (e) {
        console.log(e)
        setMessage('Erreur lors de la suppression de tous les tickets')
    } finally {
        setLoading(false)
    }
}
```

### 5.7. Filtrer les tickets par statut ou priorité
```javascript
const getTicketsByStatus = async () => {
    setLoading(true)
    try {
        const response = await api_node.get(`/tickets/status/${selectedStatus}`)
        setTickets(response.data.data)
    } catch (e) {
        console.log(e)
        setMessage('Erreur lors du filtrage par statut')
    } finally {
        setLoading(false)
    }
}

const getTicketsByPriority = async () => {
    setLoading(true)
    try {
        const response = await api_node.get(`/tickets/priority/${selectedPriority}`)
        setTickets(response.data.data)
    } catch (e) {
        console.log(e)
        setMessage('Erreur lors du filtrage par priorité')
    } finally {
        setLoading(false)
    }
}
```

### 5.8. Rechercher dans les tickets (`GET /tickets/search/:query`)
```javascript
const searchTickets = async () => {
    setLoading(true)
    try {
        const response = await api_node.get(`/tickets/search/${searchQuery}`)
        setTickets(response.data.data)
    } catch (e) {
        console.log(e)
        setMessage('Erreur lors de la recherche de tickets')
    } finally {
        setLoading(false)
    }
}
```

### 5.9. Gérer les Priorités (CRUD complet)
```javascript
const getPriorities = async () => {
    setLoading(true)
    try {
        const response = await api_node.get('/priorities')
        setPriorities(response.data.data) // Tableau d'objets: [{id: 1, name: 'Low'}]
    } catch (e) {
        console.log(e)
    } finally {
        setLoading(false)
    }
}

const addPriority = async () => {
    setLoading(true)
    try {
        await api_node.post('/priorities', { name: newPriorityName })
        setMessage('Priorité ajoutée !')
        // Optionnel: Rappeler getPriorities()
    } catch (e) {
        console.log(e)
    } finally {
        setLoading(false)
    }
}

const updatePriority = async () => {
    setLoading(true)
    try {
        await api_node.put(`/priorities/${priorityId}`, { name: updatedPriorityName })
        setMessage('Priorité modifiée !')
    } catch (e) {
        console.log(e)
    } finally {
        setLoading(false)
    }
}

const deletePriority = async () => {
    setLoading(true)
    try {
        await api_node.delete(`/priorities/${priorityId}`)
        setMessage('Priorité supprimée !')
    } catch (e) {
        console.log(e)
    } finally {
        setLoading(false)
    }
}
```

### 5.10. Gérer les Statuts (CRUD complet)
```javascript
const getStatuses = async () => {
    setLoading(true)
    try {
        const response = await api_node.get('/statuses')
        setStatuses(response.data.data) // Tableau d'objets: [{id: 1, name: 'New'}]
    } catch (e) {
        console.log(e)
    } finally {
        setLoading(false)
    }
}

const addStatus = async () => {
    setLoading(true)
    try {
        await api_node.post('/statuses', { name: newStatusName })
        setMessage('Statut ajouté !')
        // Optionnel: Rappeler getStatuses()
    } catch (e) {
        console.log(e)
    } finally {
        setLoading(false)
    }
}

const updateStatus = async () => {
    setLoading(true)
    try {
        await api_node.put(`/statuses/${statusId}`, { name: updatedStatusName })
        setMessage('Statut modifié !')
    } catch (e) {
        console.log(e)
    } finally {
        setLoading(false)
    }
}

const deleteStatus = async () => {
    setLoading(true)
    try {
        await api_node.delete(`/statuses/${statusId}`)
        setMessage('Statut supprimé !')
    } catch (e) {
        console.log(e)
    } finally {
        setLoading(false)
    }
}
```
