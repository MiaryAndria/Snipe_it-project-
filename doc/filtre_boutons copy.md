# Tutoriel : Filtre par Boutons (Stock, Promos, etc.) en React

Ce guide explique étape par étape comment implémenter un filtre rapide par boutons (par exemple : "Tous les produits", "Seulement les promotions", ou "Seulement en stock") dans votre catalogue React.

---

## Concept et Objectifs
Le filtre par boutons permet d'offrir des raccourcis de navigation rapides à l'utilisateur. Nous allons :
1. Stocker le filtre actif dans un state React `filtreSelectionne` (qui contiendra par exemple `'tous'`, `'promo'` ou `'disponible'`).
2. Créer une barre de boutons interactifs dans le rendu JSX.
3. Appliquer une condition de filtrage spécifique pour chaque bouton.

---

## Implémentation Étape par Étape

### Étape 1 : Déclarer le State pour le bouton sélectionné
Nous définissons une valeur par défaut, par exemple `'tous'`, pour afficher l'ensemble du catalogue au chargement initial :

```javascript
// Stocke le filtre rapide sélectionné : 'tous','autres_status'
const [filtreSelectionne, setFiltreSelectionne] = useState("tous");
```

---

### Étape 2 : Définir la logique de filtrage par bouton
Avant de faire le rendu de vos produits, utilisez la méthode `.filter()` pour n'afficher que les produits qui correspondent au bouton cliqué :

```javascript
const produitsFiltrésParBouton = produits.filter(produit => {
    if (produit.type === "configurable") return false;

    // Récupérer la quantité en stock indexée
    const stockDispo = produit.inventory_indices?.[0]?.qty ?? 0;

    switch (filtreSelectionne) {
        case "promo":
            // On ne garde que les produits ayant un prix spécial
            return produit.special_price !== null && produit.special_price !== undefined;
            
        case "disponible":
            // On ne garde que les produits ayant du stock
            return stockDispo > 0;
            
        case "tous":
        default:
            // On garde tous les produits
            return true;
    }
});
```

---

### Étape 3 : Créer l'interface des boutons en JSX
Ajoutez cette barre de boutons moderne Noir & Blanc juste au-dessus de votre liste de produits. Nous appliquons une classe active `active-filter` ou des styles conditionnels pour mettre en surbrillance le bouton sélectionné :

```jsx
{/* --- BOUTONS DE FILTRAGE RAPIDE (Muji/Aesop Style) --- */}
<div className="filter-buttons-container" style={{
    display: 'flex',
    gap: '12px',
    margin: '20px 0 25px 0',
    flexWrap: 'wrap'
}}>
    <button
        onClick={() => setFiltreSelectionne("tous")}
        style={{
            padding: '10px 20px',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            border: '2px solid #000',
            background: filtreSelectionne === 'tous' ? '#000' : '#fff',
            color: filtreSelectionne === 'tous' ? '#fff' : '#000',
            transition: 'all 0.2s ease',
            borderRadius: '2px'
        }}
    >
        Tous les produits
    </button>

    <button
        onClick={() => setFiltreSelectionne("promo")}
        style={{
            padding: '10px 20px',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            border: '2px solid #000',
            background: filtreSelectionne === 'promo' ? '#000' : '#fff',
            color: filtreSelectionne === 'promo' ? '#fff' : '#000',
            transition: 'all 0.2s ease',
            borderRadius: '2px'
        }}
    >
        En Promotion
    </button>

    <button
        onClick={() => setFiltreSelectionne("disponible")}
        style={{
            padding: '10px 20px',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            border: '2px solid #000',
            background: filtreSelectionne === 'disponible' ? '#000' : '#fff',
            color: filtreSelectionne === 'disponible' ? '#fff' : '#000',
            transition: 'all 0.2s ease',
            borderRadius: '2px'
        }}
    >
        En Stock uniquement
    </button>
</div>
```

---

### Étape 4 : Remplacer le rendu par la liste filtrée
Faites boucler votre JSX sur le nouveau tableau :

```jsx
<div className="product-grid">
    {produitsFiltrésParBouton.map(produit => (
        <div key={produit.id} className="card">
            {/* Rendu du produit... */}
        </div>
    ))}
</div>
```

---

## LE FILTRE ULTIME : Cumuler Range (Prix) + Recherche (Texte) + Boutons (Status)
Si vous voulez que votre boutique offre le meilleur système de filtre possible en combinant la recherche textuelle, le slider de prix maximum et les boutons de filtre rapide, écrivez simplement cette fonction de filtrage globale :

```javascript
const produitsFiltrésFinaux = produits.filter(produit => {
    if (produit.type === "configurable") return false;

    // 1. Condition du Slider de Prix
    const prixActif = obtenirPrixActif(produit);
    const respectePrix = prixActif <= prixFiltre;

    // 2. Condition de la Barre de Recherche
    const nomProduit = (produit.name || "").toLowerCase();
    const respecteRecherche = nomProduit.includes(termeRecherche.toLowerCase());

    // 3. Condition des Boutons Rapides
    const stockDispo = produit.inventory_indices?.[0]?.qty ?? 0;
    let respecteBouton = true;
    if (filtreSelectionne === "promo") {
        respecteBouton = produit.special_price !== null && produit.special_price !== undefined;
    } else if (filtreSelectionne === "disponible") {
        respecteBouton = stockDispo > 0;
    }

    // Le produit doit être validé par les 3 filtres à la fois !
    return respectePrix && respecteRecherche && respecteBouton;
});
```

En mappant ensuite sur `produitsFiltrésFinaux`, vos visiteurs disposeront d'une interface de filtrage digne des plus grands sites e-commerce !
