# Guide de Référence : Boutons et Actions Utilisateur (Style Noir & Blanc)

Ce document fournit un guide de référence et de bonnes pratiques pour créer, styliser et manipuler tous les types de boutons et d'actions utilisateur (chargement, désactivation, modales de confirmation) en React, avec une esthétique épurée haut de gamme (style monochrome Muji/Aesop).

---

## 1. Palette de Styles Minimaliste Noir & Blanc (CSS)
Voici les classes CSS de référence à utiliser ou à ajouter dans votre feuille de style (`admin_style.css` ou `client_style.css`) pour des boutons parfaits :

```css
/* --- BOUTON PRIMAIRE (Fond noir, texte blanc) --- */
.btn-primary {
    background-color: #000000;
    color: #ffffff;
    border: 2px solid #000000;
    padding: 10px 20px;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 2px;
}
.btn-primary:hover:not(:disabled) {
    background-color: #ffffff;
    color: #000000;
}

/* --- BOUTON OUTLINE / SECONDAIRE (Fond blanc, bordure noire) --- */
.btn-outline {
    background-color: #ffffff;
    color: #000000;
    border: 2px solid #000000;
    padding: 10px 20px;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 2px;
}
.btn-outline:hover:not(:disabled) {
    background-color: #000000;
    color: #ffffff;
}

/* --- ÉTAT DÉSACTIVÉ (DISABLED) --- */
button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}
```

---

## 2. Gérer l'état de Chargement (Loading State)
Lorsqu'une action asynchrone est en cours (ex: appel API, import d'images), il est crucial de désactiver le bouton et de donner un retour visuel pour empêcher l'utilisateur de cliquer plusieurs fois.

### Code Exemple :
```jsx
import { useState } from 'react';

function BoutonChargement() {
    const [charge, setCharge] = useState(false);

    const gererAction = async () => {
        setCharge(true);
        // Simulation d'un appel API de 3 secondes
        await new Promise(resolve => setTimeout(resolve, 3000));
        setCharge(false);
        alert("Action accomplie !");
    };

    return (
        <button 
            className="btn-primary"
            onClick={gererAction}
            disabled={charge} // Empêche le double clic
        >
            {charge ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    {/* Micro-animation CSS de chargement */}
                    <span className="spinner-minimal" />
                    Chargement en cours...
                </span>
            ) : "Lancer l'import"}
        </button>
    );
}
```

*Ajoutez ceci dans votre CSS pour la micro-animation du chargement :*
```css
.spinner-minimal {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top: 2px solid #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

---

## 3. Modales de Confirmation (Actions Critiques)
Pour les actions destructrices ou critiques (ex: réinitialiser la base, annuler une commande), il est recommandé de demander une confirmation avant d'exécuter l'action.

### Code Exemple :
```jsx
import { useState } from 'react';

function SuppressionCommande() {
    const [afficheModale, setAfficheModale] = useState(false);

    const executerSuppression = () => {
        setAfficheModale(false);
        alert("La commande a été définitivement annulée.");
    };

    return (
        <div>
            {/* Bouton d'action initial */}
            <button 
                className="btn-outline" 
                style={{ borderColor: '#dc2626', color: '#dc2626' }} // Style d'avertissement rouge
                onClick={() => setAfficheModale(true)}
            >
                Annuler la commande
            </button>

            {/* --- MODALE DE CONFIRMATION NOIR & BLANC --- */}
            {afficheModale && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{
                        width: '400px', padding: '24px', background: '#fff', border: '2px solid #000',
                        borderRadius: '2px', textAlign: 'center'
                    }}>
                        <h3 style={{ textTransform: 'uppercase', letterSpacing: '1px', marginTop: 0 }}>
                            Êtes-vous sûr ?
                        </h3>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '24px' }}>
                            Cette action est irréversible et annulera définitivement la commande sélectionnée.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            {/* Annuler */}
                            <button 
                                className="btn-outline" 
                                onClick={() => setAfficheModale(false)}
                            >
                                Retour
                            </button>
                            
                            {/* Confirmer */}
                            <button 
                                className="btn-primary" 
                                style={{ backgroundColor: '#000', color: '#fff' }}
                                onClick={executerSuppression}
                            >
                                Oui, Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
```

---

## Règle d'or de l'expérience utilisateur (UX)
* **Disabled State** : Un bouton désactivé doit toujours avoir un curseur `not-allowed` et une opacité réduite pour indiquer immédiatement qu'il n'est pas cliquable.
* **Loading State** : Ne vous contentez pas de désactiver le bouton, changez son texte (ex: de "Valider" à "Traitement...") pour rassurer l'utilisateur que le système travaille.
* **Style Monochrome** : Préservez l'esthétique minimaliste en évitant les dégradés ou les ombres. Jouez sur l'inversion Noir/Blanc au survol pour créer une sensation haut de gamme et réactive.
