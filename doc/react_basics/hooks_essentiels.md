# Guide de Référence : Les Autres Hooks Essentiels en React

En plus de `useState` et `useEffect`, React propose plusieurs hooks fondamentaux très puissants pour optimiser les performances de vos composants, interagir directement avec le DOM ou gérer des données globales.

Ce guide couvre les 4 hooks essentiels à connaître : `useMemo`, `useCallback`, `useRef` et `useContext`.

---

## 1. `useMemo` : Mémoriser un calcul coûteux
`useMemo` permet de mettre en cache (mémoriser) le résultat d'un calcul complexe afin de ne pas le recalculer à chaque rendu du composant, sauf si l'une des dépendances change.

### Cas d'utilisation typique : 
Filtrer ou trier une très longue liste de produits.

```jsx
import { useState, useMemo } from 'react';

function CatalogueProduits({ produits }) {
    const [recherche, setRecherche] = useState('');

    // useMemo va garder en mémoire la liste filtrée.
    // Elle ne sera recalculée QUE si la recherche OU la liste de produits change.
    const produitsFiltrés = useMemo(() => {
        console.log("Calcul de filtrage en cours..."); // Ne s'affichera que lorsque c'est nécessaire
        return produits.filter(p => p.name.toLowerCase().includes(recherche.toLowerCase()));
    }, [recherche, produits]); // Dépendances

    return (
        <div>
            <input type="text" value={recherche} onChange={e => setRecherche(e.target.value)} />
            <ul>
                {produitsFiltrés.map(p => <li key={p.id}>{p.name}</li>)}
            </ul>
        </div>
    );
}
```

---

## 2. `useCallback` : Mémoriser la définition d'une fonction
En React, à chaque fois qu'un composant se recharge, toutes les fonctions déclarées à l'intérieur sont recréées à zéro. `useCallback` permet de conserver la même référence de fonction d'un rendu à l'autre.

### Cas d'utilisation typique :
Passer une fonction de callback à un composant enfant optimisé (avec `React.memo`) pour éviter qu'il ne se recharge inutilement.

```jsx
import { useState, useCallback } from 'react';
import BoutonEnfantOptimise from './BoutonEnfantOptimise'; // Un composant enveloppé dans React.memo

function Parent() {
    const [compte, setCompte] = useState(0);

    // useCallback garantit que handleClic garde la même référence mémoire.
    // Le composant enfant ne subira aucun re-render inutile.
    const handleClic = useCallback(() => {
        console.log("Clic enregistré !");
    }, []); // Pas de dépendances : la fonction est créée une seule fois

    return (
        <div>
            <p>Compte : {compte}</p>
            <button onClick={() => setCompte(compte + 1)}>Recharger Parent</button>
            <BoutonEnfantOptimise onClick={handleClic} />
        </div>
    );
}
```

---

## 3. `useRef` : Accéder au DOM et stocker des valeurs persistantes
`useRef` renvoie un objet mutable avec une propriété `.current`. Il a deux rôles majeurs :
1. Accéder directement à un élément HTML du DOM (ex: donner le focus à un champ texte ou scroller).
2. Stocker une variable persistante qui ne déclenche aucun re-render lorsqu'elle change de valeur (contrairement à `useState`).

### Exemple A : Donner le focus à un champ de saisie
```jsx
import { useRef } from 'react';

function FocusInput() {
    const inputEl = useRef(null); // Création de la référence

    const clickPourFocus = () => {
        // Accès direct à l'élément HTML natif et focus
        inputEl.current.focus();
    };

    return (
        <div>
            <input ref={inputEl} type="text" placeholder="Cliquez sur le bouton pour écrire ici..." />
            <button onClick={clickPourFocus}>Donner le focus</button>
        </div>
    );
}
```

---

## 4. `useContext` : Partager des données globales sans prop-drilling
`useContext` permet de partager des données (comme l'utilisateur connecté, le panier d'achat ou le thème graphique) avec l'ensemble des composants de l'application sans avoir à passer les props manuellement à chaque niveau intermédiaire.

### Exemple : Partager le thème sombre/clair
```jsx
import { createContext, useContext, useState } from 'react';

// 1. Créer le contexte
const ThemeContext = createContext();

function App() {
    const [theme, setTheme] = useState('light');

    return (
        // 2. Fournir la valeur aux composants enfants
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <Page />
        </ThemeContext.Provider>
    );
}

function Page() {
    return <Card />; // Pas besoin de lui passer la prop theme !
}

function Card() {
    // 3. Consommer le contexte directement dans n'importe quel enfant profond !
    const { theme, setTheme } = useContext(ThemeContext);

    return (
        <div style={{ background: theme === 'light' ? '#fff' : '#000', color: theme === 'light' ? '#000' : '#fff', padding: '20px' }}>
            <p>Le thème actuel est : {theme}</p>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                Changer de thème
            </button>
        </div>
    );
}
```

---

## Résumé des Hooks Essentiels

| Hook | Rôle Principal | Déclenche un Re-render ? |
| :--- | :--- | :--- |
| **`useState`** | Stocker une valeur qui modifie l'affichage en temps réel. | **Oui** |
| **`useEffect`** | Exécuter du code à un moment précis (API, cycle de vie). | Non |
| **`useMemo`** | Mémoriser la **valeur** d'un calcul lourd. | Non |
| **`useCallback`** | Mémoriser la **référence** d'une fonction de rappel. | Non |
| **`useRef`** | Accéder au DOM ou stocker une valeur persistante silencieuse. | **Non** |
| **`useContext`** | Accéder à des variables globales partagées. | **Oui** (pour les composants abonnés si la valeur change) |

