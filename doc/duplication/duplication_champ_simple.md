# Duplication d'un champ simple : Ajout de Tags à un Ticket

Ce document explique comment gérer la duplication d'un champ simple dans le contexte de la **création d'un ticket de support**. Ici, nous allons permettre à l'utilisateur d'ajouter plusieurs tags (mots-clés) à son ticket en utilisant des boutons Plus (+) et Moins (-).

## Concept

Nous utilisons un tableau d'objets dans le state local (`useState`) pour stocker chaque tag. Chaque objet possède un identifiant unique (`id`) généré via `Date.now()` pour gérer les suppressions.

## Exemple de Code (React)

```jsx
import React, { useState } from 'react';

const CreationTicketTags = () => {
  // Initialiser avec un seul tag vide
  const [tags, setTags] = useState([{ id: Date.now(), valeur: '' }]);

  // Fonction pour ajouter un nouveau champ tag à la fin
  const ajouterTag = () => {
    setTags([...tags, { id: Date.now(), valeur: '' }]);
  };

  // Fonction pour supprimer un tag spécifique via son ID
  const supprimerTag = (id) => {
    setTags(tags.filter(tag => tag.id !== id));
  };

  // Mettre à jour la valeur du tag modifié
  const handleChange = (id, event) => {
    const nouveauxTags = tags.map(tag => 
      tag.id === id ? { ...tag, valeur: event.target.value } : tag
    );
    setTags(nouveauxTags);
  };

  // Récupération des informations à la soumission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Tags du ticket à envoyer à l'API :", tags);
    // Vous pouvez envoyer la variable 'tags' à votre API ici
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', border: '1px solid #ddd' }}>
      <h3>Ajouter des Tags au Ticket</h3>
      {tags.map((tag, index) => (
        <div key={tag.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input 
            type="text" 
            value={tag.valeur} 
            onChange={(e) => handleChange(tag.id, e)} 
            placeholder="Ex: Réseau, Urgent, Panne"
            style={{ marginRight: '10px', padding: '5px' }}
          />
          
          {/* Bouton pour supprimer : Affiché seulement s'il y a plus d'un champ */}
          {tags.length > 1 && (
            <button type="button" onClick={() => supprimerTag(tag.id)} style={{ marginRight: '5px', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px' }}>
              -
            </button>
          )}

          {/* Bouton pour ajouter : Affiché seulement sur la dernière ligne */}
          {index === tags.length - 1 && (
            <button type="button" onClick={ajouterTag} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px' }}>
              +
            </button>
          )}
        </div>
      ))}
      <button type="submit" style={{ marginTop: '10px', padding: '8px 15px' }}>Enregistrer les tags</button>
    </form>
  );
};

export default CreationTicketTags;
```

## Structure des données récupérées
Lors de la validation, les données récupérées dans la console ressembleront à ceci et seront prêtes pour l'API :
```json
[
  { "id": 1686231456001, "valeur": "Panne Serveur" },
  { "id": 1686231460020, "valeur": "Urgent" }
]
```
