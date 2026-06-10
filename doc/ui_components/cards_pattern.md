# Système de Cards (Cartes fixes) en React

## Principe

On crée N cards au départ. Chaque card est un **objet** dans un tableau `cards`.
L'utilisateur remplit ou laisse vide chaque card. À l'envoi, on traite seulement les cards remplies.

---

## 1. Déclarer les cards

```js
const maxCard = 5

const [cards, setCards] = useState(
    Array.from({ length: maxCard }, (_, i) => ({
        id: i + 1,
        productId: null,
        qty: 1,
    }))
)
```

### Résultat en mémoire
```js
cards = [
    { id: 1, productId: null, qty: 1 },
    { id: 2, productId: null, qty: 1 },
    { id: 3, productId: null, qty: 1 },
    { id: 4, productId: null, qty: 1 },
    { id: 5, productId: null, qty: 1 },
]
```

---

## 2. Modifier une card — `handleCardChange`

```js
const handleCardChange = (cardId, field, value) => {
    setCards(prev =>
        prev.map(c => (c.id === cardId ? { ...c, [field]: value } : c))
    )
}
```

### Comment ça marche

Appel : `handleCardChange(2, "productId", 7)`

```
Avant : { id: 2, productId: null, qty: 1 }
Après : { id: 2, productId: 7,    qty: 1 }
```

- `prev.map(c => ...)` → parcourt chaque card
- `c.id === cardId` → on cherche la bonne card
- `{ ...c, [field]: value }` → copie la card et remplace juste le champ
- Les autres cards restent inchangées

---

## 3. Afficher les cards dans le JSX

```jsx
{cards.map(card => {
    const selectedProduct = produits.find(p => p.id === card.productId)

    return (
        <div key={card.id} className="card">
            <h3>Card #{card.id}</h3>

            {/* Select pour choisir un produit */}
            <select
                value={card.productId ?? ""}
                onChange={(e) =>
                    handleCardChange(card.id, "productId",
                        e.target.value ? parseInt(e.target.value) : null)
                }
            >
                <option value="">-- Aucun --</option>
                {produits.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>

            {/* Afficher détails si un produit est choisi */}
            {selectedProduct && (
                <div>
                    <p>{selectedProduct.name}</p>
                    <p>Prix : {selectedProduct.price} €</p>

                    {/* Contrôle quantité */}
                    <button onClick={() => handleCardChange(card.id, "qty", Math.max(1, card.qty - 1))}>−</button>
                    <span>{card.qty}</span>
                    <button onClick={() => handleCardChange(card.id, "qty", Math.min(5, card.qty + 1))}>+</button>
                </div>
            )}
        </div>
    )
})}
```

---

## 4. Envoyer les données — traiter seulement les cards remplies

```js
const handleSubmit = async () => {
    // Filtrer les cards vides
    const filledCards = cards.filter(c => c.productId !== null)

    if (filledCards.length === 0) {
        alert("Sélectionnez au moins un produit")
        return
    }

    for (const card of filledCards) {
        // card.productId → l'ID du produit choisi
        // card.qty → la quantité choisie
        await api.post(`/products/${card.productId}/stock`, {
            quantity: card.qty
        })
    }

    // Reset toutes les cards après envoi
    setCards(
        Array.from({ length: maxCard }, (_, i) => ({
            id: i + 1,
            productId: null,
            qty: 1,
        }))
    )
}
```

---

## 5. Activer/désactiver le bouton

```jsx
<button
    onClick={handleSubmit}
    disabled={cards.every(c => c.productId === null)}
>
    Confirmer
</button>
```

| Méthode | Signification |
|---|---|
| `cards.every(c => c.productId === null)` | **Toutes** les cards sont vides → disabled |
| `cards.some(c => c.productId !== null)` | **Au moins une** card est remplie → enabled |

---

## 6. Schéma du flux complet

```
useState (5 cards vides)
        ↓
.map() → affiche 5 cards avec <select>
        ↓
Utilisateur choisit un produit dans card #2
        ↓
onChange → handleCardChange(2, "productId", 7)
        ↓
setCards → cards[1].productId = 7
        ↓
React re-render → affiche les détails du produit 7
        ↓
Utilisateur clique "Confirmer"
        ↓
filledCards = cards.filter(c => c.productId !== null) → [card #2]
        ↓
Boucle → API POST pour card #2
        ↓
Reset cards → toutes les cards reviennent à null
```

---

## Quand utiliser ce pattern

- Nombre **fixe** de cards (ex: 5 produits max)
- Chaque card a les **mêmes champs** (productId, qty, etc.)
- Les cards vides sont **ignorées** à l'envoi
- Utile pour : ajout stock, commande multi-produits, formulaire par lots
