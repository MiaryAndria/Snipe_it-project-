# Duplication de formulaire complet : Création de Tickets en Masse

Ce document explique comment gérer la répétition d'un bloc complet de formulaire. Dans notre contexte, il s'agit de **créer plusieurs tickets de support en une seule fois** (création en masse/bulk). Chaque bloc contiendra le titre du ticket, sa description et sa priorité.

## Concept

Au lieu d'un seul champ, l'objet dans notre tableau `tickets` contient toutes les clés nécessaires pour créer un ticket (`titre`, `description`, `priorite`). Nous réutilisons ce modèle pour chaque nouveau ticket ajouté au formulaire.

## Exemple de Code (React)

```jsx
import React, { useState } from 'react';

const CreationTicketsMasse = () => {
  // Modèle d'un ticket de base
  const modeleTicket = { titre: '', description: '', priorite: 'Normale' };
  
  // Le state contient un tableau regroupant tous les tickets en cours de création
  const [tickets, setTickets] = useState([{ id: Date.now(), ...modeleTicket }]);

  // Ajouter un nouveau bloc pour un ticket supplémentaire
  const ajouterTicket = () => {
    setTickets([...tickets, { id: Date.now(), ...modeleTicket }]);
  };

  // Supprimer un bloc ticket entier
  const supprimerTicket = (id) => {
    setTickets(tickets.filter(ticket => ticket.id !== id));
  };

  // Met à jour le champ spécifique dans le bon ticket
  const handleChange = (id, champ, valeur) => {
    const nouveauxTickets = tickets.map(ticket => 
      ticket.id === id ? { ...ticket, [champ]: valeur } : ticket
    );
    setTickets(nouveauxTickets);
  };

  // Récupération globale des informations de tous les tickets
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Liste des tickets à créer en base :", tickets);
    // Envoi de la grappe de tickets vers l'API POST /import/tickets ou boucle POST /tickets
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      <h2>Création de Tickets en Masse</h2>
      {tickets.map((ticket, index) => (
        <div key={ticket.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <h4>Nouveau Ticket #{index + 1}</h4>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Titre du ticket :</label>
            <input 
              type="text" 
              value={ticket.titre} 
              onChange={(e) => handleChange(ticket.id, 'titre', e.target.value)} 
              style={{ width: '100%', padding: '5px' }}
              placeholder="Ex: Problème connexion VPN"
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Description :</label>
            <textarea 
              value={ticket.description} 
              onChange={(e) => handleChange(ticket.id, 'description', e.target.value)} 
              style={{ width: '100%', padding: '5px', minHeight: '60px' }}
              placeholder="Détail du problème..."
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontWeight: 'bold' }}>Priorité :</label>
            <select 
              value={ticket.priorite} 
              onChange={(e) => handleChange(ticket.id, 'priorite', e.target.value)}
              style={{ padding: '5px' }}
            >
              <option value="Basse">Basse</option>
              <option value="Normale">Normale</option>
              <option value="Haute">Haute</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>

          {/* Bouton pour supprimer le ticket entier */}
          {tickets.length > 1 && (
            <button type="button" onClick={() => supprimerTicket(ticket.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px' }}>
              - Annuler ce ticket
            </button>
          )}
        </div>
      ))}
      
      <div style={{ marginTop: '15px', display: 'flex', gap: '15px' }}>
        <button type="button" onClick={ajouterTicket} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '3px' }}>
          + Ajouter un autre ticket
        </button>
        <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '3px', fontWeight: 'bold' }}>
          Valider la création de tous les tickets
        </button>
      </div>
    </form>
  );
};

export default CreationTicketsMasse;
```

## Structure des données récupérées
A la soumission, vous aurez un tableau contenant les détails complets de chaque ticket prêt à être créé :
```json
[
  { 
    "id": 1686231456001, 
    "titre": "Problème connexion VPN", 
    "description": "Impossible de se connecter au VPN depuis ce matin.", 
    "priorite": "Haute" 
  },
  { 
    "id": 1686231460020, 
    "titre": "Demande souris sans fil", 
    "description": "Besoin d'une souris pour le bureau.", 
    "priorite": "Basse" 
  }
]
```
