# 📦 Guide Complet Snipe-IT — Modules Principaux & API

> Snipe-IT est un système de gestion d'assets open source basé sur Laravel.  
> Ce guide couvre les modules principaux, le fonctionnement de l'API REST, et les patterns d'intégration avec une NewApp React.

---

## 🗂️ Table des matières

1. [Modules principaux](#modules-principaux)
2. [Affichage conditionnel React](#affichage-conditionnel-react)
3. [Paramètres URL avec Axios](#paramètres-url-avec-axios)
4. [Checkout & Checkin](#checkout--checkin)
5. [Components dans un Asset](#components-dans-un-asset)
6. [Kits (Bundles)](#kits-bundles)
7. [Export CSV](#export-csv)
8. [Import CSV](#import-csv)
9. [Reset des données](#reset-des-données)

---

## Modules principaux

Snipe-IT organise ses données en plusieurs modules distincts :

| Module | Description | Endpoint API |
|--------|-------------|--------------|
| **Assets (Hardware)** | Équipements physiques tracés individuellement | `/api/v1/hardware` |
| **Licenses** | Licences logicielles avec seats | `/api/v1/licenses` |
| **Accessories** | Accessoires réutilisables (souris, clavier…) | `/api/v1/accessories` |
| **Consumables** | Consommables (câbles, cartouches…) | `/api/v1/consumables` |
| **Components** | Composants internes d'un asset (RAM, SSD…) | `/api/v1/components` |
| **Users** | Utilisateurs du système | `/api/v1/users` |
| **Locations** | Emplacements physiques | `/api/v1/locations` |
| **Manufacturers** | Fabricants | `/api/v1/manufacturers` |
| **Models** | Modèles d'assets | `/api/v1/models` |
| **Categories** | Catégories d'assets | `/api/v1/categories` |
| **Suppliers** | Fournisseurs | `/api/v1/suppliers` |
| **Depreciations** | Règles de dépréciation | `/api/v1/depreciations` |

### Authentification API

Tous les appels API nécessitent un token Bearer :

```http
Authorization: Bearer VOTRE_API_TOKEN
Accept: application/json
Content-Type: application/json
```

Générer un token : `Snipe-IT → Profil (en haut à droite) → API Keys → Create`

---

## Affichage conditionnel React

Petite remarque de condition dans le return d'un composant React :

```jsx
(condition) ? (reponse_condition_vraie) : (reponse_condition_faux)
```

Exemple concret :

```jsx
{isLoading ? <Spinner /> : <AssetList data={assets} />}

{error ? <ErrorMessage msg={error} /> : null}

{assets.length > 0 ? (
  <table>...</table>
) : (
  <p>Aucun asset trouvé</p>
)}
```

---

## Paramètres URL avec Axios

### Trier par asset tag

```javascript
const response = await api_service.get('/hardware', {
    params: {
        sort: 'asset_tag',
        order: 'asc'
    }
})
```

URL générée : `/hardware?sort=asset_tag&order=asc`

### Filtrer par catégorie

La doc indique le paramètre : `category_id`

```javascript
const response = await api_service.get('/hardware', {
    params: {
        category_id: 1
    }
})
```

URL : `/hardware?category_id=1`

### Filtrer par localisation

```javascript
const response = await api_service.get('/hardware', {
    params: {
        location_id: 20
    }
})
```

URL : `/hardware?location_id=20`

### Combiner plusieurs paramètres

Tu peux en mettre autant que tu veux :

```javascript
const response = await api_service.get('/hardware', {
    params: {
        limit: 50,
        offset: 100,
        category_id: 1,
        manufacturer_id: 4,
        sort: 'asset_tag',
        order: 'asc'
    }
})
```

Axios envoie :

```
/hardware?limit=50&offset=100&category_id=1&manufacturer_id=4&sort=asset_tag&order=asc
```

### Paramètres de pagination courants

| Paramètre | Rôle | Exemple |
|-----------|------|---------|
| `limit` | Nombre de résultats par page | `50` |
| `offset` | Point de départ | `100` |
| `sort` | Colonne de tri | `asset_tag`, `name`, `created_at` |
| `order` | Sens du tri | `asc`, `desc` |
| `search` | Recherche textuelle | `"Dell"` |
| `status_id` | Filtrer par statut | `1` |
| `category_id` | Filtrer par catégorie | `3` |
| `location_id` | Filtrer par localisation | `20` |
| `manufacturer_id` | Filtrer par fabricant | `4` |

### Quand ne pas utiliser params ?

Si l'API attend des données dans le corps de la requête (POST, PUT, PATCH) :

```javascript
await api_service.post('/hardware', {
    asset_tag: '12345',
    serial: 'ABC123'
})
```

### Mais malgré ça on peut aussi ajouter params dans une requête POST, PUT, DELETE, etc.

```javascript
await api_service.post('/hardware', {
    asset_tag: '12345',
    serial: 'ABC123'
}, {
    params: {
        manufacturer_id: 4
    }
})
```

Cela envoie :

```
POST /hardware?manufacturer_id=4
```

avec dans le body :

```json
{
  "asset_tag": "12345",
  "serial": "ABC123"
}
```

### Règle pratique

| Méthode | Données dans |
|---------|-------------|
| `params` | URL (`?limit=50&offset=0`) |
| Body | Création ou modification de ressource |

Donc pour Snipe-IT :

- `GET /hardware` → **params**
- `POST /hardware`, `PUT /hardware/:id`, `PATCH /hardware/:id` → **body** (et éventuellement params si la documentation le demande explicitement)

En résumé, `params` n'est pas réservé à GET, mais c'est avec GET qu'on l'utilise le plus souvent.

---

## Checkout & Checkin

### Assets — Checkout vers user / location / asset

```
# Assets
checkout vers : user / location / asset

# Licences
checkout vers : user / asset

# Accessoires
checkout vers : user / location / asset  (qty à remplir)

# Consumables
checkout vers : user  (qty à remplir)

# Components
checkout vers : asset  (qty à remplir)
```

### Scénario UI classique — Checkout

Le scénario classique dans la NewApp React :

1. L'utilisateur voit la liste des assets
2. Il clique sur **Checkout** pour un asset
3. La modal s'ouvre (`setModal(true)`)
4. Dans la modal, il choisit : **User**, **Location** ou **Asset**
5. Selon son choix, les champs affichés changent dynamiquement
6. Il clique sur **Valider** → appel API POST

```javascript
// Endpoint checkout asset
POST /api/v1/hardware/{id}/checkout

// Body selon le type de destination
{
  "checkout_to_type": "user",   // "user" | "location" | "asset"
  "assigned_user": 5,           // si checkout vers user
  "assigned_location": 12,      // si checkout vers location
  "assigned_asset": 99,         // si checkout vers asset
  "note": "Checkout note"
}
```

### Scénario UI classique — Checkin

Il clique sur **Checkin** pour un asset → une modal s'ouvre → dans la modal il choisit **status**, **location** et **note** :

```javascript
// Endpoint checkin asset
POST /api/v1/hardware/{id}/checkin

// Body
{
  "status_id": 1,
  "location_id": 12,
  "note": "Retour après utilisation"
}
```

### Endpoints Checkout/Checkin par module

| Module | Checkout | Checkin |
|--------|----------|---------|
| Assets | `POST /hardware/{id}/checkout` | `POST /hardware/{id}/checkin` |
| Licenses | `POST /licenses/{id}/checkout` | `POST /licenses/{id}/checkin` |
| Accessories | `POST /accessories/{id}/checkout` | `POST /accessories/{id}/checkin` |
| Consumables | `POST /consumables/{id}/checkout` | *(consommé, pas de checkin)* |
| Components | `POST /components/{id}/checkout` | `POST /components/{id}/checkin` |

---

## Components dans un Asset

Les components sont des **pièces internes** d'un asset (RAM, SSD, batterie…). Contrairement aux assets, ils n'ont pas de numéro de série propre ni de valeur indépendante.

```
Assets → Components → Checkout to Asset
```

```javascript
// Checkout d'un component vers un asset
POST /api/v1/components/{id}/checkout

{
  "assigned_to": 99,   // id de l'asset parent
  "quantity": 1,
  "note": "Ajout RAM"
}
```

### Différence Assets vs Components

| | Asset → Asset | Component |
|---|---|---|
| Numéro de série propre | ✅ Oui | ❌ Non |
| Traçable indépendamment | ✅ Oui | ❌ Non |
| Valeur / dépréciation propre | ✅ Oui | ❌ Non |
| Usage typique | Équipement réutilisable | Pièce consommable interne |

---

## Kits (Bundles)

Les Kits permettent de **grouper plusieurs assets, accessories et components** pour les checkout ensemble en une seule opération.

```
Kits → Create Kit → Update Kit → Add Items
```

Exemple de kit :

```
Kit : "Poste de travail complet"
  └── Asset    : Laptop
  └── Accessory: Souris
  └── Accessory: Clavier
  └── Component: Câble HDMI
```

```javascript
// Créer un kit
POST /api/v1/kits
{ "name": "Poste de travail complet" }

// Ajouter un modèle au kit
POST /api/v1/kits/{kit_id}/models
{ "model_id": 6, "quantity": 1 }

// Ajouter un accessoire au kit
POST /api/v1/kits/{kit_id}/accessories
{ "accessory_id": 3, "quantity": 1 }

// Checkout du kit entier vers un user
POST /api/v1/kits/{kit_id}/checkout
{ "assigned_to": 5 }
```

---

## Export CSV

**Il n'existe pas de endpoint API dédié à l'export CSV dans Snipe-IT.**

```http
GET /api/v1/hardware/export  ❌  n'existe pas
GET /api/v1/export           ❌  n'existe pas
```

### Option 1 — Via l'interface UI

Chaque section a un bouton Export natif qui télécharge un CSV directement.

### Option 2 — Via la NewApp React (à construire)

Puisqu'il n'y a pas d'endpoint export, la NewApp doit construire cette fonctionnalité :

```
NewApp React
    ↓
1. GET /api/v1/hardware  →  données JSON
    ↓
2. Conversion JSON → CSV côté React
    ↓
3. Déclenchement du téléchargement
```

```javascript
import Papa from 'papaparse'

const exportCSV = (data) => {
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'assets_export.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
```

---

## Import CSV

De même, **il n'existe pas de endpoint API dédié à l'import CSV dans Snipe-IT.**

```http
POST /api/v1/hardware/import  ❌  n'existe pas
POST /api/v1/import/csv       ❌  n'existe pas
```

### Option 1 — Via l'interface UI native

```
Settings → Import → Upload CSV
```

Supporte : Assets, Users, Accessories, Consumables, Components.

### Option 2 — Via la NewApp React (ligne par ligne)

La bonne approche : **parser le CSV puis POST chaque ligne vers l'API** :

```
1. Upload CSV dans React
        ↓
2. Parser le CSV (lire chaque ligne/colonne)
        ↓
3. Pour chaque ligne → POST /api/v1/hardware
        ↓
4. Afficher résultat (succès / erreur par ligne)
```

```javascript
import Papa from 'papaparse'

// Étape 1 : Parser le CSV
const parseCSV = (file) => {
  Papa.parse(file, {
    header: true,         // première ligne = noms des colonnes
    skipEmptyLines: true,
    complete: (results) => {
      importRows(results.data)
    }
  })
}

// Étape 2 : POST chaque ligne vers l'API Snipe-IT
const importRows = async (rows) => {
  const results = []
  for (const row of rows) {
    try {
      const res = await axios.post('/api/v1/hardware', {
        name:      row['name'],
        asset_tag: row['asset_tag'],
        status_id: row['status_id'],
        model_id:  row['model_id'],
        serial:    row['serial'],
      }, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      })
      results.push({ tag: row['asset_tag'], status: 'success' })
    } catch (error) {
      results.push({ tag: row['asset_tag'], status: 'error', message: error.message })
    }
  }
  return results
}
```

### Format CSV attendu

```csv
name,asset_tag,status_id,model_id,serial
Laptop Dell,TAG001,1,6,ABC123
Laptop HP,TAG002,1,6,DEF456
```

### Champs obligatoires pour POST /api/v1/hardware

| Champ | Obligatoire |
|-------|-------------|
| `asset_tag` | ✅ |
| `status_id` | ✅ |
| `model_id` | ✅ |
| `name` | ❌ optionnel |
| `serial` | ❌ optionnel |
| `purchase_date` | ❌ optionnel |
| `purchase_cost` | ❌ optionnel |
| `location_id` | ❌ optionnel |

---

## Reset des données

Le reset se fait via un **serveur Node.js Express** qui accède directement à la base SQLite de Snipe-IT.

### Stratégie de reset

| Tables supprimées | Tables conservées |
|-------------------|-------------------|
| assets, licenses, accessories… | `users WHERE id = 1` (admin) |
| action_logs, maintenances… | `oauth_access_tokens` (tokens API) |
| categories, models, manufacturers… | `oauth_*` (toutes les tables OAuth) |
| sqlite_sequence (reset auto-increment) | `personal_access_tokens` |

> ⚠️ Les tokens OAuth/API sont **intentionnellement conservés** pour que la NewApp React continue à fonctionner après le reset sans régénérer de token.

### Ordre de suppression important

L'ordre respecte les **contraintes de foreign keys** :

```
1. Logs (action_logs, asset_logs...)
2. Relations (components_assets, accessories_checkout...)
3. Entités principales (assets, licenses...)
4. Référentiels (models, categories, manufacturers...)
5. Users (sauf admin id=1)
6. sqlite_sequence (reset auto-increment)
```

### Endpoint du serveur de reset

```javascript
DELETE http://localhost:3001/reset/data
```

Réponse succès :

```json
{
  "success": true,
  "message": "Reset complet effectué"
}
```

### Appel depuis React

```javascript
const handleReset = async () => {
  if (!window.confirm('Confirmer le reset complet ?')) return
  try {
    const res = await axios.delete('http://localhost:3001/reset/data')
    alert(res.data.message)
  } catch (err) {
    alert('Erreur lors du reset : ' + err.message)
  }
}
```

---

## 🔗 Ressources

- [Documentation officielle API Snipe-IT](https://snipe-it.readme.io/reference)
- [Code source GitHub](https://github.com/snipe/snipe-it)
- [Téléchargement v8.6.1](https://snipeitapp.com/download)