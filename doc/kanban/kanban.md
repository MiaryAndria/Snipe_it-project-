# Documentation du Kanban

Cette documentation explique le fonctionnement du tableau Kanban dans l'application et présente plusieurs variantes de Kanban possibles.

---

## 1. Vue d'ensemble

Le composant Kanban affiche les tickets sous forme de cartes réparties dans des colonnes. Chaque colonne correspond à un statut. L'utilisateur peut déplacer les tickets d'une colonne à l'autre via le Drag and Drop.

---

## 2. État du Composant (Les States à créer)

Voici les states (`useState`) nécessaires pour faire fonctionner le composant Kanban (données, gestion du Drag & Drop, et modale) :

```jsx
// 1. Données principales
const [ticket, setTicket] = useState([])            // Liste de tous les tickets
const [statuses, setStatuses] = useState([])        // Les statuts (colonnes du Kanban)
const [kanbanSetting, setKanbanSetting] = useState([]) // Config (couleurs, traductions)
const [couleur, setCouleur] = useState([])          // Liste des couleurs disponibles

// 2. Données pour le formulaire (Modale)
const [priorities, setPriorities] = useState([])    // Liste des priorités
const [items, setItems] = useState([])              // Liste des équipements (Assets)

// 3. Gestion de l'affichage de la Modale
const [isModalOpen, setIsModalOpen] = useState(false)

// 4. Champs du formulaire de création de ticket
const [titre, setTitre] = useState('')
const [description, setDescription] = useState('')
const [selectedPriority, setSelectedPriority] = useState('')
const [idsSelectionnes, setIdsSelectionnes] = useState([]) // Équipements cochés
```

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

## 4. Structure Globale Découpée (Skeleton)

Voici la structure recommandée pour construire le Kanban. C'est une version "découpée" (skeleton) sans les données complexes, qui vous montre exactement **où placer chaque élément**.

```jsx
return (
    <div className="kanban-page">
        {/* 1. Titre de la page */}
        <h1 className="kanban-page-title">Liste des tickets</h1>
        
        {/* 2. Zone du Kanban avec le contexte Drag & Drop */}
        <DragDropContext onDragEnd={onDrag}>
            <div className="kanban">
                
                {/* 3. Boucle sur les colonnes (statuts) */}
                {statuses.map(s => (
                    <Droppable key={s.id} droppableId={String(s.id)}>
                        {(provided) => (
                            <div 
                                ref={provided.innerRef} 
                                {...provided.droppableProps} 
                                className="kanban-column"
                            >
                                {/* 3a. En-tête de la colonne (Titre et Compteur) */}
                                <h3>Nom de la colonne</h3>
                                
                                {/* 3b. Boucle sur les cartes de cette colonne */}
                                {ticketsFiltres.map((t, index) => (
                                    <Draggable key={String(t.id)} draggableId={String(t.id)} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps} 
                                                className="kanban-card"
                                            >
                                                {/* Contenu de la carte (ID, Titre, etc.) */}
                                                <strong>#{t.num_ticket}</strong>
                                                <p>{t.titre}</p>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}

                                {/* 3c. Placeholder obligatoire pour react-beautiful-dnd */}
                                {provided.placeholder}

                                {/* 3d. Bouton d'ajout (généralement dans la première colonne) */}
                                <button onClick={handleCreateTicket}>+ Ajouter ticket</button>

                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>

        {/* 4. Zone Modale (Affichée conditionnellement en superposition) */}
        {isModalOpen && (
            <div className="modal-overlay">
                <form className="custom-modal" onSubmit={ajouterTicket}>
                    <h2>Créer un ticket</h2>
                    
                    {/* Champs du formulaire */}
                    <div className="modal-field">
                        <label>Titre</label>
                        <input type="text" />
                    </div>
                    
                    {/* Actions de la modale */}
                    <div className="modal-actions">
                        <button type="button" className="btn-annuler">Annuler</button>
                        <button type="submit" className="btn-submit">Valider</button>
                    </div>
                </form>
            </div>
        )}
    </div>
)
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

## 7. Variantes de Drag & Drop (Format Généralisé)

Voici des logiques complètes (State + `onDrag` + Rendu JSX) utilisant des noms génériques (`colonnes`, `items`, `itemDraggable`) pour que vous puissiez les adapter à **n'importe quelle situation** (pas seulement des tickets).

### Variante A : Drag & Drop avec Recherche et Filtrage

Permet de filtrer visuellement les éléments (par texte ou autre) sans casser le fonctionnement du Drag & Drop.

```jsx
// 1. States
const [items, setItems] = useState([])       // Les éléments à glisser
const [colonnes, setColonnes] = useState([]) // Les conteneurs
const [recherche, setRecherche] = useState('')

// 2. Application du filtre (Avant le return)
const itemsFiltres = items.filter(item => item.nom.toLowerCase().includes(recherche.toLowerCase()))

// 3. Fonction onDrag
const onDrag = async (result) => {
    const { destination, source, draggableId } = result
    
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newColonneId = destination.droppableId

    // Mise à jour optimiste sur le state GLOBAL (items), PAS sur les éléments filtrés !
    setItems(prev => prev.map(item =>
        String(item.id) === draggableId ? { ...item, colonne_id: newColonneId } : item
    ))

    // Appel API (si nécessaire)
    // await api.put(`/items/${draggableId}`, { colonne_id: newColonneId })
}

// 4. Rendu JSX
return (
    <DragDropContext onDragEnd={onDrag}>
        <div className="kanban">
            {colonnes.map(colonne => (
                <Droppable key={colonne.id} droppableId={String(colonne.id)}>
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="kanban-column">
                            <h3>{colonne.titre}</h3>
                            
                            {/* On filtre les items pour n'afficher que ceux de cette colonne */}
                            {itemsFiltres.filter(item => item.colonne_id === String(colonne.id)).map((itemDraggable, index) => (
                                <Draggable key={String(itemDraggable.id)} draggableId={String(itemDraggable.id)} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="kanban-card">
                                            {itemDraggable.nom}
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
    </DragDropContext>
)
```

---

### Variante B : Drag & Drop avec Limite de Capacité (WIP)

Bloque le déplacement si la colonne de destination a déjà atteint sa limite maximale.

```jsx
// 1. States
const [items, setItems] = useState([])
const [colonnes, setColonnes] = useState([])

// Définition des limites (Format: ID colonne -> Limite max)
const limitesCapacite = { "col_1": 999, "col_2": 3, "col_3": 5 } 

// 2. Fonction onDrag avec vérification
const onDrag = async (result) => {
    const { destination, source, draggableId } = result
    
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newColonneId = destination.droppableId
    
    // Compter le nombre d'éléments DÉJÀ présents dans la destination
    const itemsDansDestination = items.filter(item => item.colonne_id === newColonneId)

    // Bloquer si la limite est atteinte
    if (itemsDansDestination.length >= (limitesCapacite[newColonneId] || 999)) {
        alert("Limite atteinte pour cette colonne !")
        return // On annule le Drag & Drop
    }

    // Mise à jour optimiste
    setItems(prev => prev.map(item =>
        String(item.id) === draggableId ? { ...item, colonne_id: newColonneId } : item
    ))
}

// 3. Rendu JSX
return (
    <DragDropContext onDragEnd={onDrag}>
        <div className="kanban">
            {colonnes.map(colonne => {
                const itemsDansColonne = items.filter(item => item.colonne_id === String(colonne.id))
                
                return (
                    <Droppable key={colonne.id} droppableId={String(colonne.id)}>
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className="kanban-column">
                                <h3>
                                    {colonne.titre} 
                                    <span> ({itemsDansColonne.length} / {limitesCapacite[colonne.id]})</span>
                                </h3>
                                
                                {itemsDansColonne.map((itemDraggable, index) => (
                                    <Draggable key={String(itemDraggable.id)} draggableId={String(itemDraggable.id)} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="kanban-card">
                                                {itemDraggable.nom}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                )
            })}
        </div>
    </DragDropContext>
)
```

---

### Variante C : Drag & Drop Multi-Sélection (Batch Update)

Permet de cocher plusieurs éléments et de les glisser tous en même temps vers un autre conteneur.

```jsx
// 1. States
const [items, setItems] = useState([])
const [colonnes, setColonnes] = useState([])
const [idsSelectionnes, setIdsSelectionnes] = useState([]) // Les cases cochées

// Fonction pour cocher/décocher un élément
const toggleSelection = (itemId) => {
    setIdsSelectionnes(prev => 
        prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    )
}

// 2. Fonction onDrag pour le groupe
const onDrag = async (result) => {
    const { destination, source, draggableId } = result
    
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newColonneId = destination.droppableId

    // Déterminer la liste des éléments à déplacer 
    let idsToMove = [draggableId]
    // Si l'élément glissé fait partie de la sélection, on déplace toute la sélection
    if (idsSelectionnes.includes(draggableId)) {
        idsToMove = [...new Set([...idsSelectionnes, draggableId])]
    }

    // Mise à jour optimiste en bloc
    setItems(prev => prev.map(item =>
        idsToMove.includes(String(item.id)) ? { ...item, colonne_id: newColonneId } : item
    ))

    // Vider la sélection après le déplacement
    setIdsSelectionnes([])
}

// 3. Rendu JSX
return (
    <DragDropContext onDragEnd={onDrag}>
        <div className="kanban">
            {colonnes.map(colonne => (
                <Droppable key={colonne.id} droppableId={String(colonne.id)}>
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="kanban-column">
                            <h3>{colonne.titre}</h3>
                            
                            {items.filter(item => item.colonne_id === String(colonne.id)).map((itemDraggable, index) => (
                                <Draggable key={String(itemDraggable.id)} draggableId={String(itemDraggable.id)} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="kanban-card">
                                            
                                            {/* La Checkbox pour la Multi-Sélection */}
                                            <input 
                                                type="checkbox" 
                                                checked={idsSelectionnes.includes(String(itemDraggable.id))}
                                                onChange={() => toggleSelection(String(itemDraggable.id))} 
                                            />
                                            {itemDraggable.nom}
                                            
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
    </DragDropContext>
)
```
