# 🗺️ Roadmap — Créer des fonctions React sans aide

> **Méthode : partir du JSX vers les fonctions**  
> À lire avant chaque nouvelle fonctionnalité

---

## 🔵 PHASE 1 — Lire et comprendre le sujet

Avant d'ouvrir VS Code, sur papier :

```
□ Lire le sujet 2-3 fois
□ Identifier les ENTITÉS  → ticket, statut, priorité, asset, couleur...
□ Identifier les ACTIONS  → créer, modifier, supprimer, filtrer, importer, drag...
□ Identifier les RELATIONS → un ticket a plusieurs items, un statut a une couleur...
```

**Exemple :**
```
Entités  : ticket, statut, priorité, asset, catégorie, couleur, historique, coût
Actions  : créer ticket, drag vers colonne, réouverture, annulation, importer CSV
Relations: ticket → statut (1-1), ticket → items (1-N), statut → couleur (1-1)
```

---

## 🔵 PHASE 2 — Schéma de base de données

Sur papier ou Excalidraw — avant de toucher au code :

```
Pour chaque entité identifiée → une table
Pour chaque relation → une clé étrangère ou une table de jonction
```

**Format :**
```
nom_table : colonne1 (type), colonne2 (type), id_foreign (FK → autre_table)

tickets         : id, num_ticket, titre, description, status_id (FK), priority_id (FK), items
ticket_statuses : id, name
t_ticket_cout   : id, id_ticket (FK), cout, categorie
t_ticket_statuses : id, id_ticket (FK), id_statuses (FK), date, description
```

**Questions à se poser pour chaque table :**
```
□ Quelles colonnes ? (id toujours en premier, AUTOINCREMENT)
□ Quelles colonnes sont obligatoires ? (NOT NULL)
□ Quelles colonnes ont une valeur par défaut ? (DEFAULT)
□ Quelles FK pointer vers quelle table ?
□ ON DELETE CASCADE ou non ?
```

---

## 🔵 PHASE 3 — Liste des routes API

Avant de coder le backend, pour chaque entité :

```
GET    /entite          → lister tout
GET    /entite/:id      → détail d'un
POST   /entite          → créer
PUT    /entite/:id      → modifier
DELETE /entite/:id      → supprimer
```

**Note les paramètres de chaque route :**
```
POST /ticket_cout
  Body : { id_ticket, cout, categorie }
  Retourne : { success, data: { id, id_ticket, cout, categorie } }

GET /ticket_cout
  Query : ?id_ticket=2
  Retourne : { success, data: [...] }
```

---

## 🔵 PHASE 4 — Partir du JSX

C'est ta méthode — et c'est une bonne méthode. Voici comment la structurer :

### 4.1 — Écrire le JSX squelette d'abord

```jsx
return (
    <div>
        {/* Liste des tickets */}
        {ticket.map(t => (
            <div key={t.id}>
                <p>{t.titre}</p>
                <button onClick={/* TODO */}>Modifier</button>
                <button onClick={/* TODO */}>Supprimer</button>
            </div>
        ))}

        {/* Modal création */}
        {isModalOpen && (
            <div>
                <input onChange={/* TODO */} />
                <button onClick={/* TODO */}>Créer</button>
                <button onClick={/* TODO */}>Annuler</button>
            </div>
        )}
    </div>
)
```

### 4.2 — Identifier les states depuis le JSX

Pour chaque `{variable}` ou `state` utilisé dans le JSX → déclarer un state :

```
ticket.map(...)          → const [ticket, setTicket] = useState([])
isModalOpen && (...)     → const [isModalOpen, setIsModalOpen] = useState(false)
t.titre                  → ticket vient de l'API
input onChange           → const [titre, setTitre] = useState('')
```

**Règle :**
```
□ Tableau de données venant de l'API       → useState([])
□ Objet unique venant de l'API             → useState({})
□ Booléen pour afficher/cacher             → useState(false)
□ String pour un input                     → useState('')
□ Null pour une sélection                  → useState(null)
□ Loading                                  → useState(true)
□ Message d'erreur/succès                  → useState('')
```

### 4.3 — Identifier les fonctions depuis le JSX

Pour chaque `onClick`, `onSubmit`, `onChange` → identifier la fonction nécessaire :

```jsx
<button onClick={confirmerReouverture}>  → fonction confirmerReouverture
<button onClick={handleModalAnnulation}> → fonction handleModalAnnulation
<button onClick={annuler}>              → fonction annuler
<input onChange={(e) => setTitre(e.target.value)}> → pas de fonction séparée
```

---

## 🔵 PHASE 5 — Concevoir chaque fonction

### 5.1 — Template de conception (à faire sur papier avant de coder)

```
Nom de la fonction : confirmerReouverture

DONNÉES EN ENTRÉE :
  - States utilisés : pendingDrag, category, ticketCout, prixReouverture, dateModal, descriptionModal
  - Paramètres : aucun (tout vient des states)

CE QUE LA FONCTION FAIT (en français) :
  1. Mettre à jour le state local du ticket
  2. PUT /tickets/:id avec nouveau statut
  3. Calculer le total des derniers prix par catégorie
  4. Ajouter prixReouverture au total
  5. POST /ticket_history
  6. POST /ticket_cout pour chaque catégorie
  7. Rafraîchir ticketCout
  8. Fermer le modal

DONNÉES MODIFIÉES APRÈS :
  - ticket state (via setTicket)
  - ticketCout state (via getTicketCout)
  - isModalReouverture → false

EST-CE ASYNC ? Oui → appels API
```

### 5.2 — Questions à se poser avant chaque fonction

```
□ Est-ce que la fonction appelle une API ?
  Oui → async, await, try/catch

□ D'où viennent les données utilisées ?
  State → utiliser directement le state
  Paramètre → passer en argument
  Variable locale → déclarer avec const/let

□ find ou filter ?
  Je veux UN résultat   → find  → objet direct → .propriete accessible
  Je veux PLUSIEURS     → filter → tableau → [length-1] pour le dernier

□ Est-ce que je lis un state juste après l'avoir modifié ?
  Oui → DANGER → utiliser variable locale à la place
  setTicketCout(data) puis ticketCout.filter(...) → ❌
  const data = response.data.data puis data.filter(...) → ✅

□ Est-ce que je dois rafraîchir des données après ?
  POST/PUT/DELETE → toujours appeler getXxx() après

□ Que se passe-t-il si une variable est undefined/null/vide ?
  Ajouter if (!variable) return ou variable?.propriete
```

### 5.3 — Écrire la fonction en commentaires d'abord

```javascript
const confirmerReouverture = async () => {
    // 1. Mettre à jour le state local du ticket
    // 2. PUT /tickets/:id avec nouveau statut
    // 3. Calculer total des derniers prix par catégorie
    //    - boucle sur category
    //    - filter ticketCout par cat + id_ticket
    //    - prendre dernière ligne [length-1]
    //    - additionner avec +=
    // 4. cout = total + prixReouverture
    // 5. POST /ticket_history
    // 6. addTicketCout(ticketId, cout, category)
    // 7. getTicketCout()
    // 8. setIsModalReouverture(false)
}
```

### 5.4 — Coder en remplaçant les commentaires

```javascript
const confirmerReouverture = async () => {
    try {
        // 1.
        setTicket(prev => prev.map(t =>
            t.id === pendingDrag.ticketId
                ? { ...t, status_id: pendingDrag.newStatusId }
                : t
        ))

        // 2.
        await api_ticket.put(`/tickets/${pendingDrag.ticketId}`, {
            status_id: pendingDrag.newStatusId
        })

        // 3.
        let total = 0
        for (const cat of category) {
            const lignes = ticketCout.filter(
                t => t.categorie === cat && t.id_ticket === pendingDrag.ticketId
            )
            const derniere = lignes[lignes.length - 1]
            total += derniere ? Number(derniere.cout) : 0
        }

        // 4.
        const cout = total + Number(prixReouverture)

        // 5.
        await createHistoryEntry(
            pendingDrag.ticketId,
            pendingDrag.newStatusId,
            dateModal,
            descriptionModal
        )

        // 6.
        await addTicketCout(pendingDrag.ticketId, cout, category)

        // 7.
        await getTicketCout()

    } catch (e) {
        console.log(e)
        setMessage('Erreur lors réouverture')
    }

    // 8. (en dehors du try pour s'exécuter même si erreur)
    setIsModalReouverture(false)
}
```

---

## 🔵 PHASE 6 — Erreurs fréquentes à éviter

### ❌ Variable non déclarée
```javascript
// AVANT d'utiliser une variable → demande d'où elle vient
montantDivise = cout / length  // ← cout vient d'où ?

// Si paramètre → utiliser le nom du paramètre
const addTicketCout = async (ticketId, montant, categorie) => {
    const montantDivise = montant / categorie.length  // ← montant pas cout
}
```

### ❌ setState puis lecture immédiate
```javascript
// ❌ ticketCout pas encore mis à jour
setTicketCout(data)
ticketCout.filter(...)  // ← ancienne valeur

// ✅ utiliser la variable locale
const data = response.data.data
data.filter(...)  // ← valeur fraîche
```

### ❌ Pas de getXxx() après modification
```javascript
// ❌
await api_ticket.post('/ticket_cout', {...})
// ticketCout state est vide → prochaine opération va planter

// ✅
await api_ticket.post('/ticket_cout', {...})
await getTicketCout()  // ← toujours rafraîchir
```

### ❌ filter au lieu de find (ou inversement)
```javascript
// Je veux vérifier si une entrée existe → find
const existe = ticketCout.find(tc => tc.id === id)
if (!existe) { /* POST */ } else { /* PUT avec existe.id */ }

// Je veux toutes les entrées d'une catégorie → filter
const lignes = ticketCout.filter(tc => tc.categorie === cat)
const derniere = lignes[lignes.length - 1]  // ← dernière ligne
```

### ❌ Mauvais champ dans le filter
```javascript
// Avant d'écrire tc.id ou tc.id_ticket → regarder la structure
// ticketCout = [{ id, id_ticket, cout, categorie }]
//               ↑ id de la LIGNE
//                  ↑ id du TICKET

// ❌ compare id de ligne avec ticketId
ticketCout.filter(tc => tc.id === ticketId)

// ✅
ticketCout.filter(tc => tc.id_ticket === ticketId)
```

### ❌ const dans un if/else → inaccessible en dehors
```javascript
// ❌
if (condition) {
    const maFonction = () => {...}
}
maFonction()  // crash — hors scope

// ✅ déclarer au niveau du composant
const maFonction = () => {
    if (condition) { /* ... */ }
}
```

### ❌ Pas de vérification avant d'accéder à une propriété
```javascript
// ❌ crash si derniereLigne est undefined
await api.delete(`/ticket_cout/${derniereLigne.id}`)

// ✅ vérifier d'abord
if (derniereLigne) {
    await api.delete(`/ticket_cout/${derniereLigne.id}`)
}
```

---

## 🔵 PHASE 7 — Débugger méthodiquement

Quand quelque chose ne marche pas :

```
1. Lire l'erreur exacte dans la console
   → "Cannot read properties of undefined (reading 'id')"
   → La ligne indiquée dans l'erreur

2. Identifier la variable qui est undefined
   → derniereLigne.id → derniereLigne est undefined

3. Remonter → pourquoi derniereLigne est undefined ?
   → category[category.length - 1] sur un tableau vide

4. Pourquoi le tableau est vide ?
   → filter ne trouve rien → ticketCout est vide

5. Pourquoi ticketCout est vide ?
   → getTicketCout() pas appelé après addTicketCout()
```

**Ajouter des console.log aux points critiques :**
```javascript
console.log('ticketCout :', ticketCout)          // vide ? plein ?
console.log('ticketId :', ticketId)              // number ? string ?
console.log('cat :', cat)                        // 'Desktop' ? objet ?
console.log('lignes trouvées :', lignes)         // [] ? résultats ?
console.log('derniereLigne :', derniereLigne)    // undefined ? objet ?
```

---

## 🔵 PHASE 8 — Checklist finale avant de valider une fonction

```
□ Flow écrit en commentaires avant de coder
□ Toutes les variables identifiées et déclarées
□ find ou filter bien choisi
□ Pas de setState puis lecture immédiate
□ getXxx() appelé après chaque POST/PUT/DELETE
□ Vérification if (!variable) avant .propriete
□ try/catch présent si fonction async
□ Modal/state reset à la fin
□ console.log ajoutés aux points critiques
□ Tester en console avant de retirer les logs
```

---

## 📋 Récapitulatif — Ordre de travail pour chaque fonctionnalité

```
1. Lire le besoin (sujet ou description)
2. Écrire le JSX squelette avec TODO
3. Identifier les states nécessaires
4. Identifier les fonctions nécessaires
5. Pour chaque fonction :
   a. Écrire les données en entrée
   b. Écrire le flow en français
   c. Écrire en commentaires
   d. Coder en remplaçant les commentaires
   e. Ajouter les console.log
   f. Tester
   g. Retirer les console.log
6. Tester toutes les interactions
```