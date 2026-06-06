# Tutoriel : La Requête POST en React (Exemple d'Insertion de Produit)

Ce guide explique comment réaliser une requête POST en React en vous basant sur un exemple d'insertion de nouveau produit dans la base de données, sans déclarer de variable intermédiaire.

---

## Qu'est-ce qu'une Requête POST ?
La requête POST sert à envoyer de nouvelles données à un serveur pour créer une nouvelle ressource (par exemple, ajouter un nouveau produit). Les données sont envoyées directement dans le corps (body) sous forme d'objet passé en ligne.

---

## Analyse de la Structure (Étape par Étape)

### Étape 1 : Déclarer les States indispensables
Dans notre composant d'insertion de produit, nous utilisons des states pour suivre la saisie utilisateur dans le formulaire, l'état de chargement et les messages de retour :

```javascript
// Données du produit à créer
const [sku, setSku] = useState('');
const [name, setName] = useState('');
const [price, setPrice] = useState(0);
const [weight, setWeight] = useState(1);

// État de chargement lors de la sauvegarde API
const [saving, setSaving] = useState(false);

// Messages de succès ou d'erreur
const [message, setMessage] = useState('');
const [isError, setIsError] = useState(false);
```

---

### Étape 2 : L'envoi des données avec api_admin.post
Au lieu de déclarer une variable intermédiaire, nous passons l'objet contenant les champs directement dans les arguments de api_admin.post.

Voici la fonction d'envoi exacte :

```javascript
const handleInsererProduit = async (e) => {
    e.preventDefault(); // Empêche le rechargement par défaut du formulaire HTML
    setSaving(true);
    setMessage('');
    setIsError(false);

    try {
        // Requête POST directe avec l'objet passé en ligne
        const response = await api_admin.post('/admin/catalog/products', {
            sku: sku,
            name: name,
            price: Number(price),
            weight: Number(weight),
            status: 1,
            visible_individually: 1
        });

        // Succès
        setMessage(`Produit créé avec succès ! ID: ${response.data.data.id}`);
        setIsError(false);
        
        // Réinitialisation des champs du formulaire
        setSku('');
        setName('');
        setPrice(0);
        setWeight(1);
    } catch (e) {
        console.error(e.response?.data);
        setMessage('Erreur lors de la création du produit');
        setIsError(true);
    } finally {
        setSaving(false);
    }
};
```

---

## Conception du Bouton de Validation (JSX)
Pour préserver une expérience utilisateur optimale :
* Le bouton doit être désactivé pendant que la requête s'exécute (disabled={saving}).
* Le bouton utilise un style minimaliste Noir et Blanc.

```jsx
<button
    type="submit"
    disabled={saving}
    style={{
        marginTop: '1.5rem',
        width: '100%',
        padding: '0.85rem',
        background: '#000',
        color: '#fff',
        border: '2px solid #000',
        borderRadius: '2px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer'
    }}
>
    {saving ? 'Création en cours...' : "Confirmer l'insertion du produit"}
</button>
```

---

## Ce qu'il faut retenir pour vos requêtes POST :
1. Le corps JSON direct : On écrit l'objet à envoyer directement { ... } comme second paramètre de api_admin.post(url, { ... }).
2. L'état saving : Il protège votre serveur contre les clics multiples de l'utilisateur.
3. La réinitialisation : Pensez à réinitialiser les champs du formulaire après un succès pour permettre une nouvelle saisie.
