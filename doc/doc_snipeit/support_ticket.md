# Documentation de l'API Tickets

Cette documentation détaille toutes les routes disponibles pour la gestion des tickets sur le serveur Node.js (SQLite).

L'URL de base supposée est : `http://localhost:3001`

---

## 1. Routes Principales (CRUD Tickets)

### 1.1. Récupérer des tickets — `GET /tickets`

Route principale de listing avec **filtres multicritères cumulables** via query params (inspiré de Snipe-IT `/hardware`).

**Tous les paramètres sont optionnels et combinables :**

| Paramètre    | Type    | Défaut       | Description                                      |
|-------------|---------|--------------|--------------------------------------------------|
| `search`    | string  | —            | Texte libre recherché dans `titre` OU `description` |
| `status_id` | integer | —            | Filtre par ID de statut                          |
| `priority_id`| integer | —            | Filtre par ID de priorité                        |
| `sort`      | string  | `num_ticket` | Colonne de tri (`num_ticket`, `date`, `heure`, `titre`, `description`, `status_id`, `priority_id`) |
| `order`     | string  | `asc`        | Sens du tri : `asc` ou `desc`                   |
| `limit`     | integer | —            | Nombre de résultats (pagination)                 |
| `offset`    | integer | `0`          | Décalage pour la pagination                      |

**Exemples d'appel :**
```
GET /tickets                                                        → tous les tickets
GET /tickets?search=écran                                           → recherche texte
GET /tickets?status_id=1                                            → par statut
GET /tickets?priority_id=3                                          → par priorité
GET /tickets?status_id=1&priority_id=3                             → statut + priorité
GET /tickets?search=pc&status_id=2&sort=date&order=desc            → combiné + tri
GET /tickets?limit=10&offset=0                                      → page 1 de 10
GET /tickets?search=réseau&sort=date&order=desc&limit=5&offset=10  → tout combiné
```

**Réponse de succès :**
```json
{
    "success": true,
    "data": [ { "id": 1, "num_ticket": 101, "titre": "...", "status": "New", "priority": "High", "items": [...] } ],
    "total": 42,
    "offset": 0,
    "limit": 10
}
```
> `total` = nombre total de résultats correspondants (sans pagination) — utile pour construire un paginator côté frontend.

---

### 1.2. Routes raccourcis (équivalents aux query params)

Ces routes segment restent disponibles pour compatibilité et usage direct :

| Route | Équivalent query params |
|-------|------------------------|
| `GET /tickets/status/:status_id` | `GET /tickets?status_id=X` |
| `GET /tickets/priority/:priority_id` | `GET /tickets?priority_id=X` |
| `GET /tickets/search/:query` | `GET /tickets?search=X` |

> ⚠️ Ces routes sont déclarées **avant** `GET /tickets/:id` dans le code pour éviter tout conflit Express (sinon Express intercepterait `/tickets/status` comme un `:id`).

---

### 1.3. Récupérer un ticket spécifique

- **Route :** `GET /tickets/:id`
- **Description :** Récupère les détails d'un ticket par son **ID interne** (pas le `num_ticket`).
- **Réponse :**
  ```json
  { "success": true, "data": { "id": 5, "num_ticket": 101, "titre": "...", "items": [...] } }
  ```

---

### 1.4. Créer un nouveau ticket

- **Route :** `POST /tickets`
- **Corps de la requête (JSON) :**

| Champ         | Type    | Requis | Description |
|--------------|---------|--------|-------------|
| `num_ticket`  | integer | ✅     | Numéro unique du ticket |
| `titre`       | string  | ✅     | Titre du ticket |
| `date`        | string  | —      | Format `YYYY-MM-DD` (défaut : date du jour) |
| `heure`       | string  | —      | Format `HH:MM` (défaut : heure actuelle) |
| `description` | string  | —      | Description détaillée |
| `status_id`   | integer | —      | ID du statut (défaut : 1) |
| `priority_id` | integer | —      | ID de la priorité (défaut : 2) |
| `items`       | array   | —      | Liste d'objets `{id, asset_tag, name}` |

---

### 1.5. Mettre à jour un ticket

- **Route :** `PUT /tickets/:id`
- **Description :** Mise à jour complète ou partielle. Seuls les champs envoyés sont modifiés.
- **Corps :** Tout champ modifiable (`titre`, `description`, `status_id`, `priority_id`, `items`, etc.)

---

### 1.6. Supprimer un ticket

- **Route :** `DELETE /tickets/:id`
- **Description :** Supprime définitivement le ticket ayant cet ID.

---

## 2. Routes Utilitaires

### 2.1. Supprimer TOUS les tickets

- **Route :** `DELETE /tickets`
- **Description :** Vide la table `tickets` et remet l'auto-incrément à zéro. **Irréversible.**

---

## 3. Gestion des Statuts et Priorités

### 3.1. Priorités (`/priorities`)

| Route | Description |
|-------|-------------|
| `GET /priorities` | Liste toutes les priorités → `[{ "id": 1, "name": "Low" }, ...]` |
| `POST /priorities` | Crée une priorité → body: `{ "name": "Critique" }` |
| `PUT /priorities/:id` | Renomme une priorité → body: `{ "name": "Urgence Max" }` |
| `DELETE /priorities/:id` | Supprime une priorité |

### 3.2. Statuts (`/statuses`)

| Route | Description |
|-------|-------------|
| `GET /statuses` | Liste tous les statuts → `[{ "id": 1, "name": "New" }, ...]` |
| `POST /statuses` | Crée un statut → body: `{ "name": "En Attente" }` |
| `PUT /statuses/:id` | Renomme un statut → body: `{ "name": "Bloqué" }` |
| `DELETE /statuses/:id` | Supprime un statut |

---

## 4. Importation CSV

### 4.1. Importer des tickets en masse

- **Route :** `POST /import/tickets`
- **Description :** Importe un tableau de tickets depuis un CSV. Gère la liaison assets MySQL → SQLite.
- **Corps :** `{ "tickets": [ { "num_ticket": 101, "date": "2026-06-07", ... } ] }`

---

## 5. Exemples d'Intégration Frontend (React / Axios)

Chaque route dispose de sa propre fonction `async` complète, prête à copier-coller dans un composant React.

---

### 5.1. `GET /tickets` — Récupérer tous les tickets

```javascript
const getAllTickets = async () => {
    setLoading(true)
    try {
        const response = await api_node.get('/tickets')
        setTickets(response.data.data)
        // response.data.total → nombre total de tickets
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.2. `GET /tickets?params` — Filtres multicritères (query params)

```javascript
const getFilteredTickets = async () => {
    setLoading(true)
    try {
        const params = {}
        if (selectedStatus)   params.status_id   = selectedStatus   // ID du statut
        if (selectedPriority) params.priority_id = selectedPriority // ID de la priorité
        if (searchQuery)      params.search      = searchQuery       // texte libre
        if (sortCol)          params.sort        = sortCol           // ex: 'date', 'titre'
        if (sortDir)          params.order       = sortDir           // 'asc' | 'desc'
        params.limit  = pageSize        // ex: 10 résultats par page
        params.offset = page * pageSize // ex: page 2 → offset 20

        const response = await api_node.get('/tickets', { params })
        setTickets(response.data.data)
        setTotal(response.data.total)   // total sans pagination → pour le paginator
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.3. `GET /tickets/status/:status_id` — Filtrer par statut (raccourci)

```javascript
const getTicketsByStatus = async () => {
    setLoading(true)
    try {
        // selectedStatus = ID du statut (ex: 1 pour "New")
        const response = await api_node.get(`/tickets/status/${selectedStatus}`)
        setTickets(response.data.data)
        // response.data = { success: true, data: [...], total: N }
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.4. `GET /tickets/priority/:priority_id` — Filtrer par priorité (raccourci)

```javascript
const getTicketsByPriority = async () => {
    setLoading(true)
    try {
        // selectedPriority = ID de la priorité (ex: 3 pour "High")
        const response = await api_node.get(`/tickets/priority/${selectedPriority}`)
        setTickets(response.data.data)
        // response.data = { success: true, data: [...], total: N }
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.5. `GET /tickets/search/:query` — Recherche textuelle (raccourci)

```javascript
const searchTickets = async () => {
    setLoading(true)
    try {
        // searchQuery = texte à chercher dans titre ou description
        const response = await api_node.get(`/tickets/search/${encodeURIComponent(searchQuery)}`)
        setTickets(response.data.data)
        // response.data = { success: true, data: [...], total: N }
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.6. `GET /tickets/:id` — Récupérer un ticket par son ID interne

```javascript
const getTicketById = async (ticketId) => {
    setLoading(true)
    try {
        const response = await api_node.get(`/tickets/${ticketId}`)
        setTicketDetails(response.data.data)
        // response.data.data = { id, num_ticket, titre, date, status, priority, items: [...] }
    } catch (e) {
        if (e.response?.status === 404) {
            setMessage('Ticket introuvable')
        } else {
            setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
        }
    } finally {
        setLoading(false)
    }
}
```

---

### 5.7. `POST /tickets` — Créer un ticket

```javascript
const createTicket = async () => {
    setLoading(true)
    try {
        const response = await api_node.post('/tickets', {
            num_ticket:  Date.now() % 100000, // numéro unique
            titre:       title,               // requis
            description: descri,
            date:        '2026-06-07',        // format YYYY-MM-DD
            heure:       '09:30',             // format HH:MM
            status_id:   selectedStatus,      // ID (ex: 1)
            priority_id: selectedPriority,    // ID (ex: 2)
            items: [                          // tableau d'objets assets liés
                { id: 2649, asset_tag: 'PC-001', name: 'Poste Direction' }
            ]
        })
        setMessage('Ticket créé avec succès !')
        // response.data.data = ticket complet créé (avec status et priority résolus)
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.8. `PUT /tickets/:id` — Modifier un ticket (complet ou partiel)

```javascript
const updateTicket = async () => {
    setLoading(true)
    try {
        const response = await api_node.put(`/tickets/${ticketId}`, {
            titre:       title,
            description: descri,
            date:        '2026-06-07',
            heure:       '14:00',
            status_id:   selectedStatus,
            priority_id: selectedPriority,
            items: [
                { id: 2649, asset_tag: 'PC-001', name: 'Poste Direction' }
            ]
        })
        setMessage('Ticket mis à jour !')
        // response.data.data = ticket mis à jour complet
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}

// Mise à jour partielle — uniquement le statut
const updateTicketStatus = async () => {
    setLoading(true)
    try {
        await api_node.put(`/tickets/${ticketId}`, {
            status_id: selectedStatus  // seul ce champ sera modifié
        })
        setMessage('Statut mis à jour !')
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.9. `DELETE /tickets/:id` — Supprimer un ticket

```javascript
const deleteTicket = async (ticketId) => {
    setLoading(true)
    try {
        await api_node.delete(`/tickets/${ticketId}`)
        setMessage(`Ticket #${ticketId} supprimé`)
        // Mettre à jour la liste locale :
        setTickets(prev => prev.filter(t => t.id !== ticketId))
    } catch (e) {
        if (e.response?.status === 404) {
            setMessage('Ticket introuvable')
        } else {
            setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
        }
    } finally {
        setLoading(false)
    }
}
```

---

### 5.10. `DELETE /tickets` — Supprimer TOUS les tickets ⚠️

```javascript
const deleteAllTickets = async () => {
    if (!window.confirm('Supprimer TOUS les tickets ? Action irréversible.')) return
    setLoading(true)
    try {
        const response = await api_node.delete('/tickets')
        setMessage(`Tous les tickets supprimés (${response.data.changes} ligne(s))`)
        setTickets([])
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.11. `GET /priorities` — Lister toutes les priorités

```javascript
const getPriorities = async () => {
    setLoading(true)
    try {
        const response = await api_node.get('/priorities')
        setPriorities(response.data.data)
        // response.data.data = [{ id: 1, name: 'Low' }, { id: 2, name: 'Medium' }, ...]
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.12. `POST /priorities` — Créer une priorité

```javascript
const createPriority = async () => {
    setLoading(true)
    try {
        const response = await api_node.post('/priorities', {
            name: newPriorityName  // ex: 'Critique'
        })
        setMessage(`Priorité "${response.data.data.name}" créée (ID: ${response.data.data.id})`)
        // Rafraîchir la liste :
        await getPriorities()
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.13. `PUT /priorities/:id` — Modifier une priorité

```javascript
const updatePriority = async (priorityId) => {
    setLoading(true)
    try {
        const response = await api_node.put(`/priorities/${priorityId}`, {
            name: updatedPriorityName  // ex: 'Urgence Max'
        })
        setMessage(`Priorité #${priorityId} renommée en "${response.data.data.name}"`)
        await getPriorities()
    } catch (e) {
        if (e.response?.status === 404) {
            setMessage('Priorité introuvable')
        } else {
            setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
        }
    } finally {
        setLoading(false)
    }
}
```

---

### 5.14. `DELETE /priorities/:id` — Supprimer une priorité

```javascript
const deletePriority = async (priorityId) => {
    setLoading(true)
    try {
        await api_node.delete(`/priorities/${priorityId}`)
        setMessage(`Priorité #${priorityId} supprimée`)
        setPriorities(prev => prev.filter(p => p.id !== priorityId))
    } catch (e) {
        if (e.response?.status === 404) {
            setMessage('Priorité introuvable')
        } else {
            setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
        }
    } finally {
        setLoading(false)
    }
}
```

---

### 5.15. `GET /statuses` — Lister tous les statuts

```javascript
const getStatuses = async () => {
    setLoading(true)
    try {
        const response = await api_node.get('/statuses')
        setStatuses(response.data.data)
        // response.data.data = [{ id: 1, name: 'New' }, { id: 2, name: 'In Progress' }, ...]
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.16. `POST /statuses` — Créer un statut

```javascript
const createStatus = async () => {
    setLoading(true)
    try {
        const response = await api_node.post('/statuses', {
            name: newStatusName  // ex: 'En Attente'
        })
        setMessage(`Statut "${response.data.data.name}" créé (ID: ${response.data.data.id})`)
        await getStatuses()
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.17. `PUT /statuses/:id` — Modifier un statut

```javascript
const updateStatus = async (statusId) => {
    setLoading(true)
    try {
        const response = await api_node.put(`/statuses/${statusId}`, {
            name: updatedStatusName  // ex: 'Bloqué'
        })
        setMessage(`Statut #${statusId} renommé en "${response.data.data.name}"`)
        await getStatuses()
    } catch (e) {
        if (e.response?.status === 404) {
            setMessage('Statut introuvable')
        } else {
            setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
        }
    } finally {
        setLoading(false)
    }
}
```

---

### 5.18. `DELETE /statuses/:id` — Supprimer un statut

```javascript
const deleteStatus = async (statusId) => {
    setLoading(true)
    try {
        await api_node.delete(`/statuses/${statusId}`)
        setMessage(`Statut #${statusId} supprimé`)
        setStatuses(prev => prev.filter(s => s.id !== statusId))
    } catch (e) {
        if (e.response?.status === 404) {
            setMessage('Statut introuvable')
        } else {
            setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
        }
    } finally {
        setLoading(false)
    }
}
```

---

## 7 . Structure tableau
{
    num_ticket:  101,
    date:        '2026-06-07',  // YYYY-MM-DD (normalisé par ImportService)
    heure:       '09:30',
    titre:       'Écran HS',
    description: "L'écran du bureau 12 ne s'allume plus",
    status:      'New',         // string → converti en status_id par le serveur
    priority:    'High',        // string → converti en priority_id par le serveur
    items:       '["PC-001"]'   // JSON string (enrichi avec MySQL côté serveur)
}

```javascript

## 6. Résumé de toutes les routes

| Méthode | Route | Section | Description |
|---------|-------|---------|-------------|
| `GET` | `/tickets` | 5.1 / 5.2 | Liste tous les tickets (+ filtres multicritères) |
| `GET` | `/tickets/status/:status_id` | 5.3 | Raccourci — filtre statut |
| `GET` | `/tickets/priority/:priority_id` | 5.4 | Raccourci — filtre priorité |
| `GET` | `/tickets/search/:query` | 5.5 | Raccourci — recherche texte |
| `GET` | `/tickets/:id` | 5.6 | Détail d'un ticket par ID |
| `POST` | `/tickets` | 5.7 | Créer un ticket |
| `PUT` | `/tickets/:id` | 5.8 | Modifier un ticket (complet ou partiel) |
| `DELETE` | `/tickets/:id` | 5.9 | Supprimer un ticket |
| `DELETE` | `/tickets` | 5.10 | Supprimer TOUS les tickets |
| `GET` | `/priorities` | 5.11 | Lister les priorités |
| `POST` | `/priorities` | 5.12 | Créer une priorité |
| `PUT` | `/priorities/:id` | 5.13 | Modifier une priorité |
| `DELETE` | `/priorities/:id` | 5.14 | Supprimer une priorité |
| `GET` | `/statuses` | 5.15 | Lister les statuts |
| `POST` | `/statuses` | 5.16 | Créer un statut |
| `PUT` | `/statuses/:id` | 5.17 | Modifier un statut |
| `DELETE` | `/statuses/:id` | 5.18 | Supprimer un statut |
| `POST` | `/import/tickets` | 5.19 | Import CSV en masse |

