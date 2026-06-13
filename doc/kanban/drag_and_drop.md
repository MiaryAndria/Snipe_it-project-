# Documentation Drag and Drop — @hello-pangea/dnd
hello-pangea/dnd draggable et droppable prend toujours string dcp c'est mieux si on utilise toujours string 

Cette documentation couvre l'ensemble des cas d'usage du Drag and Drop avec la bibliothèque `@hello-pangea/dnd` (fork moderne de `react-beautiful-dnd`).

---

## 1. Les 3 Composants Fondamentaux

Tout système DnD repose sur cette hiérarchie stricte :

| Composant | Rôle | Analogie |
|---|---|---|
| `<DragDropContext>` | Cerveau global, écoute les événements | Arbitre du terrain |
| `<Droppable>` | Zone où l'on peut déposer un élément | La "boîte réceptrice" |
| `<Draggable>` | Élément que l'on peut saisir et déplacer | La "carte à saisir" |

---

## 2. Le rôle de `provided`

`provided` est un objet injecté par la librairie via le motif "Render Props". Il contient les capteurs techniques nécessaires pour connecter vos `<div>` au moteur DnD.

### Dans un `<Droppable>`

```jsx
<Droppable droppableId="zone-1">
  {(provided) => (
    <div
      ref={provided.innerRef}       // Connecte le DOM pour calculer position/dimensions
      {...provided.droppableProps}  // Active la zone comme réceptacle DnD
    >
      {/* Éléments */}
      {provided.placeholder}        // Maintient l'espace vide pendant le drag
    </div>
  )}
</Droppable>
```

### Dans un `<Draggable>`

```jsx
<Draggable draggableId="item-1" index={0}>
  {(provided) => (
    <div
      ref={provided.innerRef}          // Cible l'élément déplacé
      {...provided.draggableProps}     // Applique les styles de mouvement (transform CSS)
      {...provided.dragHandleProps}    // Définit la zone "poignée" pour attraper l'élément
    >
      Mon élément
    </div>
  )}
</Draggable>
```

---

## 3. Cas d'Usage : Réorganisation Simple (Tri d'une Liste)

**Objectif :** Permettre à l'utilisateur de réordonner des éléments dans une seule liste (ex: to-do list, liste de priorités).

**Logique du `onDragEnd` :** On fait un `splice` pour retirer l'élément et le réinsérer au bon index.

```jsx
function ListeTriable() {
    const [items, setItems] = useState([
        { id: "1", nom: "Tâche A" },
        { id: "2", nom: "Tâche B" },
        { id: "3", nom: "Tâche C" }
    ]);

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const copie = Array.from(items);
        const [elementDeplace] = copie.splice(result.source.index, 1);
        copie.splice(result.destination.index, 0, elementDeplace);

        setItems(copie);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="liste-unique">
                {(provided) => (
                    <ul ref={provided.innerRef} {...provided.droppableProps}>
                        {items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided) => (
                                    <li
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{ padding: "8px", margin: "4px",
                                                 backgroundColor: "#f4f4f4",
                                                 ...provided.draggableProps.style }}
                                    >
                                        ≡ {item.nom}
                                    </li>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </ul>
                )}
            </Droppable>
        </DragDropContext>
    );
}
```

---

## 4. Cas d'Usage : Kanban (Déplacement entre plusieurs listes)

**Objectif :** Déplacer une carte d'une colonne à l'autre. La colonne est la zone `Droppable`, la carte est le `Draggable`.

**Logique du `onDragEnd` :** On trouve la colonne source et la colonne destination, on retire la carte de la source, on l'insère dans la destination.

```jsx
const colonnes = {
    "todo":    { titre: "À faire",  items: [{ id: "t1", texte: "Bug login" }] },
    "in-prog": { titre: "En cours", items: [{ id: "t2", texte: "API tickets" }] },
    "done":    { titre: "Terminé",  items: [] }
};

function KanbanSimple() {
    const [data, setData] = useState(colonnes);

    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId
            && source.index === destination.index) return;

        const colSource = data[source.droppableId];
        const colDest   = data[destination.droppableId];

        // Copie des tableaux d'items
        const itemsSource = Array.from(colSource.items);
        const itemsDest   = source.droppableId === destination.droppableId
                            ? itemsSource
                            : Array.from(colDest.items);

        const [deplace] = itemsSource.splice(source.index, 1);
        itemsDest.splice(destination.index, 0, deplace);

        setData(prev => ({
            ...prev,
            [source.droppableId]:      { ...colSource, items: itemsSource },
            [destination.droppableId]: { ...colDest,   items: itemsDest }
        }));
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div style={{ display: "flex", gap: "16px" }}>
                {Object.entries(data).map(([colId, col]) => (
                    <Droppable key={colId} droppableId={colId}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{ background: "#eee", padding: "8px",
                                         minHeight: "200px", minWidth: "180px" }}
                            >
                                <h3>{col.titre}</h3>
                                {col.items.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{ background: "#fff", margin: "4px",
                                                         padding: "8px", borderRadius: "4px",
                                                         ...provided.draggableProps.style }}
                                            >
                                                {item.texte}
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
    );
}
```

---

## 5. Cas d'Usage : Tableau (Réorganisation de lignes d'un tableau)

**Objectif :** Permettre de réordonner les lignes d'un `<table>` HTML par drag and drop.

> [!WARNING]
> `<table>`, `<tbody>`, `<tr>` sont des éléments HTML avec des règles strictes. Il faut utiliser `droppableId` sur le `<tbody>` et `draggableId` sur chaque `<tr>`.

```jsx
const colonnesTableau = ["Nom", "Département", "Priorité"];

function TableauTriable() {
    const [lignes, setLignes] = useState([
        { id: "r1", nom: "Alice",   dept: "IT",      priorite: "Haute" },
        { id: "r2", nom: "Bob",     dept: "Finance",  priorite: "Basse" },
        { id: "r3", nom: "Charlie", dept: "Support",  priorite: "Moyenne" }
    ]);

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const copie = Array.from(lignes);
        const [deplace] = copie.splice(result.source.index, 1);
        copie.splice(result.destination.index, 0, deplace);
        setLignes(copie);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        <th></th> {/* Colonne pour l'icône de déplacement */}
                        {colonnesTableau.map(c => <th key={c}>{c}</th>)}
                    </tr>
                </thead>
                <Droppable droppableId="tableau" direction="vertical">
                    {(provided) => (
                        <tbody ref={provided.innerRef} {...provided.droppableProps}>
                            {lignes.map((ligne, index) => (
                                <Draggable key={ligne.id} draggableId={ligne.id} index={index}>
                                    {(provided) => (
                                        <tr
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            style={{ background: "#fff", borderBottom: "1px solid #ddd",
                                                     ...provided.draggableProps.style }}
                                        >
                                            {/* La poignée est séparée : seulement l'icône est draggable */}
                                            <td {...provided.dragHandleProps}
                                                style={{ cursor: "grab", padding: "8px", color: "#999" }}>
                                                ⠿
                                            </td>
                                            <td style={{ padding: "8px" }}>{ligne.nom}</td>
                                            <td style={{ padding: "8px" }}>{ligne.dept}</td>
                                            <td style={{ padding: "8px" }}>{ligne.priorite}</td>
                                        </tr>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </tbody>
                    )}
                </Droppable>
            </table>
        </DragDropContext>
    );
}
```

> [!TIP]
> Dans cet exemple, `dragHandleProps` est placé uniquement sur la cellule `<td>` avec l'icône `⠿` et **non** sur toute la ligne. Cela permet de cliquer normalement sur les autres cellules (boutons, liens) sans déclencher le drag.

---

## 6. Cas d'Usage : Filtrage + Drag and Drop

**Objectif :** Afficher une liste filtrée (par recherche, par catégorie) tout en maintenant le drag and drop fonctionnel.

> [!IMPORTANT]
> **Le piège classique :** `result.source.index` et `result.destination.index` sont des index **visuels** (position dans la liste filtrée), pas des index dans le tableau `items` complet. Si vous les utilisez directement sur `items`, vous réorganisez le mauvais élément.

### La mauvaise approche ❌ (bug silencieux)

```js
const onDragEnd = (result) => {
    if (!result.destination) return
    const copie = Array.from(items)  // Liste complète
    // BUG : source.index = position dans itemsFiltres, pas dans items !
    const [deplace] = copie.splice(result.source.index, 1)
    copie.splice(result.destination.index, 0, deplace)
    setItems(copie)
}

// Dans le rendu :
{itemsFiltres.map((item, filteredIndex) => (
    <Draggable index={filteredIndex}>  // ← filteredIndex = index visuel, OK pour la vue
```

### La bonne approche ✅ (via findIndex sur l'ID)

```jsx
function ListeFiltrable() {
    const [items, setItems] = useState([
        { id: "1", nom: "Bug login",        categorie: "Bug" },
        { id: "2", nom: "Nouvelle feature", categorie: "Feature" },
        { id: "3", nom: "Bug paiement",     categorie: "Bug" },
        { id: "4", nom: "Refactoring API",  categorie: "Tech" }
    ])
    const [filtre, setFiltre] = useState("")

    const itemsFiltres = items.filter(item =>
        !filtre || item.categorie.toLowerCase().includes(filtre.toLowerCase())
    )

    const onDragEnd = (result) => {
        if (!result.destination) return

        // 1. Retrouver les objets depuis la liste FILTRÉE (positions visuelles)
        const sourceItem = itemsFiltres[result.source.index]
        const destItem   = itemsFiltres[result.destination.index]

        // 2. Retrouver leurs VRAIS index dans la liste complète via l'ID
        const realSourceIndex = items.findIndex(i => i.id === sourceItem.id)
        const realDestIndex   = items.findIndex(i => i.id === destItem.id)

        // 3. Réordonner la liste complète avec les vrais index
        const copie = Array.from(items)
        const [deplace] = copie.splice(realSourceIndex, 1)
        copie.splice(realDestIndex, 0, deplace)

        setItems(copie)
    }

    return (
        <div>
            <select value={filtre} onChange={(e) => setFiltre(e.target.value)}>
                <option value="">Tous</option>
                <option value="Bug">Bug</option>
                <option value="Feature">Feature</option>
                <option value="Tech">Tech</option>
            </select>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="liste-filtree">
                    {(provided) => (
                        <ul ref={provided.innerRef} {...provided.droppableProps}
                            style={{ listStyle: "none", padding: 0 }}>

                            {/* On itère sur itemsFiltres (liste filtrée) */}
                            {itemsFiltres.map((item, filteredIndex) => (
                                <Draggable
                                    key={item.id}
                                    draggableId={item.id}
                                    index={filteredIndex}  // index VISUEL dans la liste filtrée
                                >
                                    {(provided) => (
                                        <li
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{ padding: "8px", margin: "4px",
                                                     background: "#e8f4fd", borderRadius: "6px",
                                                     ...provided.draggableProps.style }}
                                        >
                                            [{item.categorie}] {item.nom}
                                        </li>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    )
}
```

### Schéma mental du filtrage

```
items (liste complète) :    [A, B, C, D, E]    ← index réels : 0, 1, 2, 3, 4
filtre "Bug" actif :        [A, C, E]           ← ce que l'utilisateur voit
                             ↑  ↑  ↑
index Draggable (visuels) :  0  1  2

→ Drag C (visuel 1) avant A (visuel 0) :
  result.source.index      = 1   (position de C dans itemsFiltres)
  result.destination.index = 0   (position de A dans itemsFiltres)

  sourceItem = itemsFiltres[1] = C
  destItem   = itemsFiltres[0] = A

  items.findIndex(C) = 2  (vrai index dans items)
  items.findIndex(A) = 0  (vrai index dans items)

  → splice(items, realSourceIndex=2, realDestIndex=0)
  → résultat : [C, A, B, D, E]
```

> [!TIP]
> Quand le filtre est actif (`filtre !== ""`), le drag ne réorganise que parmi les éléments visibles. Les éléments cachés par le filtre gardent leur position relative dans `items`.

---

## 7. Cas d'Usage : Direction Horizontale

Par défaut le drag est vertical. On peut passer à un mode **horizontal** (ex: carrousel, réorganisation de colonnes).

```jsx
<Droppable droppableId="liste-horizontale" direction="horizontal">
    {(provided) => (
        <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ display: "flex", flexDirection: "row", gap: "8px", overflowX: "auto" }}
        >
            {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ minWidth: "120px", padding: "12px",
                                     background: "#f0e6ff", borderRadius: "8px",
                                     textAlign: "center",
                                     ...provided.draggableProps.style }}
                        >
                            {item.nom}
                        </div>
                    )}
                </Draggable>
            ))}
            {provided.placeholder}
        </div>
    )}
</Droppable>
```

---

## 8. `snapshot` — Le 2ème Paramètre (Souvent Oublié)

En plus de `provided`, chaque render prop expose aussi un objet `snapshot` qui décrit l'état en temps réel du drag :

```jsx
// Dans Droppable
<Droppable droppableId="zone">
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
      style={{
        backgroundColor: snapshot.isDraggingOver ? "#d4edda" : "#f8f9fa",
        transition: "background-color 0.2s ease"
      }}
    >

// Dans Draggable
<Draggable draggableId="item" index={0}>
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{
        opacity: snapshot.isDragging ? 0.7 : 1,
        boxShadow: snapshot.isDragging ? "0 8px 20px rgba(0,0,0,0.2)" : "none",
        ...provided.draggableProps.style
      }}
    >
```

| Propriété snapshot | Valeur | Utilité |
|---|---|---|
| `snapshot.isDraggingOver` | `true/false` | Colorer la zone survolée (Droppable) |
| `snapshot.isDragging` | `true/false` | Styliser la carte en cours de drag (Draggable) |
| `snapshot.draggingFromThisWith` | `draggableId` | Identifier quelle carte quitte la zone |

---

## 9. Règles d'Or & Pièges Fréquents

| ❌ Erreur classique | ✅ Bonne pratique |
|---|---|
| `draggableId={item.id}` avec `id` = number | `draggableId={String(item.id)}` — toujours une `string` |
| Oublier `{provided.placeholder}` | Toujours placer `{provided.placeholder}` avant la fermeture du Droppable |
| `index` aléatoire dans Draggable | Utiliser l'`index` du `.map((item, index) => ...)` |
| Écraser les styles DnD | Fusionner : `style={{ monStyle, ...provided.draggableProps.style }}` |
| Filtrer et garder l'index filtré | Garder le vrai `realIndex` de la liste source |
| Clé React différente du draggableId | `key={item.id}` doit être égal à `draggableId={item.id}` |

---

## 10. Résumé en Image Mentale

```
DragDropContext       → L'arbitre global
  └── Droppable A    → Zone de réception (fournie avec innerRef, droppableProps, placeholder)
        └── Draggable 1  → Carte (fournie avec innerRef, draggableProps, dragHandleProps)
        └── Draggable 2
  └── Droppable B    → Autre zone de réception
        └── Draggable 3
```

`provided` = la boîte à outils que la librairie te donne pour que chaque zone/carte fonctionne techniquement.

---

## 11. Cas d'Usage : Sélection Multiple et Drag and Drop (Multi-Drag)

**Objectif :** Permettre à l'utilisateur de sélectionner plusieurs éléments (ex: avec Maj+Clic ou Ctrl+Clic) et de les déplacer ensemble vers une autre colonne ou zone.

**Concepts clés avec `@hello-pangea/dnd` :**
La librairie ne gère pas nativement l'état "sélectionné" (sélection multiple). C'est à vous de maintenir un tableau ou un \`Set\` des IDs sélectionnés dans l'état de votre composant. 
Lorsque l'utilisateur commence à déplacer un élément, s'il fait partie de la sélection, on déplace toute la sélection. Sinon, on déplace uniquement l'élément en cours de drag.

**Exemple de logique d'implémentation :**

```jsx
function KanbanMultiDrag() {
    const [colonnes, setColonnes] = useState({
        todo: { items: [{ id: "1", nom: "Tâche A" }, { id: "2", nom: "Tâche B" }, { id: "3", nom: "Tâche C" }] },
        done: { items: [] }
    });
    
    // 1. État pour la sélection multiple
    const [selection, setSelection] = useState(new Set());

    const toggleSelection = (e, id) => {
        // e.preventDefault() // Si nécessaire
        const newSelection = new Set(selection);
        if (newSelection.has(id)) newSelection.delete(id);
        else newSelection.add(id);
        setSelection(newSelection);
    };

    const onDragEnd = (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;

        const sourceColId = source.droppableId;
        const destColId = destination.droppableId;

        // 2. Déterminer les éléments à déplacer (soit la sélection, soit l'élément unique)
        const estDansSelection = selection.has(draggableId);
        const elementsADeplacerIds = estDansSelection ? Array.from(selection) : [draggableId];

        // Si on déplace dans la même colonne, la logique est un peu plus complexe (tri groupé),
        // ici on se concentre sur le déplacement inter-colonnes pour la simplicité.
        const idsADeplacer = itemSelectionnes.includes(draggableId)
            ? itemSelectionnes
            : (draggableId)
        
    };

            setContent(prev =>
            prev.map(c => idsADeplacer.includes(String(c.id))
                ? { ...t, valeur: nouvelleValeur }
                : t
            )
        )

        // ... Rendu avec DragDropContext, Droppable, Draggable ...
    // N'oubliez pas d'ajouter un \`onClick={(e) => toggleSelection(e, item.id)}\` sur la div de vos items
}
```


> [!TIP]
> Pour une expérience fluide, ajoutez un style visuel conditionnel sur les `Draggable` (ex: `background: selection.has(item.id) ? "#d4edda" : "#fff"`) afin que l'utilisateur voie clairement ce qui est sélectionné avant de commencer le drag.
> 
> Lors du déplacement (pendant le drag), \`@hello-pangea/dnd\` ne déplace visuellement que l'élément saisi. Pour un rendu parfait, vous pouvez masquer les autres éléments sélectionnés pendant le drag, ou afficher un badge (ex: "3 éléments") sur l'élément en cours de drag en utilisant le paramètre \`snapshot.isDragging\`.

