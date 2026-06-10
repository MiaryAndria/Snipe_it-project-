# Documentation du Kanban

Cette documentation explique le fonctionnement du tableau Kanban dans l'application et présente plusieurs variantes de Kanban possibles.

---

## 1. Vue d'ensemble

Le composant Kanban affiche les tickets sous forme de cartes réparties dans des colonnes. Chaque colonne correspond à un statut. L'utilisateur peut déplacer les tickets d'une colonne à l'autre via le Drag and Drop.

---

## 2. État du Composant (State)

| State | Type | Rôle |
|---|---|---|
| `ticket` | `array` | Liste globale de tous les tickets |
| `statuses` | `array` | Statuts disponibles → définissent les colonnes |
| `kanbanSetting` | `array` | Configuration (libellé traduit, couleur par statut) |
| `couleur` | `array` | Dictionnaire des couleurs hex disponibles |
| `priorities` | `array` | Priorités disponibles pour la création |
| `items` | `array` | Équipements matériels pouvant être liés aux tickets |

---

## 3. Chargement des données

Au montage du composant (`useEffect` avec `[]`), toutes les données sont chargées en parallèle :

```js
useEffect(() => {
    getPriorities()
    getAllKanbanSetting()
    getItems()
    getTicket()
    getCouleur()
    getStatuses()
}, [])
```

---

## 4. Structure du Rendu

```
DragDropContext (onDragEnd = onDrag)
  └── .kanban (flex container)
        └── Droppable (pour chaque statut)
              ├── h3 : Nom de la colonne (libellé personnalisé ou nom par défaut)
              ├── h3 : Compteur de tickets
              ├── Draggable (pour chaque ticket de la colonne)
              │     └── Carte : numéro + titre cliquable
              ├── provided.placeholder
              └── Bouton "+ Ajouter ticket" (si colonne ID = 1)
```

---

## 5. La Logique de Mise à Jour (Drag and Drop)

```javascript
const onDrag = async (result) => {
    const { destination, source, draggableId } = result

    if (!destination) return  // Lâché dans le vide
    if (destination.droppableId == source.droppableId
        && destination.index == source.index) return  // Même position

    const newStatusId = parseInt(destination.droppableId)

    // Mise à jour optimiste : UI réactive immédiatement
    setTicket(prev =>
        prev.map(t =>
            String(t.id) === draggableId
                ? { ...t, status_id: newStatusId }
                : t
        )
    )

    // Persistance en arrière-plan
    try {
        await api_ticket.put(`/tickets/${draggableId}`, { status_id: newStatusId })
    } catch (e) {
        console.log(e)
        // TODO : implémenter un rollback ici si l'API échoue
    }
}
```

**Mise à jour Optimiste** : L'UI se met à jour instantanément sans attendre la réponse du serveur. L'appel API se fait en tâche de fond pour persister la nouvelle position.

---

## 6. Personnalisation via `kanbanSetting`

Le tableau `kanbanSetting` permet de sur-configurer chaque colonne :

```js
// Récupère la configuration pour le statut courant
const StatusParKanban = kanbanSetting.find(k => k.status_id === s.id)

// Récupère la couleur de fond définie
const Couleur = couleur.find(c => c.id === StatusParKanban?.couleur_id)
```

```jsx
<div
    style={{ backgroundColor: Couleur?.hex_code }}  // Couleur de fond dynamique
>
    <h3>{StatusParKanban?.label_traduction || s.name}</h3>  // Libellé traduit ou défaut
</div>
```

---

## 7. Variantes de Kanban

### Variante A : Kanban avec Swimlanes (Lignes horizontales)

Adapté pour organiser par **utilisateur** ou **équipe** en plus des statuts.

```
           | À faire | En cours | Terminé |
-----------+---------+----------+---------+
Alice      |  [T1]   |          |  [T3]   |
-----------+---------+----------+---------+
Bob        |         |  [T2]    |         |
```

**Principe :**
- 2 niveaux d'imbrication : d'abord les utilisateurs (swimlane), puis les statuts.
- Chaque intersection est une zone `Droppable` avec un ID composé : `droppableId="alice_todo"`.

```jsx
{utilisateurs.map(user => (
    <div key={user.id} style={{ display: "flex" }}>
        <div style={{ width: "120px", fontWeight: "bold" }}>{user.nom}</div>
        {statuses.map(s => (
            <Droppable key={s.id} droppableId={`${user.id}_${s.id}`}>
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}
                         style={{ minWidth: "180px", minHeight: "100px",
                                  border: "1px solid #ddd", padding: "8px" }}>
                        {tickets
                            .filter(t => t.status_id === s.id && t.user_id === user.id)
                            .map((t, index) => (
                            <Draggable key={String(t.id)} draggableId={String(t.id)} index={index}>
                                {(provided) => (
                                    <div ref={provided.innerRef}
                                         {...provided.draggableProps}
                                         {...provided.dragHandleProps}
                                         style={{ background: "#fff", padding: "6px",
                                                  ...provided.draggableProps.style }}>
                                        {t.titre}
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        ))}
    </div>
))}
```

---

### Variante B : Kanban avec Priorités (Badges visuels)

Adapté pour visualiser la criticité d'un coup d'œil. Les cartes ont des couleurs selon leur priorité.

```jsx
const couleurPriorite = {
    "Critical": "#ff4d4f",
    "High":     "#fa8c16",
    "Medium":   "#fadb14",
    "Low":      "#52c41a"
}

// Dans la carte Draggable :
<div
    ref={provided.innerRef}
    {...provided.draggableProps}
    {...provided.dragHandleProps}
    style={{
        borderLeft: `4px solid ${couleurPriorite[t.priority] || "#aaa"}`,
        padding: "8px",
        background: "#fff",
        ...provided.draggableProps.style
    }}
>
    <span style={{ fontSize: "10px", color: couleurPriorite[t.priority] }}>
        ● {t.priority}
    </span>
    <p>{t.titre}</p>
</div>
```

---

### Variante C : Kanban avec Limite WIP (Work In Progress)

Le Kanban professionnel impose une limite maximale de tickets par colonne pour ne pas surcharger l'équipe.

```jsx
const limiteWIP = { 1: 999, 2: 3, 3: 5, 4: 999 }  // ID statut → limite max

const onDrag = async (result) => {
    const { destination } = result
    if (!destination) return

    const newStatusId = parseInt(destination.droppableId)
    const ticketsDansDestination = ticket.filter(t => t.status_id === newStatusId)

    // Vérification de la limite WIP
    if (ticketsDansDestination.length >= (limiteWIP[newStatusId] || 999)) {
        setMessage(`⚠️ Limite WIP atteinte pour cette colonne (max ${limiteWIP[newStatusId]})`)
        return
    }

    // ... suite du logic normal
}

// Affichage de la limite dans l'en-tête de colonne
<h3>
    {s.name}
    <span style={{ fontSize: "12px", color: ticketsFiltres.length >= limiteWIP[s.id] ? "red" : "#999" }}>
        {ticketsFiltres.length}/{limiteWIP[s.id] || "∞"}
    </span>
</h3>
```

---

### Variante D : Kanban avec Recherche et Filtrage par Priorité

```jsx
const [recherche, setRecherche] = useState('')
const [filtresPrio, setFiltresPrio] = useState([])

const togglePrio = (p) => setFiltresPrio(prev =>
    prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
)

// Filtrage des tickets à l'affichage
const ticketsFiltres = ticket.filter(t => {
    const matchTitre = t.titre.toLowerCase().includes(recherche.toLowerCase())
    const matchPrio  = filtresPrio.length === 0 || filtresPrio.includes(t.priority)
    return matchTitre && matchPrio
})
```

Puis dans le rendu on remplace `ticket.filter(...)` par :
```jsx
const ticketsColonne = ticketsFiltres.filter(t => t.status_id === s.id)
```

> [!IMPORTANT]
> Lors du filtrage, le Drag and Drop reste fonctionnel car il opère toujours sur le `ticket` complet (state global), pas sur la liste filtrée.

---

### Variante E : Kanban Minimal (Sans Backend)

Utile pour un prototype ou un usage purement local (ex: tableau de bord personnel).

```jsx
const [colonnes, setColonnes] = useState({
    "todo":    { titre: "📋 À faire",  couleur: "#e3f2fd", tickets: ["Réunion lundi", "Rapport mensuel"] },
    "inprog":  { titre: "🔄 En cours", couleur: "#fff3e0", tickets: ["Refactoring API"] },
    "done":    { titre: "✅ Terminé",   couleur: "#e8f5e9", tickets: ["Mise à jour librairie"] }
})

const onDragEnd = ({ source, destination }) => {
    if (!destination) return
    const srcCol  = colonnes[source.droppableId]
    const dstCol  = colonnes[destination.droppableId]
    const srcItems = Array.from(srcCol.tickets)
    const dstItems = source.droppableId === destination.droppableId
                     ? srcItems : Array.from(dstCol.tickets)

    const [deplace] = srcItems.splice(source.index, 1)
    dstItems.splice(destination.index, 0, deplace)

    setColonnes(prev => ({
        ...prev,
        [source.droppableId]:      { ...srcCol, tickets: srcItems },
        [destination.droppableId]: { ...dstCol, tickets: dstItems }
    }))
}
```

---

## 8. Tableau Comparatif des Variantes

| Variante | Points Forts | Cas d'Usage Idéal |
|---|---|---|
| Kanban Standard (Projet) | Simple, clair, statuts visuels | Gestion de tickets, bugs |
| Swimlanes (A) | Vue par utilisateur/équipe | Gestion d'équipe, planning RH |
| Badges Priorité (B) | Criticité visible immédiatement | Support technique, incidents |
| WIP Limité (C) | Évite la surcharge, méthode Lean | Équipes Agile/Scrum strictes |
| Recherche + Filtre (D) | Navigation dans beaucoup de tickets | Grands projets, +50 tickets |
| Minimal sans Backend (E) | Rapide à mettre en place | Prototype, usage personnel |
