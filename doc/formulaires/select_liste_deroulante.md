# Sélecteur Liste Déroulante (Select) en React

## Principe

Un `<select>` en React est un **composant contrôlé** : le state contrôle ce qui est affiché, et le `onChange` met à jour le state.

```
State (valeur)  →  <select value={...}>  →  Affichage
       ↑                                        ↓
       ←←←←←←←  onChange(e.target.value)  ←←←←←
```

---

## 1. Select simple — un seul champ

### State
```js
const [selectedId, setSelectedId] = useState(null)
```

### JSX
```jsx
<select
    value={selectedId ?? ""}
    onChange={(e) => setSelectedId(e.target.value ? parseInt(e.target.value) : null)}
>
    <option value="">-- Choisir --</option>
    {liste.map(item => (
        <option key={item.id} value={item.id}>
            {item.name}
        </option>
    ))}
</select>
```

### Explication ligne par ligne

| Code | Rôle |
|---|---|
| `value={selectedId ?? ""}` | Si `selectedId` est `null`, affiche l'option vide `""` |
| `e.target.value` | Retourne toujours un **string** (ex: `"5"`) |
| `parseInt(e.target.value)` | Convertit en **number** (ex: `5`) |
| `e.target.value ? ... : null` | Si string vide `""` → remet `null` |
| `key={item.id}` | Obligatoire dans un `.map()` pour React |
| `value={item.id}` | La valeur envoyée quand on sélectionne cette option |

---

## 2. Select avec données API

### Fetch les données
```js
const [produits, setProduits] = useState([])

const fetchProduits = async () => {
    const response = await api.get('/products')
    setProduits(response.data)
}

useEffect(() => {
    fetchProduits()
}, [])
```

### Filtrer les données (ex: pas de promo)
```js
const produitsFiltres = produits.filter(p => p.special_price === null)
```

### Afficher dans le select
```jsx
<select value={selectedId ?? ""} onChange={...}>
    <option value="">-- Choisir un produit --</option>
    {produitsFiltres.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
    ))}
</select>
ajout multiple proche de value si plusieurs 
```

---

## 3. Afficher les détails du produit sélectionné

```js
// Retrouver l'objet complet à partir de l'ID sélectionné
const produitChoisi = produitsFiltres.find(p => p.id === selectedId)
```

```jsx
{produitChoisi && (
    <div>
        <p>Nom : {produitChoisi.name}</p>
        <p>Prix : {produitChoisi.price} €</p>
        <img src={produitChoisi.images?.[0]?.url} alt={produitChoisi.name} />
    </div>
)}
```

### Comment ça marche
- `produitChoisi` est `undefined` si rien n'est sélectionné
- `{produitChoisi && (...)}` → affiche le bloc **seulement** si un produit est choisi
- `.find(p => p.id === selectedId)` → cherche l'objet dont l'id correspond

---

## 4. Select dans un formulaire avec plusieurs champs

```js
const [form, setForm] = useState({
    produitId: null,
    categorieId: null,
    quantite: 1
})

const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
}
```

```jsx
<select
    value={form.produitId ?? ""}
    onChange={(e) => handleChange("produitId", e.target.value ? parseInt(e.target.value) : null)}
>
    <option value="">-- Produit --</option>
    {produits.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
    ))}
</select>

<select
    value={form.categorieId ?? ""}
    onChange={(e) => handleChange("categorieId", e.target.value ? parseInt(e.target.value) : null)}
>
    <option value="">-- Catégorie --</option>
    {categories.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
    ))}
</select>
```

> `[field]: value` → c'est du **computed property name** ES6  
> `handleChange("produitId", 5)` → `{ ...prev, produitId: 5 }`

---

## 5. Piège courant : le type de value

```
HTML <option value="5">  →  e.target.value = "5"  (string !)
State : selectedId = 5   (number)

⚠️ "5" !== 5  →  Le select ne trouvera pas la bonne option
```

**Solution** : Toujours `parseInt()` dans le onChange, ou comparer avec `==` au lieu de `===`

---

## Résumé

```
1. State      → useState(null) ou useState("")
2. <select>   → value={state} + onChange={setState}
3. <option>   → value={id} dans un .map()
4. Conversion → parseInt(e.target.value) pour les IDs numériques
5. Détails    → .find(p => p.id === selectedId) pour retrouver l'objet
```
