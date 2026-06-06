# Tutoriel : La Requête PUT en React (Exemple de Mise à jour de Produit)

Ce guide explique comment réaliser une requête PUT en React en vous basant sur un exemple de modification de produit existant dans la base de données, sans déclarer de variable intermédiaire.

---

## Qu'est-ce qu'une Requête PUT ?
La requête PUT sert à modifier ou mettre à jour une ressource existante sur le serveur. Les nouvelles données remplacent ou complètent la ressource identifiée par l'identifiant dans l'URL.

---

## Analyse de la Structure (Étape par Étape)

### Étape 1 : Le useEffect pour charger la ressource initiale
Avant de pouvoir faire une mise à jour, le composant doit récupérer l'identifiant du produit depuis l'URL grâce au hook useParams, puis charger ses informations actuelles dès l'affichage grâce à useEffect :

```javascript
const { id } = useParams(); // ID du produit dans l'URL

const [name, setName] = useState('');
const [price, setPrice] = useState(0);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [message, setMessage] = useState('');

// Fonction pour récupérer les données actuelles du produit
const fetchProduit = async () => {
    try {
        const response = await api_admin.get(`/admin/catalog/products/${id}`);
        const product = response.data.data;
        setName(product.name || '');
        setPrice(product.price || 0);
        setLoading(false);
    } catch (error) {
        console.error("Erreur lors du chargement", error);
        setLoading(false);
    }
};

// Le useEffect écoute le changement d'ID de l'URL
useEffect(() => {
    if (id) {
        fetchProduit(); // Appelle la fonction de chargement initial
    }
}, [id]); // La dépendance [id] relance l'effet si on passe à un autre produit
```

---

### Étape 2 : L'envoi du PUT avec les données passées en ligne
Au moment de la soumission du formulaire, nous faisons appel à la méthode PUT. Tout comme pour le POST, nous n'utilisons pas de variable intermédiaire. Nous passons l'objet contenant les champs modifiés directement dans la méthode.

```javascript
const handleMettreAJourProduit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
        // Envoi en PUT avec les données passées directement en ligne
        await api_admin.put(`/admin/catalog/products/${id}`, {
            name: name,
            price: Number(price),
            channel: 'default',
            locale: 'fr'
        });

        // Réindexation Node essentielle pour synchroniser la boutique cliente
        try {
            await axios.put(`http://localhost:3001/api/update/product-index/${id}`, {});
            await axios.put(`http://localhost:3001/api/update/product-price-index/${id}`, {});
        } catch (idxErr) {
            console.error("Erreur de réindexation automatique", idxErr);
        }

        setMessage('Produit mis à jour avec succès !');
        fetchProduit(); // Recharger le produit pour rafraîchir l'affichage
    } catch (e) {
        console.error(e.response?.data);
        setMessage('Erreur lors de la mise à jour du produit');
    } finally {
        setSaving(false);
    }
};
```

---

## Ce qu'il faut retenir pour vos requêtes PUT :
1. L'URL ciblée : Le PUT cible l'URL de la ressource spécifique à modifier (en incluant son ID).
2. L'écriture en ligne : Les champs modifiés sont écrits directement dans le second argument de la méthode api_admin.put.
3. La réindexation obligatoire : Dans notre architecture, après avoir modifié les données (prix ou stock) d'un produit via l'API, il est indispensable de faire appel aux endpoints Node.js de mise à jour d'index (`product-index` et `product-price-index`) sous peine d'avoir des données obsolètes ou des erreurs de validation de stock côté boutique cliente.
4. Le rechargement des données : Récupérer à nouveau les données du serveur après la réussite du PUT permet de s'assurer de la cohérence de l'affichage.
