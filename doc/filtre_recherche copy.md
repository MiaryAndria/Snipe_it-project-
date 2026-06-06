# Tutoriel : Filtre par Recherche de Texte en React

Ce guide explique étape par étape comment implémenter un filtre de recherche par mot-clé (par exemple en recherchant dans le nom ou la description du produit) avec un champ texte `<input type="text" />` dans votre application React.

---

## Concept et Objectifs
Pour faire une recherche par texte, nous allons :
1. Créer une fonction `fetch` (notre équivalent de `getAll`) pour charger les produits depuis l'API.
2. Stocker la saisie de l'utilisateur dans un state React `termeRecherche`.
3. Utiliser un `useEffect` pour charger les produits au démarrage.
4. Filtrer dynamiquement la liste de produits à chaque fois que l'utilisateur tape une lettre, en comparant son texte avec le nom des produits.

---

## Implémentation Étape par Étape

### Étape 1 : Déclarer le State pour la recherche
Dans votre composant React, ajoutez un state pour enregistrer ce que l'utilisateur tape dans la barre de recherche :

```javascript
// Stocke le texte saisi dans le champ de recherche
const [termeRecherche, setTermeRecherche] = useState("");
```

---

### Étape 2 : La fonction d'API (`getAll`) et le `useEffect`
Nous récupérons tous les produits de la catégorie depuis notre API, puis nous utilisons `useEffect` pour déclencher ce chargement une seule fois au chargement du composant (ou lorsque l'identifiant de la catégorie change) :

```javascript
// 1. La fonction d'API pour tout récupérer
const fetch = async () => {
    try {
        setLoading(true);
        const response = await api_client.get(``);
        setX(response.data.data);
        setLoading(false);
    } catch (error) {
        console.error("Erreur lors du chargement ", error);
        setLoading(false);
    }
};

// 2. Le useEffect qui déclenche l'appel d'API automatiquement
useEffect(() => {
    if (id) {
        fetch();
    }
}, [id]); // Se déclenche au chargement et si l'id de la catégorie change
```

---

### Étape 3 : Filtrer dynamiquement la liste des produits
Avant d'afficher les produits dans le rendu JSX, nous créons un nouveau tableau filtré en utilisant la méthode `.filter()`. 

Pour rendre la recherche intelligente et insensible à la casse (majuscules/minuscules), nous convertissons le nom du produit et le texte recherché en minuscules avec `.toLowerCase()` :

```javascript
const produitsFiltrésParRecherche = produits.filter(produit => {

    // 2. Si le champ de recherche est vide, on garde tout le monde
    if (termeRecherche.trim() === "") return true;

    // 3. On vérifie si le nom du produit contient les lettres tapées
    const nomProduit = (produit.name || "").toLowerCase();
    const texteSaisi = termeRecherche.toLowerCase();

    return nomProduit.includes(texteSaisi);
});
```

---

### Étape 4 : Rendre la barre de recherche dans l'interface JSX
Ajoutez le code suivant au-dessus de votre liste de produits pour afficher un champ de saisie moderne et épuré (style minimaliste Noir & Blanc) :

```jsx
{/* --- BARRE DE RECHERCHE MINIMALISTE --- */}
<div className="search-container" style={{ margin: '20px 0 25px 0' }}>
    <input
        type="text"
        placeholder="Rechercher un produit par son nom..."
        value={termeRecherche}
        onChange={(e) => setTermeRecherche(e.target.value)}
        style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '1rem',
            border: '2px solid var(--border-color, #e2e2e2)',
            borderRadius: '4px',
            outline: 'none',
            background: '#fff',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s ease'
        }}
        // Petit effet au focus
        onFocus={(e) => e.target.style.borderColor = '#000'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border-color, #e2e2e2)'}
    />
</div>
```

---
```

## ASTUCE PRO : Comment cumuler Recherche + Filtre de Prix ?
Si vous voulez que l'utilisateur puisse chercher par nom **ET** limiter le prix maximum en même temps, c'est extrêmement simple ! Il suffit de combiner les deux conditions dans la fonction de filtrage :

```javascript
const produitsFiltrés = produits.filter(produit => {
    // 1. Exclure les configurables
    if (produit.type === "configurable") return false;

    // 2. Condition Prix
    const prixActif = obtenirPrixActif(produit);
    const respectePrix = prixActif <= prixFiltre;

    // 3. Condition Recherche
    const nomProduit = (produit.name || "").toLowerCase();
    const respecteRecherche = nomProduit.includes(termeRecherche.toLowerCase());

    // Le produit doit respecter les DEUX filtres pour être affiché
    return respectePrix && respecteRecherche;
});
```

Grâce à cette structure, vos deux filtres fonctionnent ensemble en harmonie parfaite !
