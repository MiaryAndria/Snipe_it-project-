# Ajout de Stock Global avec Cases à Cocher (Checkbox) en React

Ce guide explique comment implémenter et gérer une sélection multiple de produits via des cases à cocher (`checkbox`) afin d'appliquer une action globale (ici, un ajout de stock en lot) en React.

---

## 1. Principes Clés de l'Implémentation

> [!IMPORTANT]
> **1. State de Sélection Typé Objet**
> Pour manipuler facilement les produits sélectionnés, nous stockons la liste complète des objets produits sélectionnés :
> `const [selectedProduit, setSelectedProduit] = useState([])`
>
> **2. Fonction Toggle Générique**
> Pour ajouter ou retirer un produit de la sélection, on utilise `.some()` pour tester la présence et `.filter()` pour retirer :
> ```javascript
> const toggleProduct = (produit) => {
>     setSelectedProduit(prev => {
>         if (prev.some(p => p.id === produit.id)) {
>             return prev.filter(p => p.id !== produit.id)
>         } else {
>             return [...prev, produit] 
>         }
>     })
> }
> ```
>
> **3. Validation Collective**
> Avant d'envoyer les requêtes de mise à jour, on valide que la quantité est correcte et qu'au moins un produit a été sélectionné.

---

## 2. Code Complet du Composant `AddProduit`

Voici le code complet prêt à l'emploi :

```jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api_admin from '../../api/api_admin'
import '../css/admin_style.css'
import axios from 'axios'

function AddProduit() {
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [isError, setIsError] = useState(false)
    const [quantityAjouter , setQtyAjouter] = useState('0')
    const [selectedProduit , setSelectedProduit] = useState([])
    const navigate = useNavigate()

    const maxQuantity = 5

    // Réindexation après mise à jour
    const updateIndex = async (produitId) => {
        try {
            await axios.put(`http://localhost:3001/api/update/product-index/${produitId}`, {})
        } catch (idxErr) {
            console.error("Erreur de réindexation automatique", idxErr)
        }
    }

    // Récupération du catalogue de produits
    const fetchProduit = async () => {
        try {
            const response = await api_admin.get('/admin/catalog/products?sort=id&limit=100')
            setProduct(response.data.data)
            setLoading(false)
        } catch (error) {
            setMessage('Erreur lors du chargement du produit')
            setIsError(true)
            setLoading(false)
        }
    }

    // Filtrage pour exclure les produits en promotion (Derived State)
    const produitPasPromo = product?.filter(p => p.special_price === null) ?? []

    // Traitement de l'ajout en lot (Bulk Update)
    const handleAjouterStock = async () => {
        const qty = parseInt(quantityAjouter)
        if (isNaN(qty) || qty <= 0) {
            setMessage("Veuillez entrer une quantité valide")
            setIsError(true)
            return
        }
        if (qty > maxQuantity) {
            setMessage("La quantité ne peut pas dépasser " + maxQuantity)
            setIsError(true)
            return
        }
        if (selectedProduit.length === 0) {
            setMessage("Veuillez sélectionner au moins un produit")
            setIsError(true)
            return
        }
        
        setSaving(true)
        setMessage('')

        for (const produit of selectedProduit) {
            try {
                const stockActuel = produit?.inventories?.[0]?.qty || 0
                const nouveauStock = stockActuel + qty
                const productId = produit.id
                
                await api_admin.post(
                    `/admin/catalog/products/${productId}/inventories`,
                    { inventories: { "1": nouveauStock } }
                )

                await updateIndex(productId)
            } catch (e) {
                setMessage(e.message || "Une erreur est survenue")
                setSaving(false)
                setIsError(true)
                return
            }
        }
        
        setMessage("Stock ajouté avec succès !")
        setIsError(false)
        setSelectedProduit([])
        setQtyAjouter('0')
        setSaving(false)
        fetchProduit() // Recharger les produits pour afficher le stock actualisé
    }

    // Gestion de la sélection / désélection (Toggle)
    const toggleProduct = (produit) => {
        setSelectedProduit(prev => {
            if (prev.some(p => p.id === produit.id)) {
                return prev.filter(p => p.id !== produit.id)
            } else {
                return [...prev, produit] 
            }
        })
    }

    useEffect(() => {
        fetchProduit()
    }, [])

    if (loading) return <div className="client-container">Chargement...</div>

    if (!product) return (
        <div className="client-container">
            <p>Produit introuvable.</p>
            <button onClick={() => navigate('/admin/stock/list')}>Retour</button>
        </div>
    )

    return (
        <div className="client-container">
            <h1>Ajout de Stock Global</h1>
            
            {/* Liste de produits */}
            <div className="product-selection-list">
                <table>
                    <tbody>
                        {produitPasPromo.map(produit => (
                            <tr key={produit.id}>
                                <td>    
                                    <div style={{ marginTop: '1rem' }}>
                                        <p><strong>Nom :</strong> {produit.name}</p>
                                        <p><strong>Prix :</strong> {produit.price} €</p>
                                        <p><strong>Stock actuel :</strong> {produit.inventories?.[0]?.qty ?? 0}</p>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedProduit.some(p => p.id === produit.id)}
                                                onChange={() => toggleProduct(produit)}
                                            />
                                            Sélectionner ce produit
                                        </label>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Notification de statut */}
            {message && (
                <p style={{ color: isError ? '#c62828' : '#2e7d32', textAlign: 'center', marginTop: '1rem' }}>
                    {message}
                </p>
            )}

            {/* Formulaire de saisie du stock */}
            <div className="form-group" style={{ marginTop: '2rem' }}>
                <label>Quantité à ajouter (Max: {maxQuantity})</label>
                <input 
                    type="number" 
                    min="1"
                    max={maxQuantity}
                    className="input-field"
                    value={quantityAjouter} 
                    onChange={e => setQtyAjouter(e.target.value)} 
                    placeholder="5"
                    required
                />
            </div>

            {/* Bouton de confirmation */}
            <button
                onClick={handleAjouterStock}
                disabled={saving || parseInt(quantityAjouter) > maxQuantity || selectedProduit.length === 0} 
                style={{
                    display: 'block', 
                    margin: '1.5rem auto', 
                    padding: '0.85rem 2rem',
                    color: '#fff', 
                    backgroundColor: (saving || parseInt(quantityAjouter) > maxQuantity || selectedProduit.length === 0) ? '#ccc' : '#000',
                    border: 'none', 
                    borderRadius: '6px',
                    fontSize: '1rem', 
                    fontWeight: '600',
                    cursor: (saving || parseInt(quantityAjouter) > maxQuantity || selectedProduit.length === 0) ? 'not-allowed' : 'pointer'
                }}
            >
                {saving ? 'Mise à jour en cours...' : "Confirmer l'ajout de stock"}
            </button>
        </div>
    )
}

export default AddProduit
```

---

## 3. Détails Techniques & Bonnes Pratiques

### 💡 Validation du format HTML
Afin d'éviter l'erreur React de Hydratation (`In HTML, <div> cannot be a child of <tr>`), nous avons encapsulé tout le contenu à l'intérieur d'un élément **`<td>`** (table data).

### 💡 Vérification de l'état sélectionné
Pour la case à cocher, nous utilisons la méthode `.some()` :
```javascript
checked={selectedProduit.some(p => p.id === produit.id)}
```
Cela permet d'avoir un état booléen réactif et performant, propre au cycle de vie de React.
