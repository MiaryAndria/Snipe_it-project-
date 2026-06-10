# Guide d'Implémentation : Filtrage Multi-Critères Modulaire pour la Liste des Produits

Ce document présente l'implémentation complète et hautement modulaire du composant `ListProduit` en extrayant la logique de filtrage et de tri dans des **fonctions pures indépendantes**.

---

## 1. Pourquoi modulariser le code ?

> [!TIP]
> * **Lisibilité accrue** : Le corps du composant React reste court et facile à lire.
> * **Testabilité** : Vous pouvez facilement tester vos fonctions de filtrage et de tri indépendamment de l'interface graphique (tests unitaires).
> * **Réutilisabilité** : Ces fonctions peuvent être déplacées dans un dossier de helpers/utils pour être partagées avec d'autres fichiers du projet.

---

## 2. Fonctions de filtrage et tri (Helpers)

Voici les fonctions pures que nous sortons du composant pour structurer proprement notre code :

```javascript
// A. Fonction de recherche textuelle (Nom ou SKU)
export const matchesProductText = (product, searchTerm) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
        (product.name || '').toLowerCase().includes(query) || 
        (product.sku || '').toLowerCase().includes(query)
    );
};

// B. Fonction de filtrage par statut de Stock
export const matchesProductStock = (product, filter, minCritique, maxCritique) => {
    const qty = product.inventories?.[0]?.qty ?? 0;
    if (filter === 'rupture') {
        return qty === 0;
    }
    if (filter === 'critique') {
        return qty >= minCritique && qty <= maxCritique;
    }
    if (filter === 'normal') {
        return qty > maxCritique;
    }
    return true; // Si 'all', on accepte tout
};

// C. Fonction de tri générique
export const compareProducts = (a, b, sortField, sortOrder) => {
    let valA, valB;

    if (sortField === 'price') {
        valA = parseFloat(a.price) || 0;
        valB = parseFloat(b.price) || 0;
    } else if (sortField === 'qty') {
        valA = a.inventories?.[0]?.qty ?? 0;
        valB = b.inventories?.[0]?.qty ?? 0;
    } else {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
};
```

---

## 3. Code Source Complet du Composant : `ListProduit`

Voici le composant complet structuré avec les fonctions d'aide intégrées (déclarées à l'extérieur du composant pour éviter de les recréer à chaque rendu) :

```jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api_admin from '../../api/api_admin'
import '../css/admin_style.css'

// ==========================================
// FONCTIONS D'AIDE PURES (HELPERS) OUTSIDE COMPONENT
// ==========================================

const matchesProductText = (product, searchTerm) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
        (product.name || '').toLowerCase().includes(query) || 
        (product.sku || '').toLowerCase().includes(query)
    );
};

const matchesProductStock = (product, filter, minCritique, maxCritique) => {
    const qty = product.inventories?.[0]?.qty ?? 0;
    if (filter === 'rupture') return qty === 0;
    if (filter === 'critique') return qty >= minCritique && qty <= maxCritique;
    if (filter === 'normal') return qty > maxCritique;
    return true;
};

const compareProducts = (a, b, sortField, sortOrder) => {
    let valA, valB;

    if (sortField === 'price') {
        valA = parseFloat(a.price) || 0;
        valB = parseFloat(b.price) || 0;
    } else if (sortField === 'qty') {
        valA = a.inventories?.[0]?.qty ?? 0;
        valB = b.inventories?.[0]?.qty ?? 0;
    } else {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
};

// ==========================================
// COMPOSANT REACT PRINCIPAL
// ==========================================

function ListProduit() {
    const [produit, setProduct] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')

    // States pour les contrôles de filtrage
    const [searchTerm, setSearchTerm] = useState('')
    const [stockFilter, setStockFilter] = useState('all')
    
    // States pour le tri
    const [sortField, setSortField] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')

    const minCritique = 1;
    const maxCritique = 5;

    const fetchProduits = async () => {
        try {
            const response = await api_admin.get('/admin/catalog/products?limit=1000')
            setProduct(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement des produits')
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProduits();
    }, []);

    // ==========================================
    // RENDU DÉPRIVÉ (Derived State) ULTRA COURT & PROPRE
    // ==========================================
    const filteredAndSortedProducts = produit
        .filter(product => 
            matchesProductText(product, searchTerm) &&
            matchesProductStock(product, stockFilter, minCritique, maxCritique)
        )
        .sort((a, b) => compareProducts(a, b, sortField, sortOrder));

    if (loading) return <div className="client-container">Chargement...</div>

    return (
        <div className="client-container">
            <h1>Liste des Produits</h1>
            {message && <p className="stock-badge">{message}</p>}

            {/* BARRE DE FILTRAGE */}
            <div className="filter-bar" style={{
                background: '#fafafa',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                marginBottom: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    {/* Recherche par texte */}
                    <div style={{ flex: '1 1 250px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem' }}>Rechercher un produit</label>
                        <input
                            type="text"
                            placeholder="Nom ou SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>

                    {/* Filtre stock */}
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem' }}>Statut du Stock</label>
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', height: '38px' }}
                        >
                            <option value="all">Tous les niveaux de stock</option>
                            <option value="rupture">En rupture uniquement (0)</option>
                            <option value="critique">Stock critique (1 à 5)</option>
                            <option value="normal">Stock normal (> 5)</option>
                        </select>
                    </div>
                </div>

                {/* CONTROLES DU TRI */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #e0e0e0',
                    paddingTop: '1rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <label style={{ fontWeight: '600' }}>Trier par :</label>
                        <select
                            value={sortField}
                            onChange={(e) => setSortField(e.target.value)}
                            style={{ padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        >
                            <option value="name">Nom du produit</option>
                            <option value="price">Prix</option>
                            <option value="qty">Stock réel</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setSortOrder('asc')}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #000',
                                borderRadius: '4px',
                                background: sortOrder === 'asc' ? '#000' : '#fff',
                                color: sortOrder === 'asc' ? '#fff' : '#000',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            ↑ Croissant (ASC)
                        </button>
                        <button
                            onClick={() => setSortOrder('desc')}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #000',
                                borderRadius: '4px',
                                background: sortOrder === 'desc' ? '#000' : '#fff',
                                color: sortOrder === 'desc' ? '#fff' : '#000',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            ↓ Décroissant (DESC)
                        </button>
                    </div>
                </div>
            </div>

            {/* TABLEAU DES PRODUITS */}
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
                            <th className="text-center">Badge Statut</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedProducts.map(product => {
                            const qty = product.inventories?.[0]?.qty ?? 0;
                            const qtyVendable = product.inventory_indices?.[0]?.qty ?? 0;

                            let badgeText = 'Stock Normal';
                            let badgeStyle = { color: 'green', fontWeight: 'bold' };

                            if (qty === 0) {
                                badgeText = 'Rupture';
                                badgeStyle = { color: 'red', fontWeight: 'bold' };
                            } else if (qty >= minCritique && qty <= maxCritique) {
                                badgeText = 'Stock Critique';
                                badgeStyle = { color: 'orange', fontWeight: 'bold' };
                            }

                            return (
                                <tr key={product.id}>
                                    <td className="img-cell">
                                        {product.images?.[0]?.url ? (
                                            <img src={product.images[0].url} alt={product.name} className="product-img" />
                                        ) : (
                                            <div className="no-image-placeholder">Aucune</div>
                                        )}
                                    </td>
                                    <td className="product-name-cell">{product.name}</td>
                                    <td className="sku-cell">{product.sku}</td>
                                    <td>{product.price} €</td>
                                    <td>{product.special_price || 'Non defini'}</td>
                                    <td style={{ color: qty < minCritique ? 'red' : 'black' }} className={`text-center stock-cell ${qty > 0 ? 'stock-ok' : 'stock-empty'}`}>
                                        {qty}
                                    </td>
                                    <td style={{ color: qtyVendable < minCritique ? 'red' : 'black' }} className={`text-center stock-cell ${qtyVendable > 0 ? 'stock-ok' : 'stock-empty'}`}>
                                        {qtyVendable}
                                    </td>
                                    <td className="text-center" style={badgeStyle}>
                                        {badgeText}
                                    </td>
                                    <td className="text-center">
                                        <div className="action-buttons">
                                            <Link to={`/admin/stock/add/${product.id}`} className="btn btn-primary btn-sm">Stock</Link>
                                            <Link to={`/admin/stock/info/${product.id}`} className="btn btn-outline btn-sm">Bilan</Link>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredAndSortedProducts.length === 0 && !loading && (
                <p style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>Aucun produit trouvé.</p>
            )}
        </div>
    )
}

export default ListProduit;
```
