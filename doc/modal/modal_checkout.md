# Création d'une Modale : Exemple d'un Checkout d'Asset (Composant Unique)

Ce document illustre comment gérer l'ouverture d'une modale suite à un clic sur un bouton d'action (ex: **"Checkout"**) directement **au sein du même composant**.

Plutôt que de créer un composant séparé, nous utilisons un affichage conditionnel `{isModalOpen && ( ... )}` dans le JSX pour faire apparaître la modale par-dessus le contenu.

## Scénario

1. L'utilisateur est sur la liste des équipements (Assets).
2. Il clique sur le bouton "Checkout" d'un équipement. Cela déclenche `handleCheckout` qui ouvre la modale (`setIsModalOpen(true)`).
3. La modale s'affiche par-dessus l'écran (grâce au rendu conditionnel). Elle contient un formulaire pour saisir à qui on attribue l'équipement et la date.
4. L'utilisateur valide le formulaire. Cela déclenche la soumission (envoi à l'API) et ferme la modale (`setIsModalOpen(false)`).

## Exemple de Code (React)

```jsx
import React, { useState } from 'react';

const PageAssets = () => {
  // L'état qui contrôle l'ouverture et la fermeture de la modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // L'état pour mémoriser l'équipement actuellement sélectionné pour le checkout
  const [selectedAsset, setSelectedAsset] = useState(null);

  // États internes au formulaire de la modale
  const [assignedTo, setAssignedTo] = useState('');
  const [checkoutDate, setCheckoutDate] = useState('');

  // 1. Fonction déclenchée au clic sur le bouton "Checkout" dans le tableau
  const handleCheckout = (asset) => {
    setSelectedAsset(asset); // On garde en mémoire quel équipement on traite
    setIsModalOpen(true);    // On OUVRE la modale (affichage conditionnel)
  };

  // 2. Fonction déclenchée quand le formulaire de la modale est validé
  const validerCheckout = (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    
    console.log("Validation du checkout pour l'asset :", selectedAsset.name);
    console.log("Assigné à :", assignedTo, "Date :", checkoutDate);
    
    // TODO: Appel API (ex: axios.post('/hardware/.../checkout', { assignedTo, checkoutDate }))
    
    // Une fois terminé, on ferme la modale et on réinitialise les champs
    setIsModalOpen(false);
    setSelectedAsset(null);
    setAssignedTo('');
    setCheckoutDate('');
  };

  // 3. Fonction pour annuler et fermer la modale sans sauvegarder
  const annulerCheckout = () => {
    setIsModalOpen(false);
    setSelectedAsset(null);
    setAssignedTo('');
    setCheckoutDate('');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Liste des Équipements</h1>
      
      {/* Exemple d'une ligne dans un tableau d'équipements */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <span><strong>PC Portable Dell XPS</strong> (Tag: DELL-001)</span>
        
        {/* Le clic déclenche handleCheckout */}
        <button 
          onClick={() => handleCheckout({ id: 1, name: 'PC Portable Dell XPS' })} 
          style={{ backgroundColor: '#ffc107', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Faire un Checkout
        </button>
      </div>

      {/* ========================================== */}
      {/* AFFICHAGE CONDITIONNEL DE LA MODALE        */}
      {/* ========================================== */}
      {isModalOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>Checkout de l'équipement : {selectedAsset?.name}</h2>
            
            <form onSubmit={validerCheckout}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Assigné à (Nom) :</label>
                <input 
                  type="text" 
                  value={assignedTo} 
                  onChange={(e) => setAssignedTo(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '8px' }}
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Date de Checkout :</label>
                <input 
                  type="date" 
                  value={checkoutDate} 
                  onChange={(e) => setCheckoutDate(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={annulerCheckout} style={styles.btnAnnuler}>
                  Annuler
                </button>
                <button type="submit" style={styles.btnValider}>
                  Valider le Checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styles CSS basiques pour la Modale ---
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modal: {
    backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '450px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  btnAnnuler: {
    backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer'
  },
  btnValider: {
    backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer'
  }
};

export default PageAssets;
```

## Explication du flux

1. **`handleCheckout`** : On donne à la fonction l'objet concerné (l'asset). On le stocke dans le state `selectedAsset` pour pouvoir l'afficher. Puis on passe `isModalOpen` à `true`.
2. **Affichage Conditionnel (`isModalOpen && ...`)** : Parce que l'état passe à `true`, le bloc HTML de la modale (`<div style={styles.overlay}>...`) est ajouté dynamiquement au DOM.
3. **Saisie** : L'utilisateur remplit les inputs qui modifient directement les states `assignedTo` et `checkoutDate` du composant.
4. **`validerCheckout` / `annulerCheckout`** : À la soumission ou à l'annulation, on traite la requête, on vide les champs de saisie, et on repasse `isModalOpen` à `false` ce qui fait instantanément disparaître la modale.
