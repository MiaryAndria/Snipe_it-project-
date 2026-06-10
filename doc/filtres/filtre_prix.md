# Tutoriel Étape par Étape : Filtre de Prix avec `<input type="range" />` en React

Ce guide vous explique de manière simple et détaillée comment ajouter un filtre de prix dynamique et fluide en utilisant un curseur de type range (`<input type="range" />`) dans votre composant de catalogue `Produit.jsx`.

---

## Concept et Objectifs
Le filtre de prix dynamique doit :
1. **S'adapter automatiquement** aux produits de la catégorie : le prix maximum du slider doit être égal au prix du produit le plus cher actuellement affiché.
2. **Prendre en compte les promotions** : si un produit a un prix promotionnel actif (`special_price`), le filtre doit utiliser ce prix promo pour filtrer, et non le prix de base normal.
3. **Mettre à jour l'affichage en temps réel** dès que l'utilisateur déplace le curseur.

---

## Étape par Étape

### Étape 1 : Déclarer les `useState` nécessaires
Dans votre composant `ProduitCategorie` (dans `Produit.jsx`), nous devons stocker deux informations importantes dans le State React :
* Le prix maximum actuellement sélectionné sur le slider (`prixFiltre`).
* Les limites réelles de prix des produits de la catégorie (`limitesPrix`) pour configurer la valeur maximale du slider dynamiquement.

Ajoutez ces lignes au début de votre composant :

```javascript
// State pour le prix maximum choisi par l'utilisateur
const [prixFiltre, setPrixFiltre] = useState(1000);
// State pour stocker dynamiquement les prix min et max de la catégorie
const [limitesPrix, setLimitesPrix] = useState({ min: 0, max: 1000 });
```

---

### Étape 2 : Créer une fonction utilitaire pour obtenir le prix actif
nous devons créer une fonction simple qui extrait le vrai prix à payer pour chaque element :

```javascript
const obtenirPrixActif = (produit) => {
    // Si un prix promotionnel (special_price) est présent, on l'utilise, sinon le prix normal
    if (x.price) {
        return parseFloat(x.price);
    }
    return parseFloat(x.price) || 0;
};
```

---

### Étape 3 : Calculer dynamiquement les limites du slider au chargement des produits
Dès que les produits sont récupérés depuis l'API, nous devons calculer le prix le plus bas et le prix le plus élevé de la liste pour ajuster les bornes de notre slider.



```javascript
const fetch = async () => {
    try {
        const response = await api_client.get(`/products?category_id=${id}&sort=id&limit=100`);
        const x = response.data.data;
        setProduits(x);
        setLoading(false);

        // --- CALCUL DYNAMIQUE DES LIMITES DE PRIX ---
        if (x.length > 0) {
            // On extrait tous les prix actifs (en tenant compte des promos)
            const prixList = x
            if (prixList.length > 0) {
                const minVal = Math.min(...prixList);
                const maxVal = Math.max(...prixList);

                // On met à jour les limites et on initialise le curseur au prix max
                setLimitesPrix({ min: minVal, max: maxVal });
                setPrixFiltre(maxVal); 
            }
        }
    } catch (error) {
        setMessage('Erreur lors du chargement');
        setLoading(false);
    }
};
```

### Que mettre dans le `useEffect` ?
Le rôle du `useEffect` est de déclencher automatiquement la fonction `fetchProduits` à chaque fois que la catégorie change (c'est-à-dire quand le paramètre `id` dans l'URL change). 

Voici le code exact du `useEffect` à mettre dans votre composant :

```javascript
useEffect(() => {
    if (id) {
        // Optionnel : Réinitialiser le curseur de chargement au changement de catégorie
        setLoading(true);
        fetch();
    }
}, [id]); // La dépendance [id] garantit que le code se relance si on change de page de catégorie
```

---

### Étape 4 : Filtrer la liste de produits avant le rendu
Au lieu de faire une boucle sur tous les produits reçus, nous allons filtrer les produits en temps réel pour ne garder que ceux dont le prix actif est inférieur ou égal au prix sélectionné sur le slider :

```javascript
const x = produits.filter(produit => {
    
    const prixActif = obtenirPrixActif(produit);
    return prixActif <= prixFiltre;
});
```

---

### Étape 5 : Intégrer le code HTML du slider dans le rendu JSX
Nous allons ajouter l'interface du filtre de prix juste au-dessus de la grille de produits. 

Voici le code à insérer juste après votre titre `<h1>Collection {id}</h1>` :

```jsx
{/* --- ZONE DU FILTRE DE PRIX --- */}
<div className="price-filter-container" style={{
    margin: '20px 0 30px 0',
    padding: '20px',
    border: '2px solid var(--border-color)',
    borderRadius: '4px',
    background: '#fff'
}}>
    <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Filtrer par Prix
    </h3>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <input 
            type="range" 
            min={limitesPrix.min} 
            max={limitesPrix.max} 
            step="10"
            value={prixFiltre} 
            onChange={(e) => setPrixFiltre(parseFloat(e.target.value))}
            style={{
                flex: 1,
                cursor: 'pointer',
                accentColor: 'var(--text-color)' // applique la couleur principale muji/aesop
            }}
        />
        
        <div style={{ minWidth: '120px', textAlign: 'right', fontWeight: 'bold' }}>
            Max : {prixFiltre.toFixed(2)} €
        </div>
    </div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
        <span>Min : {limitesPrix.min.toFixed(2)} €</span>
        <span>Max : {limitesPrix.max.toFixed(2)} €</span>
    </div>
</div>
```

---


---

## Design minimaliste (Noir & Blanc)
Pour respecter le design système monochrome de type Muji / Aesop de votre projet, vous pouvez ajouter ces quelques lignes de style dans votre fichier CSS (`client_style.css`) :

```css
/* Personnalisation premium du slider de prix range */
.price-filter-container input[type="range"] {
    -webkit-appearance: none;
    width: 100%;
    height: 4px;
    background: #e2e2e2;
    outline: none;
    border-radius: 2px;
}

.price-filter-container input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #000000;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 0 0 1px #000000;
    transition: transform 0.1s ease;
}

.price-filter-container input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
}
```

---

## Résumé du flux d'exécution
1. **API Call** ➡️ Récupère tous les produits.
2. **Calcul** ➡️ Trouve les prix Min et Max de la catégorie (ex : Min = 10 € / Max = 250 €).
3. **State Update** ➡️ Configure le slider pour aller de 10 € à 250 €, et l'initialise à 250 €.
4. **Action Utilisateur** ➡️ L'utilisateur glisse le range à 150 €.
5. **Filtrage immédiat** ➡️ `produitsFiltrés` ne garde que les produits de 10 € à 150 € et React met à jour l'écran de manière fluide !
