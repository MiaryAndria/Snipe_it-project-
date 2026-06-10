# Documentation — Endpoints DELETE Snipe-IT

> **Base URL** : `http://localhost:3001`  
> **Base MySQL** : `snipe_it`  
> Tous les endpoints retournent du JSON.

---

## Règles générales

| Règle | Détail |
|-------|--------|
| `FOREIGN_KEY_CHECKS = 0/1` | Activé/désactivé automatiquement à chaque suppression |
| `AUTO_INCREMENT` | Remis à **1** après chaque DELETE ALL (sauf `users` → **2** pour préserver id=1) |
| Admin préservé | `DELETE /snipeit/all/users` et `DELETE /snipeit/user/:email` ne touchent **jamais** l'utilisateur `id=1` |
| Vérification dépendances | Les endpoints **unitaires** retournent `409 Conflict` si des données liées existent encore |

---

## 1. DELETE unitaire (par nom / identifiant)

### 1.1 Asset — par `asset_tag`

```
DELETE /snipeit/asset/:asset_tag
```

Supprime l'asset **et** ses `action_logs` associés.

**Exemple :**
```
DELETE http://localhost:3001/snipeit/asset/PC-001
```

**Réponse 200 :**
```json
{
  "success": true,
  "message": "Asset \"PC-001\" supprimé(e) (1 ligne(s))",
  "affectedRows": 1
}
```

**Réponse 404 :**
```json
{ "success": false, "message": "Asset \"PC-001\" introuvable" }
```

---

### 1.2 Catégorie — par `name`

```
DELETE /snipeit/category/:name
```

⚠️ Retourne `409` si des assets utilisent encore cette catégorie.

**Exemple :**
```
DELETE http://localhost:3001/snipeit/category/Desktop
```

**Réponse 409 (assets liés) :**
```json
{
  "success": false,
  "message": "Impossible de supprimer la catégorie \"Desktop\" : 4 asset(s) y sont encore rattaché(s).",
  "assets_count": 4
}
```

---

### 1.3 Fabricant — par `name`

```
DELETE /snipeit/manufacturer/:name
```

⚠️ Retourne `409` si des modèles utilisent encore ce fabricant.

**Exemple :**
```
DELETE http://localhost:3001/snipeit/manufacturer/Dell
```

**Réponse 409 (modèles liés) :**
```json
{
  "success": false,
  "message": "Impossible de supprimer le fabricant \"Dell\" : 2 modèle(s) y sont encore rattaché(s).",
  "models_count": 2
}
```

---

### 1.4 Modèle — par `name`

```
DELETE /snipeit/model/:name
```

Nettoie aussi `models_custom_fields` automatiquement.  
⚠️ Retourne `409` si des assets utilisent encore ce modèle.

**Exemple :**
```
DELETE http://localhost:3001/snipeit/model/OptiPlex%207090
```

> 💡 Encoder les espaces en `%20` ou `%20` dans l'URL.

---

### 1.5 Status Label — par `name`

```
DELETE /snipeit/status/:name
```

⚠️ Retourne `409` si des assets ont encore ce status.

**Exemple :**
```
DELETE http://localhost:3001/snipeit/status/Deployed
```

**Réponse 409 :**
```json
{
  "success": false,
  "message": "Impossible de supprimer le status \"Deployed\" : 6 asset(s) y sont encore rattaché(s).",
  "assets_count": 6
}
```

---

### 1.6 Entreprise — par `name`

```
DELETE /snipeit/company/:name
```

Nettoie aussi `company_user`. Retourne `409` si assets **ou** users liés.

**Exemple :**
```
DELETE http://localhost:3001/snipeit/company/ITUniversity
```

**Réponse 409 :**
```json
{
  "success": false,
  "message": "Impossible de supprimer l'entreprise \"ITUniversity\" : 4 asset(s) et 4 utilisateur(s) y sont encore rattaché(s).",
  "assets_count": 4,
  "users_count": 4
}
```

---

### 1.7 Utilisateur — par `email`

```
DELETE /snipeit/user/:email
```

- ❌ Refuse si `id = 1` (admin) → `403 Forbidden`
- ⚠️ Retourne `409` si des assets lui sont assignés
- Nettoie `company_user` et `users_groups` automatiquement

**Exemple :**
```
DELETE http://localhost:3001/snipeit/user/jean.rakoto%40ituniversity.mg
```

> 💡 Encoder `@` en `%40` dans l'URL.

**Réponse 403 (admin) :**
```json
{ "success": false, "message": "Impossible de supprimer le compte administrateur (id=1)" }
```

---

### 1.8 Département — par `name`

```
DELETE /snipeit/department/:name
```

⚠️ Retourne `409` si des utilisateurs sont encore dans ce département.

**Exemple :**
```
DELETE http://localhost:3001/snipeit/department/Direction
```

**Réponse 409 :**
```json
{
  "success": false,
  "message": "Impossible de supprimer le département \"Direction\" : 1 utilisateur(s) y sont encore rattaché(s).",
  "users_count": 1
}
```

---

## 2. DELETE ALL (suppression totale par entité)

> ⚠️ **Irreversible** — Ces endpoints vident **toute** la table.  
> `FOREIGN_KEY_CHECKS` est désactivé puis réactivé automatiquement.  
> `AUTO_INCREMENT` est remis à `1` (ou `2` pour `users`).

### Ordre recommandé pour un reset propre (sans erreur de FK)

```
1. DELETE /snipeit/all/assets        ← dépend de tout
2. DELETE /snipeit/all/models        ← dépend de manufacturers + categories
3. DELETE /snipeit/all/users         ← dépend de departments + companies
4. DELETE /snipeit/all/manufacturers
5. DELETE /snipeit/all/categories
6. DELETE /snipeit/all/statuses
7. DELETE /snipeit/all/companies
8. DELETE /snipeit/all/departments
```

---

### 2.1 Tous les assets

```
DELETE /snipeit/all/assets
```

Supprime aussi les `action_logs` de type `App\Models\Asset`.

**Réponse :**
```json
{
  "success": true,
  "message": "Tous les assets supprimés (9 ligne(s)). AUTO_INCREMENT remis à 1.",
  "affectedRows": 9
}
```

---

### 2.2 Toutes les catégories

```
DELETE /snipeit/all/categories
```

**Réponse :**
```json
{
  "success": true,
  "message": "Toutes les catégories supprimées (5 ligne(s)). AUTO_INCREMENT remis à 1.",
  "affectedRows": 5
}
```

---

### 2.3 Tous les fabricants

```
DELETE /snipeit/all/manufacturers
```

**Réponse :**
```json
{
  "success": true,
  "message": "Tous les fabricants supprimés (5 ligne(s)). AUTO_INCREMENT remis à 1.",
  "affectedRows": 5
}
```

---

### 2.4 Tous les modèles

```
DELETE /snipeit/all/models
```

Nettoie `models_custom_fields` automatiquement avant.

**Réponse :**
```json
{
  "success": true,
  "message": "Tous les modèles supprimés (7 ligne(s)). AUTO_INCREMENT remis à 1.",
  "affectedRows": 7
}
```

---

### 2.5 Tous les status labels

```
DELETE /snipeit/all/statuses
```

**Réponse :**
```json
{
  "success": true,
  "message": "Tous les status labels supprimés (3 ligne(s)). AUTO_INCREMENT remis à 1.",
  "affectedRows": 3
}
```

---

### 2.6 Toutes les entreprises

```
DELETE /snipeit/all/companies
```

Nettoie la table pivot `company_user` avant.

**Réponse :**
```json
{
  "success": true,
  "message": "Toutes les entreprises supprimées (2 ligne(s)). AUTO_INCREMENT remis à 1.",
  "affectedRows": 2
}
```

---

### 2.7 Tous les utilisateurs (sauf admin)

```
DELETE /snipeit/all/users
```

- Préserve `id = 1` (admin)
- `AUTO_INCREMENT` remis à **2**
- Nettoie `company_user` et `users_groups` des users supprimés

**Réponse :**
```json
{
  "success": true,
  "message": "Tous les utilisateurs supprimés sauf admin (7 ligne(s)). AUTO_INCREMENT remis à 2.",
  "affectedRows": 7,
  "preserved": "admin (id=1)"
}
```

---

### 2.8 Tous les départements

```
DELETE /snipeit/all/departments
```

**Réponse :**
```json
{
  "success": true,
  "message": "Tous les départements supprimés (5 ligne(s)). AUTO_INCREMENT remis à 1.",
  "affectedRows": 5
}
```

---

## 3. Codes de réponse

| Code | Signification |
|------|--------------|
| `200` | Succès |
| `403` | Accès refusé (ex: suppression admin) |
| `404` | Entité introuvable |
| `409` | Conflit — des dépendances existent encore |
| `500` | Erreur serveur MySQL |

---

## 4. Exemple d'utilisation avec Axios (React)

```js
import axios from 'axios'

const BASE = 'http://localhost:3001'

// Supprimer une catégorie par nom
const deleteCategory = async (name) => {
  const res = await axios.delete(`${BASE}/snipeit/category/${encodeURIComponent(name)}`)
  return res.data
}

// Supprimer tous les assets
const deleteAllAssets = async () => {
  const res = await axios.delete(`${BASE}/snipeit/all/assets`)
  return res.data
}

// Supprimer un utilisateur par email
const deleteUser = async (email) => {
  const res = await axios.delete(`${BASE}/snipeit/user/${encodeURIComponent(email)}`)
  return res.data
}
```

---

## 5. Récapitulatif de tous les endpoints DELETE

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `DELETE` | `/snipeit/asset/:asset_tag` | Supprimer un asset |
| `DELETE` | `/snipeit/category/:name` | Supprimer une catégorie |
| `DELETE` | `/snipeit/manufacturer/:name` | Supprimer un fabricant |
| `DELETE` | `/snipeit/model/:name` | Supprimer un modèle |
| `DELETE` | `/snipeit/status/:name` | Supprimer un status label |
| `DELETE` | `/snipeit/company/:name` | Supprimer une entreprise |
| `DELETE` | `/snipeit/user/:email` | Supprimer un utilisateur |
| `DELETE` | `/snipeit/department/:name` | Supprimer un département |
| `DELETE` | `/snipeit/all/assets` | Supprimer **tous** les assets |
| `DELETE` | `/snipeit/all/categories` | Supprimer **toutes** les catégories |
| `DELETE` | `/snipeit/all/manufacturers` | Supprimer **tous** les fabricants |
| `DELETE` | `/snipeit/all/models` | Supprimer **tous** les modèles |
| `DELETE` | `/snipeit/all/statuses` | Supprimer **tous** les status labels |
| `DELETE` | `/snipeit/all/companies` | Supprimer **toutes** les entreprises |
| `DELETE` | `/snipeit/all/users` | Supprimer **tous** les users (sauf admin) |
| `DELETE` | `/snipeit/all/departments` | Supprimer **tous** les départements |
