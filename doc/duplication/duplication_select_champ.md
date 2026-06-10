# Duplication Select + Champ : Lier des Assets à un Ticket

Ce document explique comment dupliquer un groupe constitué d'une liste déroulante (`select`) et d'un champ texte (`input`) dans le contexte de la **création d'un ticket**. L'objectif est d'associer un ou plusieurs équipements (Assets) au ticket en précisant le type d'équipement et son Asset Tag (identifiant).

## Concept

Chaque ligne représente un Asset lié au ticket. Elle est stockée sous forme d'un objet contenant `id`, `type_asset` (pour le select) et `asset_tag` (pour l'input).

## Exemple de Code (React)

```jsx
import React, { useState } from 'react';

const LierAssetsTicket = () => {
  // Initialiser avec une ligne vide pour l'ajout d'asset
  const [assets, setAssets] = useState([{ id: Date.now(), type_asset: '', asset_tag: '' }]);

  // Ajouter un nouvel équipement
  const ajouterAsset = () => {
    setAssets([...assets, { id: Date.now(), type_asset: '', asset_tag: '' }]);
  };

  // Supprimer la ligne ciblée par son ID
  const supprimerAsset = (id) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  // Mettre à jour dynamiquement le select ou l'input
  const handleChange = (id, nomChamp, valeurChamp) => {
    const nouveauxAssets = assets.map(asset => 
      asset.id === id ? { ...asset, [nomChamp]: valeurChamp } : asset
    );
    setAssets(nouveauxAssets);
  };

  // Récupération des informations à la soumission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Assets liés au ticket prêts pour l'envoi :", assets);
    // Données prêtes pour l'API POST /tickets
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', border: '1px solid #ddd' }}>
      <h3>Équipements (Assets) concernés par le Ticket</h3>
      {assets.map((asset, index) => (
        <div key={asset.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
          
          <select 
            value={asset.type_asset} 
            onChange={(e) => handleChange(asset.id, 'type_asset', e.target.value)}
            style={{ padding: '5px' }}
          >
            <option value="">Sélectionner le type</option>
            <option value="PC">PC / Ordinateur</option>
            <option value="Ecran">Écran</option>
            <option value="Imprimante">Imprimante</option>
            <option value="Autre">Autre</option>
          </select>

          <input 
            type="text" 
            value={asset.asset_tag} 
            onChange={(e) => handleChange(asset.id, 'asset_tag', e.target.value)} 
            placeholder="Asset Tag (ex: PC-001)"
            style={{ padding: '5px' }}
          />

          {/* Bouton Moins */}
          {assets.length > 1 && (
            <button type="button" onClick={() => supprimerAsset(asset.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px' }}>
              -
            </button>
          )}

          {/* Bouton Plus */}
          {index === assets.length - 1 && (
            <button type="button" onClick={ajouterAsset} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px' }}>
              +
            </button>
          )}
        </div>
      ))}
      <button type="submit" style={{ marginTop: '10px', padding: '8px 15px' }}>Lier les assets au ticket</button>
    </form>
  );
};

export default LierAssetsTicket;
```

## Structure des données récupérées
A la soumission, l'API recevra les assets concernés sous cette forme :
```json
[
  { "id": 1686231456001, "type_asset": "PC", "asset_tag": "PC-IT-045" },
  { "id": 1686231460020, "type_asset": "Ecran", "asset_tag": "ECR-IT-012" }
]
```
