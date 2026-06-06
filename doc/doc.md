# Guide d'Implémentation : Retrait de Stock par Sélection Multiple (Checkboxes)

Ce guide décrit comment transformer un sélecteur de catégorie unique en liste de cases à cocher (**checkboxes**) pour permettre le retrait de stock global sur **plusieurs catégories en même temps**.

> [!NOTE]
> Cette approche améliore considérablement l'expérience utilisateur (UX) en évitant des allers-retours répétitifs pour chaque catégorie.

---

## 1. Tableau Comparatif : Sélecteur Unique vs Sélection Multiple

| Fonctionnalité | Version Inituelle (Dropdown `select`) | Version Améliorée (Checkboxes Multiples) |
| :--- | :--- | :--- |
| **Sélection** | Une seule catégorie à la fois | **Plusieurs catégories simultanées** |
| **State principal** | `selectedCategorie` (chaîne de caractères `""`) | `selectedCategories` (tableau d'identifiants `[]`) |
| **Composant UI** | `<select>` standard HTML | Liste scrollable d'éléments `<input type="checkbox">` |
| **Requête & Filtrage** | Récupère et filtre pour **1** ID | Récupère et filtre pour **tous** les IDs cochés |
| **Fonctionnalités bonus** | Aucune | Bouton **"Tout cocher / Tout décocher"** + Badges dynamiques |

---

## 2. Les 4 Changements Techniques Clés

### 💻 Étape 1 : Modification des States
Nous remplaçons la chaîne de caractères simple par un tableau vide dans les états (`useState`).

```javascript
// AVANT
const [selectedCategorie, setSelectedCategorie] = useState('')

// APRÈS
const [selectedCategories, setSelectedCategories] = useState([])
```

---

### 🔄 Étape 2 : Filtrage multi-catégories des produits
Nous modifions la fonction de récupération pour que le filtre accepte **n'importe quelle** catégorie présente dans notre tableau de sélection `selectedCategories`.

```javascript
const getProduitsByCategories = async (categoryIds) => {
    if (!categoryIds || categoryIds.length === 0) {
        setProduits([])
        return 
    }
    setLoadingProduits(true)
    try {
        const response = await api_admin.get('/admin/catalog/products?sort=id&limit=100')
        const all = response.data.data || []
        
        // On filtre si le produit possède au moins une catégorie sélectionnée
        const filtrer = all.filter(p =>
            p.categories && p.categories.some(c => categoryIds.includes(c.id.toString()))
        )
        setProduits(filtrer)
    } catch (e) {
        setMessage('Erreur lors du chargement des produits')
    } finally {
        setLoadingProduits(false)
    }
}
```

---

### 🖱️ Étape 3 : Gestion du Cochement (Toggle)
La fonction ajoute l'ID au tableau s'il n'y est pas, ou le retire s'il y est déjà, puis actualise les produits.

```javascript
const handleCategorieCheckboxChange = (catId) => {
    const idStr = catId.toString()
    
    const updatedSelection = selectedCategories.includes(idStr)
        ? selectedCategories.filter(id => id !== idStr) // Décochement
        : [...selectedCategories, idStr]               // Cochement
        
    setSelectedCategories(updatedSelection)
    getProduitsByCategories(updatedSelection)
}
```

---

### 🖼️ Étape 4 : Interface utilisateur Modernisée (Scroll & Checkboxes)
À la place de la liste déroulante étroite, nous créons un conteneur esthétique avec barre de défilement, des labels cliquables, et un bouton de sélection globale rapide.

```jsx
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <label style={{ fontWeight: '500' }}>Sélectionnez les catégories</label>
    <button 
        type="button" 
        onClick={toggleAllCategories}
        style={{ fontSize: '0.8rem', background: 'none', border: 'none', color: '#0288d1', cursor: 'pointer', fontWeight: '600' }}
    >
        {selectedCategories.length === categories.length ? 'Tout décocher' : 'Tout cocher'}
    </button>
</div>

<div style={{ 
    maxHeight: '180px', 
    overflowY: 'auto', 
    border: '1px solid var(--border-color)', 
    borderRadius: '4px', 
    padding: '0.75rem', 
    backgroundColor: 'var(--background-primary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
}}>
    {categories.map(cat => (
        <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
            <input 
                type="checkbox"
                checked={selectedCategories.includes(cat.id.toString())}
                onChange={() => handleCategorieCheckboxChange(cat.id)}
            />
            {cat.name}
        </label>
    ))}
</div>
```

---

## 3. Code Complet Réfactorisé : `RemoveStock`

Voici le composant React complet modifié intégrant la sélection multi-catégories avec les cases à cocher :

```jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api_admin from '../../api/api_admin'
import '../css/admin_style.css'
import axios from 'axios'

function RemoveStock() {
    const [categories , setCategories] = useState([])
    const [produits, setProduits] = useState([])
    const [selectedCategories , setSelectedCategories] = useState([]) // Tableau des IDs de catégories sélectionnées
    const [quantite , setQuantite]= useState(1)
    const [loading , setLoading] = useState(false)
    const [loadingProduits , setLoadingProduits] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [isError, setIsError] = useState(false)
    const [stats , setStats] = useState(null)

    const updateIndex = async (produitId) => {
        try {
            await axios.put(`http://localhost:3001/api/update/product-index/${produitId}`, {})
        } catch (idxErr) {
            console.error("Erreur de réindexation automatique", idxErr)
        }
    }

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const response = await api_admin.get('/admin/catalog/categories?limit=1000')
            setCategories(response.data.data || [])
        } catch (error) {
            setMessage('Erreur lors du chargement des categories')
        } finally {
            setLoading(false)
        }
    }

    const getProduitsByCategories = async (categoryIds) => {
        if (!categoryIds || categoryIds.length === 0) {
            setProduits([])
            return 
        }
        setLoadingProduits(true)
        try {
            const response = await api_admin.get('/admin/catalog/products?sort=id&limit=100')
            const all = response.data.data || []
            const filtrer = all.filter(p =>
                p.categories && p.categories.some(c => categoryIds.includes(c.id.toString()))
            )
            setProduits(filtrer)
        } catch (e) {
            setMessage('Erreur lors du chargement des produits')
        } finally {
            setLoadingProduits(false)
        }
    }
    
    const calculerDemande = () => {
        return produits.length * quantite
    }
    
    const calculerRealise = (res) => {
        if (!res || !Array.isArray(res) || res.length === 0) {
            return 0
        }
        return res.reduce((sum, r) => sum + (r.enleve || 0), 0)
    }

    const enleverStockProduit = async (produit) => {
        const stockActuel = produit.inventories?.[0]?.qty || 0
        const aEnlever = Math.min(quantite, stockActuel)
        const nouveauStock = stockActuel - aEnlever

        await api_admin.post(
            `/admin/catalog/products/${produit.id}/inventories`,
            { inventories: { "1": nouveauStock } }
        )
        await updateIndex(produit.id)

        return {
            id: produit.id,
            name: produit.name,
            stockAvant: stockActuel,
            enleve: aEnlever,
            stockApres: nouveauStock
        }
    }

    const handleRemove = async () => {
        if (selectedCategories.length === 0) {
            setMessage('Veuillez sélectionner au moins une catégorie')
            setIsError(true)
            return
        }
        if (quantite <= 0) {
            setMessage('La quantité doit être supérieure à 0')
            setIsError(true)
            return
        }
        if (produits.length === 0) {
            setMessage('Aucun produit dans les catégories sélectionnées')
            setIsError(true)
            return
        }

        setSaving(true)
        setMessage('')
        setStats(null)

        const localResultats = []

        for (const produit of produits) {
            try {
                const r = await enleverStockProduit(produit)
                localResultats.push(r)
            } catch (e) {
                console.error(`Erreur produit ${produit.id}:`, e.response?.data)
                localResultats.push({
                    id: produit.id,
                    name: produit.name,
                    stockAvant: produit.inventories?.[0]?.qty || 0,
                    enleve: 0,
                    stockApres: produit.inventories?.[0]?.qty || 0
                })
            }
        }

        const demande = calculerDemande()
        const realise = calculerRealise(localResultats)

        setStats({
            demande,
            realise,
            details: localResultats
        })

        setMessage('Opération terminée !')
        setIsError(false)
        await getProduitsByCategories(selectedCategories)
        setSaving(false)
    }

    const handleCategorieCheckboxChange = (catId) => {
        const idStr = catId.toString()
        const updatedSelection = selectedCategories.includes(idStr)
            ? selectedCategories.filter(id => id !== idStr)
            : [...selectedCategories, idStr]

        setSelectedCategories(updatedSelection)
        getProduitsByCategories(updatedSelection)
    }

    const toggleAllCategories = () => {
        if (selectedCategories.length === categories.length) {
            setSelectedCategories([])
            setProduits([])
        } else {
            const allIds = categories.map(cat => cat.id.toString())
            setSelectedCategories(allIds)
            getProduitsByCategories(allIds)
        }
    }

    const handleQuantiteChange = (val) => {
        const n = parseInt(val)
        if (isNaN(n) || n < 0) setQuantite(0)
        else setQuantite(n)
    }
    
    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="admin-container" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', background: 'var(--background-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Retrait de stock global</h1>
            
            {message && (
                <div style={{
                    padding: '0.75rem 1rem',
                    marginBottom: '1.5rem',
                    borderRadius: '4px',
                    backgroundColor: isError ? '#fde8e8' : '#e1f5fe',
                    color: isError ? '#e53935' : '#0288d1',
                    border: `1px solid ${isError ? '#f8b4b4' : '#b3e5fc'}`
                }}>
                    {message}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Chargement des catégories...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontWeight: '500' }}>Choisissez les catégories</label>
                            <button 
                                type="button" 
                                onClick={toggleAllCategories}
                                style={{ fontSize: '0.8rem', background: 'none', border: 'none', color: '#0288d1', cursor: 'pointer', fontWeight: '600' }}
                            >
                                {selectedCategories.length === categories.length ? 'Tout décocher' : 'Tout cocher'}
                            </button>
                        </div>
                        
                        <div style={{ 
                            maxHeight: '180px', 
                            overflowY: 'auto', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '4px', 
                            padding: '0.75rem', 
                            backgroundColor: 'var(--background-primary)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                        }}>
                            {categories.map(cat => (
                                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                                    <input 
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat.id.toString())}
                                        onChange={() => handleCategorieCheckboxChange(cat.id)}
                                    />
                                    {cat.name}
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    {loadingProduits && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Chargement des produits des catégories sélectionnées...</p>
                    )}

                    {!loadingProduits && selectedCategories.length > 0 && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            Nombre de produits trouvés : <strong>{produits.length}</strong> dans <strong>{selectedCategories.length}</strong> catégories
                        </p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontWeight: '500' }}>Quantité à retirer par produit</label>
                        <div style={{ display: 'flex', alignItems: 'stretch', gap: '0.5rem' }}>
                            <button 
                                type="button"
                                onClick={() => handleQuantiteChange(quantite - 1)}
                                style={{
                                    padding: '0 1rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    backgroundColor: 'var(--background-secondary)',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min="0"
                                value={quantite}
                                onChange={e => handleQuantiteChange(e.target.value)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--background-primary)',
                                    color: 'var(--text-color)',
                                    textAlign: 'center',
                                    flex: 1
                                }}
                            />
                            <button 
                                type="button"
                                onClick={() => handleQuantiteChange(quantite + 1)}
                                style={{
                                    padding: '0 1rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '4px',
                                    backgroundColor: 'var(--background-secondary)',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={handleRemove}
                        disabled={saving || selectedCategories.length === 0 || produits.length === 0}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'var(--primary-color, #000)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: '600',
                            cursor: (saving || selectedCategories.length === 0 || produits.length === 0) ? 'not-allowed' : 'pointer',
                            opacity: (saving || selectedCategories.length === 0 || produits.length === 0) ? 0.6 : 1,
                            marginTop: '0.5rem',
                            textAlign: 'center'
                        }}
                    >
                        {saving ? 'Traitement en cours...' : 'Retirer le stock'}
                    </button>
                </div>
            )}
            
            {stats && (
                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Statistiques du dernier retrait</h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1rem', backgroundColor: 'var(--background-primary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Demandé</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.demande}</div>
                        </div>
                        <div style={{ padding: '1rem', backgroundColor: 'var(--background-primary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Réalisé</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: stats.realise > 0 ? '#4caf50' : 'inherit' }}>{stats.realise}</div>
                        </div>
                    </div>

                    {stats.details && stats.details.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>Détails par produit</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {stats.details.map((detail, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                                        <span>{detail.name}</span>
                                        <span style={{ fontWeight: '500' }}>
                                            {detail.stockAvant} &rarr; {detail.stockApres} (-{detail.enleve})
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default RemoveStock
```

---

## 4. Recommandations et Bonnes Pratiques

* **Performances & Limites** : Puisque la sélection multiple permet de charger des produits de plusieurs catégories en même temps, assurez-vous que la limite de l'API (`limit=100`) reste adaptée pour éviter des temps de réponse trop longs ou des dépassements de mémoire côté client.
* **Derived State** : Le calcul du nombre total de produits et catégories est directement dérivé des tableaux de state (`produits.length` et `selectedCategories.length`), évitant ainsi d'introduire des states redondants propices aux bugs de désynchronisation.
