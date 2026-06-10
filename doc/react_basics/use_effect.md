# Guide d'Apprentissage : Le Hook `useEffect` en React

Le hook `useEffect` est utilisé pour gérer les effets de bord (side effects) dans vos composants React. Cela inclut le chargement de données depuis une API, la configuration d'abonnements, la manipulation manuelle du DOM ou la gestion de compteurs de temps.

---

## 1. Principe Fondamental
Un "effet de bord" est une action qui interagit avec l'extérieur du composant ou qui doit s'exécuter à un moment précis du cycle de vie du composant.

### Syntaxe :
```javascript
useEffect(() => {
    // Le code de l'effet à exécuter
    
    return () => {
        // Optionnel : Le code de nettoyage (cleanup)
    };
}, [dependances]);
```

---

## 2. Le Tableau de Dépendances : 3 Comportements Clés

Le comportement de `useEffect` varie entièrement selon ce que vous mettez dans le second paramètre (le tableau `[]`) :

| Tableau de Dépendances | Moment d'exécution | Exemple de cas d'utilisation |
| :--- | :--- | :--- |
| **Pas de tableau** (ex: `useEffect(() => {})`) | S'exécute à **chaque rendu** du composant (très rare et risqué). | Logs techniques très spécifiques. |
| **Tableau vide `[]`** | S'exécute **une seule fois**, juste après le premier affichage (montage). | Charger des données depuis une API au démarrage de la page. |
| **Avec variables `[id, filtre]`** | S'exécute au démarrage **ET** à chaque fois qu'une des variables du tableau change de valeur. | Recharger les produits quand on clique sur une autre catégorie. |

---

## 3. Cas d'utilisation Pratiques

### A. Charger des données API au démarrage de la page (`[]`) :
C'est le cas le plus courant. On veut charger les produits dès que l'utilisateur arrive sur la page.

```jsx
import { useState, useEffect } from 'react';
import api_client from '../../api/api_client';

function ListeProduits() {
    const [produits, setProduits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await api_client.get('/products');
                setProduits(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []); // Tableau vide : s'exécute UNE SEULE FOIS au chargement initial

    if (loading) return <p>Chargement des produits...</p>;

    return (
        <ul>
            {produits.map(p => <li key={p.id}>{p.name}</li>)}
        </ul>
    );
}
```

---

### B. Relancer une action quand une variable change (`[variable]`) :
Par exemple, recharger les produits à chaque fois que l'utilisateur clique sur une autre catégorie de produit.

```javascript
const { categoryId } = useParams(); // ID issu de l'URL
const [produits, setProduits] = useState([]);

useEffect(() => {
    const chargerCategorie = async () => {
        const res = await api_client.get(`/products?category_id=${categoryId}`);
        setProduits(res.data.data);
    };

    if (categoryId) {
        chargerCategorie();
    }
}, [categoryId]); // Se relance AUTOMATIQUEMENT à chaque changement de categoryId !
```

---

### C. Utiliser une fonction de Nettoyage (Cleanup Function)
Certains effets nécessitent de "nettoyer" après eux pour éviter les fuites de mémoire (memory leaks) ou les comportements étranges. Pour cela, on retourne une fonction à la fin du `useEffect`.

#### Exemple : Un composant d'horloge avec un intervalle
```jsx
import { useState, useEffect } from 'react';

function Chronometre() {
    const [secondes, setSecondes] = useState(0);

    useEffect(() => {
        // 1. Démarrer l'intervalle
        const interval = setInterval(() => {
            setSecondes(prev => prev + 1);
        }, 1000);

        // 2. Retourner la fonction de nettoyage
        // React l'appellera automatiquement quand le composant sera détruit (unmount)
        return () => {
            clearInterval(interval); // Arrête le timer pour libérer le processeur
        };
    }, []); // S'exécute au montage, nettoyage au démontage

    return <p>Temps écoulé : {secondes} secondes</p>;
}
```

---

## Le Piège Ultime : La Boucle Infinie
L'erreur de débutant la plus classique consiste à mettre à jour un state dans un `useEffect` tout en ayant ce même state dans le tableau de dépendances.

### Exemple de code buggé (Boucle Infinie) :
```javascript
const [compteur, setCompteur] = useState(0);

useEffect(() => {
    // 1. L'effet modifie le compteur
    setCompteur(compteur + 1);
}, [compteur]); // 2. L'effet observe le compteur. Dès qu'il change, il se relance ! -> CRASH !
```

### Règle de sécurité :
Ne placez dans votre tableau de dépendances que les variables extérieures à l'effet qui doivent déclencher sa mise à jour. N'y mettez pas les variables que vous modifiez à l'intérieur de ce même effet.
