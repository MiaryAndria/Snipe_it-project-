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

### 1.5.1. Remettre un ticket à "New"

- **Route :** `PUT /tickets/:id/reset`
- **Description :** Raccourci pour remettre le statut d'un ticket à "New" (`status_id = 1`). Utilisé principalement pour annuler ou recommencer le traitement.

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

La table `ticket_statuses` ne gère plus que le nom technique. La gestion des couleurs et des traductions se fait via les routes `/kanban_settings`.

| Route | Description |
|-------|-------------|
| `GET /statuses` | Liste tous les statuts (avec couleur et traduction incluses via jointure) |
| `POST /statuses` | Crée un statut → body: `{ "name": "En Attente" }` |
| `PUT /statuses/:id` | Modifie le nom technique d'un statut → body: `{ "name": "Bloqué" }` |
| `DELETE /statuses/:id` | Supprime un statut (et ses paramètres Kanban associés en cascade) |

### 3.3. Paramètres Kanban (`/kanban_settings`)

| Route | Description |
|-------|-------------|
| `GET /kanban_settings` | Liste tous les paramètres Kanban (couleurs et traductions par statut) |
| `GET /kanban_settings/:status_id` | Récupère les paramètres Kanban d'un statut spécifique |
| `POST /kanban_settings` | Crée ou met à jour les paramètres d'un statut existant → body: `{ "status_id": 1, "couleur_id": 2, "label_traduction": "Miandry" }` |
| `PUT /kanban_settings/:status_id` | Modifie les paramètres d'un statut existant → body: `{ "couleur_id": 3, "label_traduction": "En cours" }` |

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

### 5.8.1 `PUT /tickets/:id/reset` — Remettre le statut à "New"

```javascript
const resetTicketStatus = async (ticketId) => {
    setLoading(true)
    try {
        await api_node.put(`/tickets/${ticketId}/reset`)
        setMessage('Le ticket a été remis à l\'état New !')
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
        // response.data.data = [{ id: 1, name: 'New', label_traduction: 'Vaovao', couleur_id: 2, ... }, ...]
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
            name: newStatusName // ex: 'En Attente'
        })
        setMessage(`Statut "${response.data.data.name}" créé (ID: ${response.data.data.id})`)
        // Pour lui assigner une couleur et une traduction, appeler ensuite /kanban_settings
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
            name: updatedStatusName // ex: 'Bloqué'
        })
        setMessage(`Statut #${statusId} renommé en "${response.data.data.name}"`)
        // Pour modifier sa couleur ou traduction, appeler /kanban_settings
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

### 5.18.1. `GET /kanban_settings` — Lister tous les paramètres Kanban

```javascript
const getKanbanSettings = async () => {
    setLoading(true)
    try {
        const response = await api_node.get('/kanban_settings')
        setKanbanSettings(response.data.data)
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}

// Alternative (alias souvent utilisé) :
const getAllKanbanSetting = async () => {
    setLoading(true)
    try {
        const response = await api_node.get('/kanban_settings')
        setKanbanSettings(response.data.data)
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.18.2. `GET /kanban_settings/:status_id` — Récupérer les paramètres Kanban d'un statut

```javascript
const getKanbanSettingByStatus = async (statusId) => {
    setLoading(true)
    try {
        const response = await api_node.get(`/kanban_settings/${statusId}`)
        setKanbanSetting(response.data.data)
    } catch (e) {
        if (e.response?.status === 404) {
            setMessage('Paramètres introuvables')
        } else {
            setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
        }
    } finally {
        setLoading(false)
    }
}
```

---

### 5.19. `POST /kanban_settings` — Modifier/Créer les paramètres Kanban d'un statut

```javascript
const saveKanbanSettings = async (statusId, colorId, traduction) => {
    setLoading(true)
    try {
        await api_node.post('/kanban_settings', {
            status_id: statusId,
            couleur_id: colorId,
            label_traduction: traduction
        })
        setMessage('Paramètres Kanban enregistrés')
        await getStatuses() // Rafraîchir la liste pour voir les changements
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.20. `PUT /kanban_settings/:status_id` — Modifier les paramètres Kanban d'un statut

```javascript
const updateKanbanSettings = async (statusId, colorId, traduction) => {
    setLoading(true)
    try {
        await api_node.put(`/kanban_settings/${statusId}`, {
            couleur_id: colorId,
            label_traduction: traduction
        })
        setMessage('Paramètres Kanban mis à jour')
        await getStatuses() // Rafraîchir la liste pour voir les changements
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.21. `GET /couleurs` — Lister toutes les couleurs

```javascript
const getCouleurs = async () => {
    setLoading(true)
    try {
        const response = await api_node.get('/couleurs')
        setCouleurs(response.data.data)
        // response.data.data = [{ id: 1, name: 'Rouge', hex_code: '#FF4C4C' }, ...]
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.22. `POST /couleurs` — Créer une couleur

```javascript
const createCouleur = async () => {
    setLoading(true)
    try {
        const response = await api_node.post('/couleurs', {
            name: newColorName,      // ex: 'Cyan'
            hex_code: newColorHex    // ex: '#00FFFF'
        })
        setMessage(`Couleur "${response.data.data.name}" créée (ID: ${response.data.data.id})`)
        await getCouleurs()
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

### 5.23. `PUT /couleurs/:id` — Modifier une couleur

```javascript
const updateCouleur = async (couleurId) => {
    setLoading(true)
    try {
        const response = await api_node.put(`/couleurs/${couleurId}`, {
            name: updatedColorName,    // ex: 'Cyan Sombre'
            hex_code: updatedColorHex  // ex: '#008B8B'
        })
        setMessage(`Couleur #${couleurId} modifiée en "${response.data.data.name}"`)
        await getCouleurs()
    } catch (e) {
        if (e.response?.status === 404) {
            setMessage('Couleur introuvable')
        } else {
            setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
        }
    } finally {
        setLoading(false)
    }
}
```

---

### 5.24. `DELETE /couleurs/:id` — Supprimer une couleur

```javascript
const deleteCouleur = async (couleurId) => {
    setLoading(true)
    try {
        await api_node.delete(`/couleurs/${couleurId}`)
        setMessage(`Couleur #${couleurId} supprimée`)
        setCouleurs(prev => prev.filter(c => c.id !== couleurId))
    } catch (e) {
        if (e.response?.status === 404) {
            setMessage('Couleur introuvable')
        } else {
            setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
        }
    } finally {
        setLoading(false)
    }
}
```

---

### 5.25. `POST /import/tickets` — Import CSV en masse

```javascript
const importTickets = async (ticketsArray) => {
    setLoading(true)
    try {
        const response = await api_node.post('/import/tickets', {
            tickets: ticketsArray
        })
        setMessage(`${response.data.count} ticket(s) importé(s) avec succès !`)
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

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
| `GET` | `/kanban_settings` | 5.18.1 | Lister tous les paramètres Kanban |
| `GET` | `/kanban_settings/:status_id` | 5.18.2 | Récupérer les paramètres d'un statut |
| `POST` | `/kanban_settings` | 5.19 | Modifier/Créer les paramètres Kanban |
| `PUT` | `/kanban_settings/:status_id` | 5.20 | Modifier les paramètres Kanban |
| `GET` | `/couleurs` | 5.21 | Lister toutes les couleurs |
| `POST` | `/couleurs` | 5.22 | Créer une couleur |
| `PUT` | `/couleurs/:id` | 5.23 | Modifier une couleur |
| `DELETE` | `/couleurs/:id` | 5.24 | Supprimer une couleur |
| `POST` | `/import/tickets` | 5.25 | Import CSV en masse |

---

## 7 . Structure tableau

```json
{
    "num_ticket": 101,
    "date": "2026-06-07",
    "heure": "09:30",
    "titre": "Écran HS",
    "description": "L'écran du bureau 12 ne s'allume plus",
    "status": "New",
    "priority": "High",
    "items": "[\"PC-001\"]"
}
```

---

## 8. Gestion des Couleurs (Kanban)

Cette section détaille les routes permettant de gérer les couleurs disponibles pour personnaliser l'interface. La liaison avec un statut et sa traduction se fait désormais via la table `kanban_settings`, mais est gérée de manière transparente par les requêtes `/statuses`.

### 8.1. Couleurs (`/couleurs`)

| Route | Description |
|-------|-------------|
| `GET /couleurs` | Liste toutes les couleurs définies |
| `POST /couleurs` | Crée une couleur → body: `{ "name": "Rouge", "hex_code": "#FF0000" }` |
| `PUT /couleurs/:id` | Modifie une couleur → body: `{ "name": "Rouge Vif", "hex_code": "#E60000" }` |
| `DELETE /couleurs/:id` | Supprime une couleur |

---

## 9. Historique des Statuts de Ticket

Cette section détaille les routes permettant de gérer l'historique des changements de statut d'un ticket via la table `t_ticket_statuses`.

### 9.1. CRUD Historique des statuts (`/ticket_history`)

| Route | Description |
|-------|-------------|
| `GET /ticket_history` | Liste tout l'historique — supporte **filtres + tri + pagination** combinables |
| `GET /ticket_history/ticket/:id_ticket` | Historique d'un ticket spécifique — supporte **tri + pagination** |
| `POST /ticket_history` | Crée une entrée → body: `{ "id_ticket": 1, "id_statuses": 2, "date": "2026-06-11T12:00:00.000Z", "description": "Déplacé vers En cours" }` |
| `PUT /ticket_history/:id` | Modifie une entrée → body: `{ "id_statuses": 3 }` |
| `DELETE /ticket_history/:id` | Supprime une entrée |

---

### 9.2. `GET /ticket_history` — Paramètres supportés

Tous les paramètres sont **optionnels et combinables simultanément**.

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `search` | string | — | Texte libre sur `ticket_titre` OU `status_name` |
| `id_ticket` | integer | — | Filtre par ID de ticket |
| `id_statuses` | integer | — | Filtre par ID de statut |
| `sort` | string | `h.date` | Colonne de tri (voir whitelist ci-dessous) |
| `order` | string | `desc` | Sens du tri : `asc` ou `desc` |
| `limit` | integer | — | Nombre de résultats (pagination) |
| `offset` | integer | `0` | Décalage pour la pagination |

**Colonnes de tri autorisées (`sort`) :**

| Valeur `sort` | Colonne SQL réelle |
|--------------|-------------------|
| `h.id` | `h.id` |
| `h.id_ticket` | `h.id_ticket` |
| `h.id_statuses` | `h.id_statuses` |
| `h.date` | `h.date` *(défaut)* |
| `ticket_titre` | `t.titre` |
| `status_name` | `s.name` |

**Exemples d'appel :**
```
GET /ticket_history                                                         → tout l'historique (trié par date desc)
GET /ticket_history?id_ticket=3                                             → historique du ticket 3
GET /ticket_history?id_statuses=2                                           → uniquement les passages en statut 2
GET /ticket_history?search=New                                              → recherche texte sur status_name
GET /ticket_history?id_ticket=3&sort=h.date&order=asc                      → ticket 3, chronologique
GET /ticket_history?id_statuses=2&sort=ticket_titre&order=asc              → statut 2, trié par titre
GET /ticket_history?search=New&sort=h.date&order=desc&limit=10&offset=0    → tout combiné, page 1
GET /ticket_history?id_ticket=5&id_statuses=1&sort=h.date&order=asc        → ticket 5 + statut 1, chrono
```

**Réponse de succès :**
```json
{
    "success": true,
    "data": [
        {
            "id": 12,
            "id_ticket": 3,
            "id_statuses": 2,
            "date": "2026-06-11T09:00:00.000Z",
            "description": "Déplacé vers En cours",
            "ticket_titre": "Écran HS",
            "status_name": "In Progress"
        }
    ],
    "total": 42,
    "offset": 0,
    "limit": 10
}
```

---

### 9.3. `GET /ticket_history/ticket/:id_ticket` — Paramètres supportés

Route raccourci déjà filtrée par ticket. Supporte `sort`, `order`, `limit`, `offset`.

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `sort` | string | `h.date` | `h.id`, `h.id_ticket`, `h.id_statuses`, `h.date`, `status_name` |
| `order` | string | `desc` | `asc` ou `desc` |
| `limit` | integer | — | Nombre de résultats |
| `offset` | integer | `0` | Décalage |

**Exemples :**
```
GET /ticket_history/ticket/5                                    → historique du ticket 5 (date desc)
GET /ticket_history/ticket/5?sort=h.date&order=asc             → chronologique
GET /ticket_history/ticket/5?sort=status_name&order=asc        → trié par nom de statut
GET /ticket_history/ticket/5?limit=5&offset=0                  → 5 premiers résultats
```

---

### 9.4. Exemples d'Intégration Frontend

#### `GET /ticket_history` — Tous les historiques (simple)

```javascript
const getAllHistory = async () => {
    setLoading(true)
    try {
        const response = await api_node.get('/ticket_history')
        setHistory(response.data.data)
        // response.data.total → nombre total d'entrées
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

#### `GET /ticket_history` — Avec filtres + tri + pagination combinés

```javascript
const getFilteredHistory = async () => {
    setLoading(true)
    try {
        const params = {}
        if (searchQuery)      params.search      = searchQuery      // texte libre
        if (selectedTicket)   params.id_ticket   = selectedTicket   // ID du ticket
        if (selectedStatuses) params.id_statuses = selectedStatuses // ID du statut
        if (sortCol)          params.sort        = sortCol          // ex: 'ticket_titre', 'h.date'
        if (sortDir)          params.order       = sortDir          // 'asc' | 'desc'
        params.limit  = pageSize          // ex: 10 résultats par page
        params.offset = page * pageSize   // ex: page 2 → offset 20

        const response = await api_node.get('/ticket_history', { params })
        setHistory(response.data.data)
        setTotal(response.data.total)  // total sans pagination → pour le paginator
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

#### `GET /ticket_history/ticket/:id_ticket` — Historique d'un ticket (avec tri)

```javascript
const getTicketHistory = async (ticketId, sortCol = 'h.date', sortDir = 'desc') => {
    setLoading(true)
    try {
        const response = await api_node.get(`/ticket_history/ticket/${ticketId}`, {
            params: { sort: sortCol, order: sortDir }
        })
        setHistory(response.data.data)
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

#### `POST /ticket_history` — Créer une entrée d'historique

**Corps de la requête (JSON) :**

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `id_ticket` | integer | ✅ | ID du ticket |
| `id_statuses` | integer | ✅ | ID du statut destination |
| `date` | string | — | Date ISO 8601 (défaut : date actuelle) |
| `description` | string | — | Commentaire / raison du changement (peut être vide) |

```javascript
const createHistoryEntry = async (ticketId, statusId, date, description) => {
    setLoading(true)
    try {
        await api_node.post('/ticket_history', {
            id_ticket:   ticketId,
            id_statuses: statusId,
            date:        date || new Date().toISOString(), // format ISO 8601
            description: description || ''                // peut être vide
        })
        setMessage('Historique ajouté')
        await getTicketHistory(ticketId)
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

**Exemple d'appel depuis le Kanban (après prompt utilisateur) :**
```javascript
const date = window.prompt(`Entrez la date du déplacement (ex: ${new Date().toISOString().slice(0, 10)})`)
if (date === null) return

const description = window.prompt(`Entrez une description pour ce déplacement vers "${statusDestination?.label}"`)
if (description === null) return
```

#### `PUT /ticket_history/:id` — Modifier une entrée d'historique

```javascript
const updateHistoryEntry = async (historyId, newStatusId) => {
    setLoading(true)
    try {
        await api_node.put(`/ticket_history/${historyId}`, {
            id_statuses: newStatusId
        })
        setMessage('Historique mis à jour')
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

#### `DELETE /ticket_history/:id` — Supprimer une entrée d'historique

```javascript
const deleteHistoryEntry = async (historyId) => {
    setLoading(true)
    try {
        await api_node.delete(`/ticket_history/${historyId}`)
        setMessage('Historique supprimé')
        setHistory(prev => prev.filter(h => h.id !== historyId))
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

---

## 10. Gestion des Coûts (t_ticket_cout)

Cette section détaille les routes permettant de gérer les coûts associés aux tickets via la table `t_ticket_cout`.

### 10.1. CRUD Coûts (`/ticket_cout`)

| Route | Description |
|-------|-------------|
| `GET /ticket_cout` | Liste tous les coûts (optionnel : filtrer par `?id_ticket=X`) |
| `POST /ticket_cout` | Ajoute un coût → body: `{ "id_ticket": 1, "cout": 150.5 }` |
| `PUT /ticket_cout/:id` | Modifie un coût existant → body: `{ "cout": 200 }` |
| `DELETE /ticket_cout/:id` | Supprime un coût |

### 10.2. Exemples d'Intégration Frontend

#### `GET /ticket_cout` — Récupérer les coûts (pour un ticket)

```javascript
const getTicketCouts = async (ticketId) => {
    setLoading(true)
    try {
        const response = await api_node.get(`/ticket_cout`, {
            params: { id_ticket: ticketId }
        })
        setCouts(response.data.data)
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

#### `POST /ticket_cout` — Ajouter un coût

```javascript
const addTicketCout = async (ticketId, montant) => {
    setLoading(true)
    try {
        await api_node.post('/ticket_cout', {
            id_ticket: ticketId,
            cout: montant
        })
        setMessage('Coût ajouté avec succès')
        await getTicketCouts(ticketId) // Rafraîchir
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

#### `PUT /ticket_cout/:id` — Modifier un coût

```javascript
const updateTicketCout = async (coutId, nouveauMontant) => {
    setLoading(true)
    try {
        await api_node.put(`/ticket_cout/${coutId}`, {
            cout: nouveauMontant
        })
        setMessage('Coût mis à jour')
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```

#### `DELETE /ticket_cout/:id` — Supprimer un coût

```javascript
const deleteTicketCout = async (coutId) => {
    setLoading(true)
    try {
        await api_node.delete(`/ticket_cout/${coutId}`)
        setMessage('Coût supprimé')
        setCouts(prev => prev.filter(c => c.id !== coutId))
    } catch (e) {
        setMessage(`Erreur : ${e.response?.data?.error || e.message}`)
    } finally {
        setLoading(false)
    }
}
```
