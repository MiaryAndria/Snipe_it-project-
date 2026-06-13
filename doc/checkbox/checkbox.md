# Guide d'Apprentissage : Les Checkboxes (Cases à cocher) en React

Ce guide pédagogique vous explique comment manipuler et gérer des cases à cocher (checkboxes) en React. Vous y apprendrez à gérer une case seule, une liste de cases, et la fameuse fonctionnalité "Tout Sélectionner / Tout Désélectionner".

---

## 1. Gérer une case à cocher unique
Pour une seule case à cocher (ex: "Accepter les CGU"), nous stockons simplement un booléen (true/false) dans le state.

### Code Exemple :
```jsx
import { useState } from 'react';

function FormulaireCgu() {
    const [accepteCgu, setAccepteCgu] = useState(false);

    return (
        <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                    type="checkbox"
                    checked={accepteCgu}
                    onChange={(e) => setAccepteCgu(e.target.checked)} // e.target.checked renvoie true ou false
                />
                J'accepte les conditions générales d'utilisation
            </label>
            
            <button disabled={!accepteCgu}>Continuer</button>
        </div>
    );
}
```

---

## 2. Gérer une liste de cases à cocher (Sélections multiples)
Pour gérer une liste d'éléments (comme des produits, des catégories, ou des images), la meilleure méthode consiste à stocker un tableau contenant les identifiants (IDs ou SKUs) des éléments sélectionnés.

### Code Exemple :
```jsx
import { useState } from 'react';

function ChoixProduits() {
    const produits = [
        { id: 101, name: "Chemise Muji Blanche" },
        { id: 102, name: "Pantalon Aesop Noir" },
        { id: 103, name: "Bougie Apaisante" }
    ];

    // Le state contient un tableau des IDs sélectionnés : ex [101, 103]
    const [idsSelectionnes, setIdsSelectionnes] = useState([]);

    // Fonction déclenchée quand on coche/décoche un produit
    const handleCheckboxChange = (id) => {
        setIdsSelectionnes(prev => {
            if (prev.includes(id)) {
                // Si l'id est déjà présent, on le retire du tableau (décochement)
                return prev.filter(item => item !== id);
            } else {
                // Sinon, on l'ajoute au tableau (cochement)
                return [...prev, id];
            }
        });
    };

    //String
    const handleCheckboxChange = (id) => {
        const idString = String(id); 
        setItemSelectionnes(prev => {
            if (prev.includes(idString)) {
                return prev.filter(item => item !== idString);
            } else {
                return [...prev, idString];
            }
        });
    };

    return (
        <div>
            <h3>Sélectionnez les articles à commander :</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {produits.map(prod => (
                    <li key={prod.id} style={{ margin: '10px 0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={idsSelectionnes.includes(prod.id)}
                                onChange={() => handleCheckboxChange(prod.id)}
                            />
                            {prod.name} (ID: {prod.id})
                        </label>
                    </li>
                ))}
            </ul>

            <p>Nombre d'éléments sélectionnés : <strong>{idsSelectionnes.length}</strong></p>
        </div>
    );
}
```

---

## 3. Implémenter "Tout Sélectionner / Tout Désélectionner"
C'est la fonctionnalité reine des listes d'import/export. Elle demande de comparer la longueur de notre sélection avec la longueur de la liste totale.

### Code Exemple :
```jsx
import { useState } from 'react';

function ListeSelectionTotale() {
    const articles = [
        { sku: 'CHEMISE-01', nom: 'Chemise Blanche' },
        { sku: 'PANTALON-02', nom: 'Pantalon Noir' },
        { sku: 'VESTE-03', nom: 'Veste Lin' }
    ];

    const [skusSelectionnes, setSkusSelectionnes] = useState([]);

    // 1. Gérer le cochement d'une seule ligne
    const toggleLigne = (sku) => {
        setSkusSelectionnes(prev => 
            prev.includes(sku) ? prev.filter(s => s !== sku) : [...prev, sku]
        );
    };

    // 2. Gérer le bouton "Tout Sélectionner / Tout Désélectionner"
    const toggleTout = () => {
        if (skusSelectionnes.length === articles.length) {
            // Si tout est sélectionné, on vide tout
            setSkusSelectionnes([]);
        } else {
            // Si rien ou seulement une partie est sélectionnée, on prend tout
            const tousLesSkus = articles.map(art => art.sku);
            setSkusSelectionnes(tousLesSkus);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', background: '#fafafa' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #000', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>
                            <input
                                type="checkbox"
                                // La case du haut est cochée si tous les articles sont sélectionnés
                                checked={articles.length > 0 && skusSelectionnes.length === articles.length}
                                onChange={toggleTout}
                            />
                        </th>
                        <th style={{ padding: '8px' }}>SKU</th>
                        <th style={{ padding: '8px' }}>Nom</th>
                    </tr>
                </thead>
                <tbody>
                    {articles.map(art => (
                        <tr key={art.sku} style={{ borderBottom: '1px solid #e0e0e0' }}>
                            <td style={{ padding: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={skusSelectionnes.includes(art.sku)}
                                    onChange={() => toggleLigne(art.sku)}
                                />
                            </td>
                            <td style={{ padding: '8px' }}>{art.sku}</td>
                            <td style={{ padding: '8px' }}>{art.nom}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
```

## 4. Utiliser des cases à cocher pour FILTRER une liste
Contrairement à la sélection d'éléments, utiliser une case à cocher comme **filtre** consiste à stocker un simple état booléen (`true`/`false`) pour masquer ou afficher certains éléments dans le rendu (Derived State).

### Exemple d'application : Filtrer les stocks critiques (Rupture ou stock <= 5)

#### Code Exemple :
```jsx
import { useState } from 'react';

function ListeProduitsFiltree() {
    const produits = [
        { id: 1, name: "Chemise Muji", qty: 12 },
        { id: 2, name: "Pantalon Aesop", qty: 2 },  // Stock critique
        { id: 3, name: "Bougie Apaisante", qty: 0 }  // Rupture
    ];

    // State booléen : true = affiche uniquement les urgences, false = affiche tout
    const [filtreUrgence, setFiltreUrgence] = useState(false);

    // Filtrage dynamique (Derived State)
    const produitsAffiches = produits.filter(prod => {
        // Si le filtre n'est pas activé, on garde le produit
        if (!filtreUrgence) return true;
        
        // Si le filtre est activé, on garde uniquement si la quantité est <= 5
        return prod.qty <= 5;
    });

    return (
        <div style={{ padding: '20px' }}>
            <h3>Filtres de stock</h3>
            
            {/* Contrôle du filtre via la checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '20px' }}>
                <input
                    type="checkbox"
                    checked={filtreUrgence}
                    onChange={(e) => setFiltreUrgence(e.target.checked)} // e.target.checked est true ou false
                />
                ⚠️ Afficher uniquement les alertes (Rupture / Stock Critique)
            </label>

            {/* Affichage de la liste */}
            <ul>
                {produitsAffiches.map(prod => (
                    <li key={prod.id} style={{ color: prod.qty <= 5 ? 'red' : 'black' }}>
                        {prod.name} (Quantité : {prod.qty})
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

---

## Bonnes Pratiques en React
* **Ne stockez pas d'objets entiers** dans le state de sélection. Stockez uniquement les identifiants uniques (id ou sku), c'est plus léger et évite les bugs de référence mémoire.
* **Utilisez toujours .includes()** pour vérifier facilement si un élément est sélectionné dans votre rendu JSX.
* **Rendez vos labels cliquables** en enveloppant l'input `<input type="checkbox" />` à l'intérieur du tag `<label>` ou en utilisant l'attribut htmlFor correspondant à l'ID de l'input.

