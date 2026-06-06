# Guide d'Apprentissage : Le Hook `useState` en React

Le hook `useState` est la base absolue pour ajouter et manipuler des états (state) dans vos composants fonctionnels React. Ce guide complet explique ses principes de fonctionnement et ses divers cas d'utilisation (des types simples aux objets/tableaux complexes).

---

## 1. Qu'est-ce que le State (l'État) ?
En React, le State représente des variables internes à un composant qui, lorsqu'elles changent, déclenchent automatiquement une re-mise à jour (re-render) de l'interface utilisateur (le DOM) pour afficher la nouvelle valeur.

### Syntaxe de base :
```javascript
const [variable, setVariable] = useState(valeurInitiale);
```
* `variable` : Le nom de la variable qui stocke l'état actuel.
* `setVariable` : La fonction pour mettre à jour cette variable.
* `valeurInitiale` : L'état initial du composant (nombre, texte, tableau, objet, etc.).

---

## 2. Gérer des types primitifs (Texte, Nombre, Booléen)

### A. Cas d'un Compteur (Nombre) :
```jsx
import { useState } from 'react';

function Compteur() {
    const [compte, setCompte] = useState(0);

    return (
        <div>
            <p>Valeur actuelle : {compte}</p>
            <button onClick={() => setCompte(compte + 1)}>Incrémenter</button>
        </div>
    );
}
```

### B. Cas d'un Champ Texte (Formulaire Contrôlé) :
```jsx
import { useState } from 'react';

function ChampTexte() {
    const [nom, setNom] = useState('');

    return (
        <div>
            <input 
                type="text" 
                value={nom} 
                onChange={(e) => setNom(e.target.value)} 
                placeholder="Entrez votre nom"
            />
            <p>Bonjour {nom || "visiteur"} !</p>
        </div>
    );
}
```

---

## 3. Les Mises à jour fonctionnelles (Functional Updates)
Si votre nouvel état dépend de la valeur de l'état précédent (comme dans un compteur ou un bouton à bascule), il est fortement recommandé d'utiliser une mise à jour fonctionnelle. 

### Mauvaise pratique :
```javascript
setCompte(compte + 1);
```
*(Si vous appelez cette ligne 3 fois de suite, React peut regrouper les appels et n'ajouter que +1 au total).*

### Bonne pratique :
Passez une fonction de rappel (callback) qui reçoit la valeur la plus à jour sous le nom de `prev` :
```javascript
setCompte(prevCompte => prevCompte + 1);
```

---

## 4. Gérer des Objets et des Tableaux (Non-Primitifs)
**Règle d'or absolue en React : Ne modifiez JAMAIS directement le state.** 
Vous devez toujours créer une nouvelle copie de l'objet ou du tableau en utilisant le Spread Operator (`...`) pour que React comprenne que le state a changé.

### A. Mettre à jour un Objet (ex: informations d'un produit) :
```jsx
const [produit, setProduit] = useState({
    sku: 'TSHIRT-01',
    nom: 'T-shirt Blanc',
    prix: 25
});

// Modifier le prix sans écraser le SKU ou le Nom :
const augmenterPrix = () => {
    setProduit(prev => ({
        ...prev,       // Copie tous les anciens champs
        prix: prev.prix + 5 // Écrase uniquement le prix
    }));
};
```

### B. Ajouter un élément dans un Tableau (ex: liste d'achats) :
```jsx
const [panier, setPanier] = useState(['Chemise', 'Pantalon']);

// ERREUR : panier.push('Chaussettes') ne déclenchera pas de rendu !

// BON :
const ajouterAuPanier = (article) => {
    setPanier(prev => [...prev, article]); // Crée un nouveau tableau avec l'article ajouté
};
```

### C. Retirer un élément d'un Tableau :
```javascript
const [panier, setPanier] = useState(['Chemise', 'Pantalon', 'Veste']);

const supprimerDuPanier = (articleASupprimer) => {
    setPanier(prev => prev.filter(item => item !== articleASupprimer));
};
```

---

## Règles d'Or des Hooks en React
1. **N'appelez pas de hooks dans des boucles, des conditions ou des fonctions imbriquées.** Déclarez-les toujours au tout début de votre composant fonctionnel.
2. **Appelez uniquement des hooks depuis des fonctions React** (les composants fonctionnels ou les hooks personnalisés).
