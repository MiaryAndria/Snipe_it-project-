# Champs Dynamiques (Ajouter / Supprimer des lignes) en React

## Principe

Contrairement aux cards fixes, ici on commence avec **1 ligne** et l'utilisateur peut :
- **+** → ajouter une nouvelle ligne en bas
- **−** → supprimer une ligne spécifique

Le nombre de lignes est **variable** (pas fixe comme les cards).

---

## 1. Déclarer le state

```js
const [lignes, setLignes] = useState([
    { id: 1, valeur: '' }
])
const [nextId, setNextId] = useState(2)
```

- On commence avec **1 ligne**
- `nextId` sert à donner un ID unique à chaque nouvelle ligne
- Chaque ligne a un `id` unique et une `valeur` (ou plusieurs champs)

---

## 2. Ajouter une ligne — bouton `+`

```js
const ajouterLigne = () => {
    setLignes(prev => [...prev, { id: nextId, valeur: '' }])
    setNextId(n => n + 1)
}
```

### Explication
- `[...prev, nouvelObjet]` → copie toutes les lignes + ajoute la nouvelle à la fin
- `nextId` augmente à chaque ajout pour garder des IDs uniques (2, 3, 4...)

### Exemple
```
Avant : [{ id: 1, valeur: "abc" }]
Après : [{ id: 1, valeur: "abc" }, { id: 2, valeur: "" }]
```

---

## 3. Supprimer une ligne — bouton `−`

```js
const supprimerLigne = (idLigne) => {
    setLignes(prev => prev.filter(l => l.id !== idLigne))
}
```

### Explication
- `.filter(l => l.id !== idLigne)` → garde toutes les lignes **sauf** celle avec cet ID
- La ligne supprimée disparaît du tableau

### Exemple
```
Avant : [{ id: 1 }, { id: 2 }, { id: 3 }]
supprimerLigne(2)
Après : [{ id: 1 }, { id: 3 }]
```

---

## 4. Modifier une ligne

```js
const modifierLigne = (idLigne, field, value) => {
    setLignes(prev =>
        prev.map(l => (l.id === idLigne ? { ...l, [field]: value } : l))
    )
}
```

C'est la même logique que `handleCardChange` dans le pattern cards.

---

## 5. Le JSX complet

```jsx
function FormulaireMultiLignes() {
    const [lignes, setLignes] = useState([{ id: 1, valeur: '' }])
    const [nextId, setNextId] = useState(2)

    const ajouterLigne = () => {
        setLignes(prev => [...prev, { id: nextId, valeur: '' }])
        setNextId(n => n + 1)
    }

    const supprimerLigne = (idLigne) => {
        setLignes(prev => prev.filter(l => l.id !== idLigne))
    }

    const modifierLigne = (idLigne, field, value) => {
        setLignes(prev =>
            prev.map(l => (l.id === idLigne ? { ...l, [field]: value } : l))
        )
    }

    return (
        <div>
            <h2>Formulaire dynamique</h2>

            {lignes.map(ligne => (
                <div key={ligne.id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                        type="text"
                        value={ligne.valeur}
                        onChange={(e) => modifierLigne(ligne.id, "valeur", e.target.value)}
                        placeholder="Entrez une valeur"
                    />

                    {/* Bouton supprimer — caché s'il ne reste qu'une seule ligne */}
                    {lignes.length > 1 && (
                        <button onClick={() => supprimerLigne(ligne.id)}>−</button>
                    )}
                </div>
            ))}

            {/* Bouton ajouter */}
            <button onClick={ajouterLigne}>+ Ajouter une ligne</button>

            {/* Bouton envoyer */}
            <button onClick={() => console.log(lignes)}>Envoyer</button>
        </div>
    )
}
```

---

## 6. Exemple avec plusieurs champs par ligne

```js
const [lignes, setLignes] = useState([
    { id: 1, nom: '', email: '', role: '' }
])

const ajouterLigne = () => {
    setLignes(prev => [...prev, { id: nextId, nom: '', email: '', role: '' }])
    setNextId(n => n + 1)
}
```

```jsx
{lignes.map(ligne => (
    <div key={ligne.id} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
            value={ligne.nom}
            onChange={(e) => modifierLigne(ligne.id, "nom", e.target.value)}
            placeholder="Nom"
        />
        <input
            value={ligne.email}
            onChange={(e) => modifierLigne(ligne.id, "email", e.target.value)}
            placeholder="Email"
        />
        <select
            value={ligne.role}
            onChange={(e) => modifierLigne(ligne.id, "role", e.target.value)}
        >
            <option value="">-- Rôle --</option>
            <option value="admin">Admin</option>
            <option value="user">Utilisateur</option>
        </select>

        {lignes.length > 1 && (
            <button onClick={() => supprimerLigne(ligne.id)}>−</button>
        )}
    </div>
))}
<button onClick={ajouterLigne}>+ Ajouter</button>
```

---

## 7. Avec un maximum de lignes

```js
const maxLignes = 10

const ajouterLigne = () => {
    if (lignes.length >= maxLignes) return  // bloque si max atteint
    setLignes(prev => [...prev, { id: nextId, valeur: '' }])
    setNextId(n => n + 1)
}
```

```jsx
<button onClick={ajouterLigne} disabled={lignes.length >= maxLignes}>
    + Ajouter une ligne
</button>
```

---

## 8. Envoyer les données

```js
const handleSubmit = async () => {
    // Filtrer les lignes vides si besoin
    const lignesRemplies = lignes.filter(l => l.valeur.trim() !== '')

    for (const ligne of lignesRemplies) {
        await api.post('/endpoint', { valeur: ligne.valeur })
    }

    // Reset
    setLignes([{ id: 1, valeur: '' }])
    setNextId(2)
}
```

---

## 9. Comparaison Cards vs Champs Dynamiques

| | Cards (fixes) | Champs dynamiques |
|---|---|---|
| **Nombre de lignes** | Fixe (ex: 5) | Variable (1 à N) |
| **Au départ** | 5 cards créées | 1 seule ligne |
| **Ajouter** | Non (déjà toutes créées) | Oui, bouton `+` |
| **Supprimer** | Non (on met `null`) | Oui, bouton `−` |
| **Besoin de `nextId`** | Non | Oui |
| **Lignes vides** | Ignorées à l'envoi | Ignorées à l'envoi |
| **Quand utiliser** | Nombre max connu et petit | Nombre inconnu ou grand |

---

## 10. Schéma du flux

```
useState : [{ id: 1, valeur: '' }]
        ↓
.map() → affiche 1 ligne avec input + bouton −
        ↓
Clic "+" → ajouterLigne() → ajoute { id: 2, valeur: '' }
        ↓
.map() → affiche 2 lignes
        ↓
Clic "−" sur ligne 1 → supprimerLigne(1) → reste [{ id: 2 }]
        ↓
Clic "Envoyer" → boucle sur lignes remplies → API POST
        ↓
Reset → retour à 1 ligne vide
```

---

## ⚠️ Pourquoi `nextId` et pas `lignes.length + 1` ?

```
Lignes : [{ id: 1 }, { id: 2 }, { id: 3 }]
Supprimer id: 2 → [{ id: 1 }, { id: 3 }]
length + 1 = 3 → id: 3 existe déjà ! ❌ Conflit de clé React

Avec nextId (qui était à 4) → id: 4 → Toujours unique ✅
```

`nextId` ne fait que monter, jamais descendre. C'est un **compteur qui ne recule pas**.

## Repeter champ avec valeur differente 

    <div className="form-group" style={{ marginLeft: '24px' }}>
        <label className="form-label">Champ a repeter</label>
        <input
            className="field-input"
            type="text"
            value={label[id] || ''}        
            onChange={(e) => handleText(id, e.target.value)}
            placeholder="Ex : En cours, À faire..."
        />
    </div>
