# Guide d'Implémentation : Filtrage Multi-Critères Modulaire pour la Gestion des Commandes

Ce document présente l'implémentation complète et modulaire pour filtrer et trier les **Commandes Clients** sous React en extrayant la logique algorithmique dans des **fonctions pures indépendantes**.

---

## 1. Fonctions de filtrage et tri (Helpers)

En sortant ces fonctions du composant React, nous séparons le rendu visuel de la logique de calcul de données :

```javascript
// A. Recherche textuelle du client (Nom complet ou Email)
export const matchesCustomer = (order, searchCustomer) => {
    const query = searchCustomer.trim().toLowerCase();
    if (!query) return true;
    
    const customerName = `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.toLowerCase();
    const customerEmail = (order.customer_email || '').toLowerCase();
    
    return customerName.includes(query) || customerEmail.includes(query);
};

// B. Filtrage par date de création (YYYY-MM-DD)
export const matchesOrderDate = (order, startDate, endDate) => {
    const dateStr = order.created_at; // Ex: "2026-05-25 17:00:00"
    let matches = true;

    if (startDate) {
        matches = matches && (dateStr >= startDate);
    }
    if (endDate) {
        matches = matches && (dateStr.substring(0, 10) <= endDate);
    }
    return matches;
};

// C. Filtrage par Prix total (grand_total)
export const matchesOrderPrice = (order, minPrice, maxPrice) => {
    const total = parseFloat(order.grand_total) || 0;
    const matchesMin = minPrice === '' || total >= parseFloat(minPrice);
    const matchesMax = maxPrice === '' || total <= parseFloat(maxPrice);
    
    return matchesMin && matchesMax;
};

// D. Comparaison pour le tri des commandes
export const compareOrders = (a, b, sortField, sortOrder) => {
    let valA, valB;

    if (sortField === 'grand_total') {
        valA = parseFloat(a.grand_total) || 0;
        valB = parseFloat(b.grand_total) || 0;
    } else {
        // Tri par date
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
};
```

---

## 2. Code Source Complet du Composant : `ListCommandes`

Voici le composant React complet structuré avec les fonctions d'aide déclarées à l'extérieur du composant :

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api_admin from '../../api/api_admin';
import '../css/admin_style.css';

// ==========================================
// FONCTIONS D'AIDE PURES (HELPERS) OUTSIDE COMPONENT
// ==========================================

const matchesCustomer = (order, searchCustomer) => {
    const query = searchCustomer.trim().toLowerCase();
    if (!query) return true;
    
    const customerName = `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.toLowerCase();
    const customerEmail = (order.customer_email || '').toLowerCase();
    
    return customerName.includes(query) || customerEmail.includes(query);
};

const matchesOrderDate = (order, startDate, endDate) => {
    const dateStr = order.created_at || '';
    let matches = true;

    if (startDate) {
        matches = matches && (dateStr >= startDate);
    }
    if (endDate) {
        matches = matches && (dateStr.substring(0, 10) <= endDate);
    }
    return matches;
};

const matchesOrderPrice = (order, minPrice, maxPrice) => {
    const total = parseFloat(order.grand_total) || 0;
    const matchesMin = minPrice === '' || total >= parseFloat(minPrice);
    const matchesMax = maxPrice === '' || total <= parseFloat(maxPrice);
    return matchesMin && matchesMax;
};

const compareOrders = (a, b, sortField, sortOrder) => {
    let valA, valB;

    if (sortField === 'grand_total') {
        valA = parseFloat(a.grand_total) || 0;
        valB = parseFloat(b.grand_total) || 0;
    } else {
        valA = new Date(a.created_at || 0).getTime();
        valB = new Date(b.created_at || 0).getTime();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
};

// ==========================================
// COMPOSANT REACT PRINCIPAL
// ==========================================

function ListCommandes() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // States pour la recherche et le filtrage
    const [searchCustomer, setSearchCustomer] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // States de Tri
    const [sortField, setSortField] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    const fetchOrders = async () => {
        try {
            const response = await api_admin.get('/admin/sales/orders?limit=1000');
            setOrders(response.data.data);
            setLoading(false);
        } catch (error) {
            setMessage('Erreur lors du chargement des commandes');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // ==========================================
    // RENDU DÉRIVÉ (Derived State) COURT ET LISIBLE
    // ==========================================
    const filteredAndSortedOrders = orders
        .filter(order => 
            matchesCustomer(order, searchCustomer) &&
            matchesOrderDate(order, startDate, endDate) &&
            matchesOrderPrice(order, minPrice, maxPrice)
        )
        .sort((a, b) => compareOrders(a, b, sortField, sortOrder));

    if (loading) return <div className="client-container">Chargement des commandes...</div>;

    return (
        <div className="client-container">
            <h1>Gestion des Commandes</h1>
            {message && <p className="stock-badge">{message}</p>}

            {/* CONTROLES DE RECHERCHE ET FILTRES */}
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
                {/* Ligne 1 : Client & Prix */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: '2 1 300px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem' }}>Rechercher un Client</label>
                        <input
                            type="text"
                            placeholder="Nom, prénom ou email..."
                            value={searchCustomer}
                            onChange={(e) => setSearchCustomer(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                    
                    <div style={{ flex: '1 1 120px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem' }}>Prix Min ($)</label>
                        <input
                            type="number"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>

                    <div style={{ flex: '1 1 120px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem' }}>Prix Max ($)</label>
                        <input
                            type="number"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                </div>

                {/* Ligne 2 : Plage de Dates */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem' }}>Date Début</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>

                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.3rem' }}>Date Fin</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                </div>

                {/* Ligne 3 : Tri */}
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
                            <option value="created_at">Date de commande</option>
                            <option value="grand_total">Prix total</option>
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
                            ↑ Plus ancien (ASC)
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
                            ↓ Récent d'abord (DESC)
                        </button>
                    </div>
                </div>
            </div>

            {/* RÉSULTAT DU FILTRAGE */}
            <p><strong>{filteredAndSortedOrders.length}</strong> commande(s) trouvée(s)</p>

            <div className="card cart-table-container">
                <table className="cart-items" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem' }}>ID Commande</th>
                            <th style={{ padding: '0.75rem' }}>Client</th>
                            <th style={{ padding: '0.75rem' }}>Email</th>
                            <th style={{ padding: '0.75rem' }}>Date</th>
                            <th style={{ padding: '0.75rem' }}>Total</th>
                            <th style={{ padding: '0.75rem' }}>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedOrders.map(order => (
                            <tr key={order.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{order.increment_id || `#${order.id}`}</td>
                                <td style={{ padding: '0.75rem' }}>{order.customer_first_name} {order.customer_last_name}</td>
                                <td style={{ padding: '0.75rem' }}>{order.customer_email}</td>
                                <td style={{ padding: '0.75rem' }}>{order.created_at}</td>
                                <td style={{ padding: '0.75rem' }}>{order.formatted_grand_total || `${order.grand_total} $`}</td>
                                <td style={{ padding: '0.75rem' }}>
                                    <span className={`status-badge ${order.status.toLowerCase()}`} style={{
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        fontWeight: 'bold',
                                        fontSize: '0.85rem',
                                        backgroundColor: order.status === 'completed' ? '#d4edda' : order.status === 'pending' ? '#fff3cd' : '#d1ecf1',
                                        color: order.status === 'completed' ? '#155724' : order.status === 'pending' ? '#856404' : '#0c5460'
                                    }}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredAndSortedOrders.length === 0 && (
                <p style={{ textAlign: 'center', marginTop: '2rem', color: '#666' }}>Aucune commande trouvée.</p>
            )}
        </div>
    );
}

export default ListCommandes;
```
