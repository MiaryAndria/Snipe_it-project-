# Filtrage Dynamique de Liste avec un Select en React

Ce guide explique comment mettre en place une liste déroulante (`<select>`) pour filtrer dynamiquement un tableau ou une liste d'éléments en temps réel, de manière propre et performante en React.

---

## 1. Le Principe : Éviter l'état redondant (Derived State)

> [!IMPORTANT]
> **Règle d'or en React** : Ne créez pas de `useState` pour stocker des listes filtrées.
> Calculez-les directement à la volée pendant le rendu à partir de la liste globale et du filtre sélectionné. Cela évite les boucles de rendu infinies et garantit que vos filtres sont toujours parfaitement synchronisés avec vos données.

---

## 2. Exemple Généralisé et Commenté (Style API de Projet)

Voici le code commenté d'un composant utilisant une structure cohérente avec votre projet (`api_admin`, structure `response.data.data`, etc.), mais avec des données et filtres simplifiés pour faciliter la compréhension.

```jsx
import React, { useState, useEffect } from 'react';
import api_admin from '../../api/api_admin';  Exemple de client API du projet

function GestionListe() {
     1. Nos seuls états (states) indispensables
    const [items, setItems] = useState([]);  Liste complète d'éléments provenant de l'API
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    
     Le filtre sélectionné. 'all' est la valeur par défaut pour "Affiche tout".
    const [filterValue, setFilterValue] = useState('all');

     2. Fetch des données depuis l'API
    const fetchItems = async () => {
        try {
            const response = await api_admin.get('/admin/items');  Route générique cohérente
            setItems(response.data.data);  Stockage de la liste complète brute
            setLoading(false);
        } catch (error) {
            setMessage('Erreur lors du chargement des données');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

     3. Calculs des listes filtrées (Derived State / États Dérivés)
     Ces listes se mettent à jour automatiquement à chaque rendu, sans besoin de useState !
    
     Filtre A : Uniquement les éléments au statut "actif"
    const itemsActifs = items.filter(item => item.status === 'active');

     Filtre B : Uniquement les éléments au statut "inactif"
    const itemsInactifs = items.filter(item => item.status === 'inactive');

     Filtre C : Éléments avec un prix supérieur à 100
    const itemsPrixEleve = items.filter(item => item.price > 100);


     4. L'Astuce de la valeur par défaut pour le filtrage
     Par défaut, on initialise la liste finale à afficher avec la totalité des éléments.
    let itemsAffiches = items;

     On applique le filtre spécifique SEULEMENT si l'utilisateur en a choisi un.
     Si filterValue vaut 'all', aucun de ces "if" n'est exécuté, on affiche donc la liste complète d'origine.
    if (filterValue === 'actifs') itemsAffiches = itemsActifs;
    if (filterValue === 'inactifs') itemsAffiches = itemsInactifs;
    if (filterValue === 'prix-eleve') itemsAffiches = itemsPrixEleve;

    if (loading) return <div className="client-container">Chargement...</div>;

    return (
        <div className="client-container">
            <h1>Gestion des Éléments</h1>

            {message && <p className="error-message">{message}</p>}
        
            {/* 5. Le sélecteur contrôlé par React */}
            <div className="filter-section" style={{ marginBottom: '20px' }}>
                <label htmlFor="item-filter">Filtrer par : </label>
                <select 
                    id="item-filter"
                    value={filterValue}  Lié au state filterValue
                    onChange={(e) => setFilterValue(e.target.value)}  Met à jour le state
                >
                    {/* Le nombre d'éléments correspondants s'affiche directement dans chaque option */}
                    <option value="all">Tous les éléments ({items.length})</option>
                    <option value="actifs">Éléments Actifs ({itemsActifs.length})</option>
                    <option value="inactifs">Éléments Inactifs ({itemsInactifs.length})</option>
                    <option value="prix-eleve">Prix supérieur à 100 € ({itemsPrixEleve.length})</option>
                </select>
            </div>

            {/* 6. Rendu des données filtrées */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Prix</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsAffiches.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.price} €</td>
                                <td>{item.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Message si aucun élément ne correspond au filtre sélectionné */}
            {itemsAffiches.length === 0 && (
                <p className="text-center mt-20">Aucun élément trouvé.</p>
            )}
        </div>
    );
}
```

---

## 3. Foire aux Questions (FAQ) Pédagogique

### Q. Que signifie `useState('all')` ?
C'est la **valeur par défaut (initiale)** de l'état `filterValue` au moment où la page se charge pour la première fois. 
Cela garantit que l'option `<option value="all">` du `<select>` est pré-sélectionnée par défaut, et que tous les éléments s'affichent au premier rendu.

### Q. Pourquoi n'y a-t-il pas de condition `if (filterValue === 'all')` dans le code ?
Parce qu'on utilise une initialisation intelligente :
```js
let itemsAffiches = items;  Étape 1 : On commence avec TOUTE la liste
```
Si `filterValue` vaut `'all'`, aucune des conditions suivantes (`'actifs'`, `'inactifs'`, etc.) n'est validée. La variable `itemsAffiches` ne subit aucune modification et conserve sa valeur d'origine. C'est plus court et plus lisible qu'un long bloc de conditions `if/else`.

### Q. Quels sont les avantages de cette structure ?
1. **Pas de désynchronisation** : Si vous ajoutez, modifiez ou supprimez un élément de la liste principale, tous vos sous-filtres se mettent à jour instantanément sans aucun effort.
2. **Pas de boucle infinie** : Vous n'appelez pas de fonctions de mise à jour d'état (`setItemsFiltres`) dans le corps de votre composant lors du rendu.


import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api_admin from '../../api/api_admin'
import '../css/admin_style.css'

function ListProduit() {
    const [produit, setProduct] = useState([])
    const [loading, setLoading] = useState(true)
     const seuil = 5;
    const [message, setMessage] = useState('')
     const [filterType, setFilterType] = useState('all'); 

    const fetchProduits = async () => {
        try {
            const response = await api_admin.get('/admin/catalog/products?limit=1000')
            setProduct(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement des produit')
            setLoading(false)
        }
    }
    
     const produitsSansPromo = produit.filter(
         p => p.special_price === null || p.special_price === undefined || p.special_price == p.price
     );
     const produitsPasStock = produit.filter(
         p => p.inventories?.[0]?.qty == null || p.inventories?.[0]?.qty === 0
     );
     const produitsStockInferieurSeuil = produit.filter(
         p => p.inventories?.[0]?.qty !== null && p.inventories?.[0]?.qty !== undefined && p.inventories?.[0]?.qty < seuil
     );
     const produitsAvecPromo = produit.filter(
         p => p.special_price !== null && p.special_price !== undefined && p.special_price != p.price
     );

     let produitsFiltrer = produit;
     if (filterType === 'sans-promo') produitsFiltrer = produitsSansPromo;
     if (filterType === 'sans-stock') produitsFiltrer = produitsPasStock;
     if (filterType === 'stock-faible') produitsFiltrer = produitsStockInferieurSeuil;
     if (filterType === 'avec-promo') produitsFiltrer = produitsAvecPromo;


    useEffect(() => {
        fetchProduits()
    }, [])

    if (loading) return <div className="client-container">Chargement...</div>

    return (
        <div className="client-container">
            <h1>Liste des Produits</h1>

            {message && <p className="stock-badge">{message}</p>}
       
            <div className="filter-section" style={{ marginBottom: '20px' }}>
                <label htmlFor="product-filter">Filtrer par catégorie : </label>
                <select 
                    id="product-filter"
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="all">Tous les produits ({produit.length})</option>
                    <option value="sans-promo">Produits Sans Promo ({produitsSansPromo.length})</option>
                    <option value="sans-stock">Produits Pas de Stock ({produitsPasStock.length})</option>
                    <option value="stock-faible">Stock inférieur au seuil ({produitsStockInferieurSeuil.length})</option>
                    <option value="avec-promo">Produits Avec Promo ({produitsAvecPromo.length})</option>
                </select>
            </div> 

            <div className="card cart-table-container">
                <table className="cart-items">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Nom du Produit</th>
                            <th>SKU</th>
                            <th>Prix</th>
                            <th>Prix promo</th>
                            <th className="text-center">Stock reel</th>
                            <th className="text-center">Stock vendable</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    {produitsFiltrer.map(product => (
                            <tr key={product.id}>
                                <td className="img-cell">
                                    {product.images?.[0]?.url ? (
                                        <img src={product.images[0].url} alt={product.name} className="product-img" />
                                    ) : (
                                        <div className="no-image-placeholder">
                                            Aucune
                                        </div>
                                    )}
                                </td>
                                <td className="product-name-cell">{product.name}</td>
                                <td className="sku-cell">{product.sku}</td>
                                <td>{product.price} €</td>
                                <td>{product.special_price || 'Non defini'} </td>
                                <td className={`text-center stock-cell ${(product.inventories?.[0]?.qty || 0) > 0 ? 'stock-ok' : 'stock-empty'}`}>
                                    {product.inventories?.[0]?.qty || 0}
                                </td>
                                <td className={`text-center stock-cell ${(product.inventories?.[0]?.qty || 0) > 0 ? 'stock-ok' : 'stock-empty'}`}>
                                    {product.inventory_indices?.[0]?.qty || 0}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <Link to={`/admin/stock/add/${product.id}`} className="btn btn-primary btn-sm">
                                            Stock
                                        </Link>
                                        <Link to={`/admin/stock/info/${product.id}`} className="btn btn-outline btn-sm">
                                            Bilan
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))} 
                    </tbody>
                </table>
            </div>
                 {produitsFiltrer.length === 0 && !loading && (
                <p className="text-center mt-20">Aucun produit trouvé.</p>
            )} 


        </div>
    )
}

export default ListProduit